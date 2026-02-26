import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { API_URL } from "../context/AuthContext";

const TabButton = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            padding: "15px 10px",
            background: active ? "rgba(245, 172, 59, 0.1)" : "transparent",
            border: "none",
            borderBottom: active ? "2px solid #f5ac3b" : "2px solid transparent",
            color: active ? "#f5ac3b" : "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontWeight: "900",
            fontSize: "0.75rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
        }}
    >
        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
        {label}
    </button>
);

export default function RechargeModal({ open, onClose }) {
    const [activeTab, setActiveTab] = useState("steam");
    const { user, updateUser, depositSkins, addToBalance } = useAuth();
    const [steamId, setSteamId] = useState(user?.steam_id || "");
    const [steamSkins, setSteamSkins] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [giftCode, setGiftCode] = useState("");
    const [success, setSuccess] = useState(null);
    const [cryptoData, setCryptoData] = useState(null);
    const [cardData, setCardData] = useState({ number: "", holder: "", expiry: "", cvc: "", amount: "10" });

    useEffect(() => {
        if (open && user?.steam_id) {
            setSteamId(user.steam_id);
            fetchSteamInventory(user.steam_id);
        }
    }, [open, user?.steam_id]);

    const fetchSteamInventory = async (idOveride = null) => {
        let finalSteamId = (idOveride || steamId).trim();
        if (!finalSteamId) return;

        // Si es una URL de intercambio, extraer el partner ID y convertirlo a SteamID64
        const partnerMatch = finalSteamId.match(/partner=(\d+)/);
        if (partnerMatch) {
            const partnerId = partnerMatch[1];
            finalSteamId = (BigInt(partnerId) + BigInt("76561197960265728")).toString();
            console.log("Parsed SteamID64 from trade URL:", finalSteamId);
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/steam-inventory/${finalSteamId}`);
            const data = await res.json();

            if (res.ok) {
                if (Array.isArray(data) && data.length > 0) {
                    setSteamSkins(data);
                } else {
                    alert("No se encontraron objetos en este inventario. Es posible que esté vacío o que necesites cambiar la privacidad a PÚBLICO.");
                }
            } else {
                alert(data.error || "Error al cargar el inventario.");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const generateCryptoAddress = (coin) => {
        setLoading(true);
        setTimeout(() => {
            const addresses = {
                'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                'ETH': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                'LTC': 'LURJ5XvU4DkM3P3M9TfQp9YQ9YQ9YQ9YQ9YQ9',
                'USDT': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                'SOL': '7Y4p742d35Cc6634C0532925a3b844Bc454e4438f44e'
            };
            setCryptoData({ coin, address: addresses[coin] || 'ADDRESS_NOT_FOUND' });
            setLoading(false);
        }, 1000);
    };

    if (!open) return null;

    const handleDeposit = async () => {
        const total = selectedItems.reduce((acc, s) => acc + s.price, 0);
        setLoading(true);
        const saved = await addToBalance(total);
        if (saved) {
            depositSkins(selectedItems);
            setSuccess(`¡Has depositado ${selectedItems.length} objetos por ${total.toFixed(2)}€!`);
            setSelectedItems([]);
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 2000);
        } else {
            alert("Error al procesar el depósito en la base de datos.");
        }
        setLoading(false);
    };

    const handleCardDeposit = async () => {
        const amountNum = parseFloat(cardData.amount);
        if (isNaN(amountNum) || amountNum <= 0) return alert("Monto inválido");
        setLoading(true);
        const saved = await addToBalance(amountNum);
        if (saved) {
            setSuccess(`¡Pago procesado! Se han añadido ${amountNum.toFixed(2)}€ a tu cuenta.`);
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 2000);
        } else {
            alert("Error al procesar el pago.");
        }
        setLoading(false);
    };

    const redeemGiftCard = async () => {
        if (!giftCode.trim()) return;

        let amount = Math.floor(Math.random() * 50) + 10;
        if (giftCode.toUpperCase() === "ESPAÑA") {
            amount = 50.00;
        }

        setLoading(true);
        const saved = await addToBalance(amount);
        if (saved) {
            setSuccess(`¡Tarjeta canjeada! Se han añadido ${amount}€ a tu cuenta.`);
            setGiftCode("");
            setTimeout(() => {
                setSuccess(null);
                onClose();
            }, 2000);
        } else {
            alert("Error al canjear el código.");
        }
        setLoading(false);
    };

    const toggleSelect = (skin) => {
        if (selectedItems.find(s => s.id === skin.id)) {
            setSelectedItems(prev => prev.filter(s => s.id !== skin.id));
        } else {
            setSelectedItems(prev => [...prev, skin]);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
            zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                    background: '#16191e', width: '100%', maxWidth: '800px', borderRadius: '32px',
                    border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
                }}
            >
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)',
                    border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%',
                    cursor: 'pointer', fontSize: '1rem', zIndex: 10
                }}>✕</button>

                <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <TabButton active={activeTab === 'steam'} onClick={() => setActiveTab('steam')} label="STEAM" icon="🎮" />
                    <TabButton active={activeTab === 'card'} onClick={() => setActiveTab('card')} label="TARJETA" icon="💳" />
                    <TabButton active={activeTab === 'crypto'} onClick={() => setActiveTab('crypto')} label="CRYPTO" icon="₿" />
                    <TabButton active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} label="GIFT CARD" icon="🎁" />
                </div>

                <div style={{ padding: '40px', minHeight: '400px' }}>
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: 'center', padding: '50px 0' }}
                            >
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{success}</h3>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {activeTab === 'steam' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>DEPOSITAR PIELES DE STEAM</h3>
                                            <div style={{ fontSize: '0.8rem', color: '#f5ac3b', fontWeight: 'bold' }}>BONUS +10%</div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Introduce tu SteamID64 o tu Link de Intercambio..."
                                                    value={steamId}
                                                    onChange={(e) => setSteamId(e.target.value)}
                                                    style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                                />
                                                <button
                                                    onClick={fetchSteamInventory}
                                                    style={{ padding: '15px 25px', borderRadius: '12px', background: '#f5ac3b', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer' }}
                                                > {loading ? '...' : 'CARGAR'} </button>
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', lineHeight: '1.4' }}>
                                                <div style={{ color: '#f5ac3b', marginBottom: '4px', fontWeight: 'bold' }}>⚠️ PRIVACIDAD DE STEAM:</div>
                                                En Steam ve a <b>Modificar Perfil &gt; Privacidad</b> y pon <b>MI PERFIL</b> en Público e <b>INVENTARIO</b> en Público. El perfil solo no basta.
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                            gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'
                                        }}>
                                            {loading ? (
                                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '3px solid rgba(245, 172, 59, 0.1)', borderTopColor: '#f5ac3b', borderRadius: '50%', margin: '0 auto' }} />
                                                </div>
                                            ) : steamSkins.length > 0 ? steamSkins.map(skin => {
                                                const isSelected = selectedItems.find(s => s.id === skin.id);
                                                return (
                                                    <div
                                                        key={skin.id}
                                                        onClick={() => skin.marketable !== false && toggleSelect(skin)}
                                                        style={{
                                                            background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                                                            border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                                                            borderRadius: '20px', padding: '15px',
                                                            cursor: skin.marketable !== false ? 'pointer' : 'not-allowed',
                                                            textAlign: 'center',
                                                            transition: 'all 0.2s', position: 'relative',
                                                            opacity: skin.marketable !== false ? 1 : 0.4
                                                        }}
                                                    >
                                                        {skin.marketable === false && (
                                                            <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', zIndex: 1 }}>🔒 NO VENDIBLE</div>
                                                        )}
                                                        <img src={skin.image} alt={skin.name} style={{ width: '80%', height: '50px', objectFit: 'contain' }} />
                                                        <div style={{ fontSize: '0.6rem', fontWeight: 'bold', margin: '10px 0 5px', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skin.name}</div>
                                                        <div style={{ color: '#10b981', fontWeight: '900', fontSize: '0.8rem' }}>{skin.price}€</div>
                                                        {isSelected && <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#3b82f6', fontSize: '0.7rem' }}>✔</div>}
                                                    </div>
                                                );
                                            }) : (
                                                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '50px' }}>Introduce tu SteamID64 para cargar tus pieles.</div>
                                            )}
                                        </div>

                                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900' }}>TOTAL A RECIBIR</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#10b981' }}>
                                                    {selectedItems.reduce((acc, s) => acc + s.price, 0).toFixed(2)}€
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleDeposit}
                                                disabled={selectedItems.length === 0 || loading}
                                                style={{
                                                    flex: 2, padding: '15px', borderRadius: '16px',
                                                    background: selectedItems.length > 0 ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                    border: 'none', color: 'white', fontWeight: '900', cursor: 'pointer'
                                                }}
                                            >
                                                DEPOSITAR AHORA
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'card' && (
                                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '25px', textAlign: 'center' }}>DEPÓSITO CON TARJETA</h3>
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <input type="text" placeholder="Número de Tarjeta" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            <input type="text" placeholder="Nombre en Tarjeta" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="text" placeholder="MM/YY" style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                <input type="text" placeholder="CVC" style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>CANTIDAD A RECARGAR</div>
                                                <input
                                                    type="number"
                                                    value={cardData.amount}
                                                    onChange={(e) => setCardData({ ...cardData, amount: e.target.value })}
                                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(245, 172, 59, 0.05)', border: '1px solid #f5ac3b', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}
                                                />
                                            </div>
                                            <button
                                                onClick={handleCardDeposit}
                                                disabled={loading}
                                                style={{ marginTop: '10px', width: '100%', padding: '18px', borderRadius: '16px', background: '#f5ac3b', border: 'none', color: 'black', fontWeight: '900', cursor: 'pointer' }}
                                            >
                                                {loading ? 'PROCESANDO...' : 'RECARGAR SALDO'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'crypto' && (
                                    <div style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '25px' }}>PAGO CON CRIPTO</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                                            {['BTC', 'ETH', 'USDT'].map(coin => (
                                                <div key={coin} onClick={() => generateCryptoAddress(coin)} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', cursor: 'pointer' }}>
                                                    <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{coin === 'BTC' ? '₿' : coin === 'ETH' ? '🦇' : '💵'}</div>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '900' }}>{coin}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {cryptoData && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 172, 59, 0.2)' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#f5ac3b', fontWeight: '900', marginBottom: '10px' }}>DIRECCIÓN {cryptoData.coin}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'white', wordBreak: 'break-all', fontWeight: 'bold' }}>{cryptoData.address}</div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'gift' && (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '25px' }}>CANJEAR GIFT CARD</h3>
                                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                            <input
                                                type="text"
                                                placeholder="Código de Tarjeta Regalo..."
                                                value={giftCode}
                                                onChange={(e) => setGiftCode(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '18px', borderRadius: '16px',
                                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white', marginBottom: '20px', textAlign: 'center', fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                onClick={redeemGiftCard}
                                                disabled={loading}
                                                style={{
                                                    width: '100%', padding: '18px', borderRadius: '16px',
                                                    background: '#10b981', border: 'none', color: 'white',
                                                    fontWeight: '900', cursor: 'pointer'
                                                }}
                                            >
                                                {loading ? '...' : 'CANJEAR AHORA'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
