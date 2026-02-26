import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamTotp from 'steam-totp';
import dotenv from 'dotenv';
dotenv.config();

class SteamBot {
    constructor() {
        this.client = new SteamUser();
        this.community = new SteamCommunity();
        this.manager = new TradeOfferManager({
            steam: this.client,
            community: this.community,
            language: 'en'
        });

        this.isLoggedIn = false;
        this.credentials = {
            accountName: process.env.BOT_USERNAME,
            password: process.env.BOT_PASSWORD,
            sharedSecret: process.env.BOT_SHARED_SECRET,
            identitySecret: process.env.BOT_IDENTITY_SECRET
        };
    }

    async logIn() {
        if (!this.credentials.accountName || !this.credentials.password) {
            console.warn("[BOT] Credenciales de bot no configuradas en .env. El bot no se iniciará.");
            return;
        }

        console.log(`[BOT] Intentando iniciar sesión como ${this.credentials.accountName}...`);

        this.client.logOn({
            accountName: this.credentials.accountName,
            password: this.credentials.password,
            twoFactorCode: SteamTotp.generateAuthCode(this.credentials.sharedSecret)
        });

        this.client.on('loggedOn', () => {
            console.log("[BOT] Sesión iniciada en Steam correctamente.");
        });

        this.client.on('webSession', (sessionID, cookies) => {
            this.manager.setCookies(cookies);
            this.community.setCookies(cookies);
            this.isLoggedIn = true;
            console.log("[BOT] WebSession establecida y cookies configuradas.");
        });

        this.client.on('error', (err) => {
            console.error("[BOT] Error fatal:", err);
            this.isLoggedIn = false;
        });
    }

    /**
     * Envía una oferta de intercambio a un usuario
     * @param {string} partnerSteamID64 
     * @param {string} token 
     * @param {string} itemMarketHashName 
     */
    async sendWithdrawOffer(partnerSteamID64, token, itemMarketHashName) {
        if (!this.isLoggedIn) {
            throw new Error("El bot no ha iniciado sesión.");
        }

        return new Promise((resolve, reject) => {
            this.manager.getUserInventoryContents(this.client.steamID, 730, 2, true, (err, inventory) => {
                if (err) return reject(err);

                // Buscar el objeto por nombre
                const item = inventory.find(i => i.market_hash_name === itemMarketHashName);
                if (!item) {
                    return reject(new Error(`El bot no tiene el objeto: ${itemMarketHashName}`));
                }

                const offer = this.manager.createOffer(partnerSteamID64, token);
                offer.addMyItem(item);
                offer.setMessage(`Retiro de SkinMarket: ${itemMarketHashName}`);

                offer.send((err, status) => {
                    if (err) return reject(err);

                    if (status === 'pending') {
                        console.log(`[BOT] Oferta #${offer.id} enviada, esperando confirmación 2FA...`);
                        this.community.acceptConfirmationForObject(this.credentials.identitySecret, offer.id, (err) => {
                            if (err) {
                                console.error(`[BOT] Error al confirmar oferta #${offer.id}:`, err);
                                return reject(err);
                            }
                            console.log(`[BOT] Oferta #${offer.id} confirmada automáticamente.`);
                            resolve(offer.id);
                        });
                    } else {
                        console.log(`[BOT] Oferta #${offer.id} enviada directamente.`);
                        resolve(offer.id);
                    }
                });
            });
        });
    }
}

export default new SteamBot();
