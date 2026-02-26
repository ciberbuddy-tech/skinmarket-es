import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import steamBot from "./steamBot.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET no está definido en el archivo .env");
  process.exit(1);
}

// Iniciar Bot de Steam
steamBot.logIn();

app.use(cors());
app.use(express.json());

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "No autorizado" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post("/api/register", async (req, res) => {
  const { nombre_usuario, email, password } = req.body;

  if (!nombre_usuario || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO usuarios (nombre_usuario, email, password_hash, nivel, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING usuario_id, nombre_usuario, email, saldo, nivel, experiencia",
      [nombre_usuario, email, hashedPassword, 0, 0]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.usuario_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: "El usuario o email ya existe" });
    }
    res.status(500).json({ error: "Error al registrar usuario", details: err.message, code: err.code });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user.usuario_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    const userData = {
      usuario_id: user.usuario_id,
      nombre_usuario: user.nombre_usuario,
      email: user.email,
      saldo: user.saldo,
      nivel: user.nivel,
      experiencia: user.experiencia
    };

    res.json({ user: userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query(
      "SELECT usuario_id, nombre_usuario, email, saldo, nivel, experiencia, link_intercambio, steam_id, trade_token, ultimo_reclamo_diario FROM usuarios WHERE usuario_id = $1",
      [req.user.id]
    );
    const inventoryResult = await db.query(
      "SELECT item_id as id, name, price, image, rarity, marketable, status FROM inventario WHERE usuario_id = $1 AND status != 'sold' AND status != 'withdrawn'",
      [req.user.id]
    );
    const user = userResult.rows[0];
    user.inventory = inventoryResult.rows;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});

app.get("/api/ranking", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT nombre_usuario as name, saldo as balance, nivel as level, experiencia as exp FROM usuarios ORDER BY saldo DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ranking" });
  }
});

app.post("/api/claim-daily", authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query("SELECT ultimo_reclamo_diario, nivel FROM usuarios WHERE usuario_id = $1", [req.user.id]);
    const user = userResult.rows[0];

    const now = new Date();
    const lastClaim = user.ultimo_reclamo_diario ? new Date(user.ultimo_reclamo_diario) : null;

    // 12 hours limit for now (as requested by user for the first case)
    const hoursWait = 12;
    if (lastClaim && (now - lastClaim) < hoursWait * 60 * 60 * 1000) {
      const remaining = hoursWait * 60 * 60 * 1000 - (now - lastClaim);
      return res.status(400).json({
        error: "Aún no puedes reclamar",
        remainingMs: remaining
      });
    }

    // Reward: level-based? or just random balance for now
    const reward = Math.max(0.05, Math.random() * 0.50).toFixed(2);
    const expReward = 10;

    await db.query(
      "UPDATE usuarios SET saldo = saldo + $1, experiencia = experiencia + $2, ultimo_reclamo_diario = $3 WHERE usuario_id = $4",
      [reward, expReward, now, req.user.id]
    );

    res.json({
      success: true,
      reward,
      expReward,
      message: `¡Has recibido ${reward}€ y ${expReward} de EXP!`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar reclamo diario" });
  }
});

// --- INVENTORY ROUTES ---

app.get("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT item_id as id, name, price, image, rarity, marketable, status FROM inventario WHERE usuario_id = $1 AND status != 'sold' AND status != 'withdrawn'",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
});

app.post("/api/inventory/add", authenticateToken, async (req, res) => {
  const { items } = req.body; // Array de {name, price, image, rarity, marketable}
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Items no proporcionados" });

  try {
    const addedItems = [];
    for (const item of items) {
      const result = await db.query(
        "INSERT INTO inventario (usuario_id, name, price, image, rarity, marketable) VALUES ($1, $2, $3, $4, $5, $6) RETURNING item_id as id, name, price, image, rarity, marketable, status",
        [req.user.id, item.name, item.price, item.image, item.rarity, item.marketable !== false]
      );
      addedItems.push(result.rows[0]);
    }
    res.json({ success: true, items: addedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al añadir al inventario" });
  }
});

app.post("/api/inventory/sell", authenticateToken, async (req, res) => {
  const { itemId } = req.body;
  try {
    const itemResult = await db.query("SELECT * FROM inventario WHERE item_id = $1 AND usuario_id = $2 AND status = 'on_site'", [itemId, req.user.id]);
    if (itemResult.rows.length === 0) return res.status(404).json({ error: "Objeto no encontrado o ya procesado" });

    const item = itemResult.rows[0];
    await db.query("UPDATE inventario SET status = 'sold' WHERE item_id = $1", [itemId]);
    const balanceResult = await db.query("UPDATE usuarios SET saldo = saldo + $1 WHERE usuario_id = $2 RETURNING saldo", [item.price, req.user.id]);

    res.json({ success: true, newBalance: balanceResult.rows[0].saldo });
  } catch (err) {
    res.status(500).json({ error: "Error al vender objeto" });
  }
});

app.post("/api/inventory/withdraw", authenticateToken, async (req, res) => {
  const { itemId } = req.body;
  try {
    // 1. Verificar objeto en inventario
    const itemResult = await db.query("SELECT * FROM inventario WHERE item_id = $1 AND usuario_id = $2 AND status = 'on_site'", [itemId, req.user.id]);
    if (itemResult.rows.length === 0) return res.status(404).json({ error: "Objeto no disponible para retirar" });
    const item = itemResult.rows[0];

    // 2. Obtener datos de intercambio del usuario
    const userResult = await db.query("SELECT link_intercambio, steam_id, trade_token FROM usuarios WHERE usuario_id = $1", [req.user.id]);
    const user = userResult.rows[0];

    if (!user.steam_id || !user.trade_token) {
      return res.status(400).json({ error: "Configura tu Link de Intercambio en los ajustes antes de retirar." });
    }

    // 3. Intentar envío real con el Bot si está disponible
    if (steamBot.isLoggedIn) {
      try {
        await steamBot.sendWithdrawOffer(user.steam_id, user.trade_token, item.name);
        await db.query("UPDATE inventario SET status = 'withdrawn' WHERE item_id = $1", [itemId]);
        return res.json({ success: true, message: "Oferta real enviada a Steam." });
      } catch (botErr) {
        console.error("[WITHDRAW] Bot error:", botErr.message);
        // Fallback a simulación si el bot falla (ej: no tiene el objeto)
        await db.query("UPDATE inventario SET status = 'withdrawing' WHERE item_id = $1", [itemId]);
        return res.json({ success: true, message: "El bot no tiene el objeto físico. Retiro marcado como pendiente (simulado)." });
      }
    } else {
      // Fallback a simulación si el bot no está configurado
      await db.query("UPDATE inventario SET status = 'withdrawing' WHERE item_id = $1", [itemId]);

      // Simular que se retira después de 5 segundos (sincronizado con el frontend)
      setTimeout(async () => {
        try {
          await db.query("UPDATE inventario SET status = 'withdrawn' WHERE item_id = $1", [itemId]);
          console.log(`[WITHDRAW] Item ${itemId} marcado como retirado (simulado)`);
        } catch (e) {
          console.error("Error en simulación de retiro:", e);
        }
      }, 5000);

      res.json({ success: true, message: "Bot fuera de línea. Retiro simulado iniciado." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar el retiro" });
  }
});

app.post("/api/update-profile", authenticateToken, async (req, res) => {
  const { link_intercambio } = req.body;
  if (!link_intercambio) return res.status(400).json({ error: "Enlace no proporcionado" });

  let steam_id = null;
  let trade_token = null;

  const partnerMatch = link_intercambio.match(/partner=(\d+)/);
  if (partnerMatch) {
    steam_id = (BigInt(partnerMatch[1]) + BigInt("76561197960265728")).toString();
  }

  const tokenMatch = link_intercambio.match(/token=([\w-]+)/);
  if (tokenMatch) {
    trade_token = tokenMatch[1];
  }

  try {
    const result = await db.query(
      "UPDATE usuarios SET link_intercambio = $1, steam_id = $2, trade_token = $3 WHERE usuario_id = $4 RETURNING link_intercambio, steam_id, trade_token",
      [link_intercambio, steam_id, trade_token, req.user.id]
    );
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

app.post("/api/update-balance", authenticateToken, async (req, res) => {
  const { amount } = req.body;
  console.log(`[BALANCE] Intento de actualización: +${amount} para usuario_id: ${req.user.id}`);

  if (amount === undefined) return res.status(400).json({ error: "Monto no especificado" });

  try {
    const result = await db.query(
      "UPDATE usuarios SET saldo = saldo + $1 WHERE usuario_id = $2 RETURNING saldo",
      [parseFloat(amount), req.user.id]
    );
    console.log(`[BALANCE] Éxito. Nuevo saldo en DB: ${result.rows[0].saldo}`);
    res.json({ success: true, newBalance: result.rows[0].saldo });
  } catch (err) {
    console.error("[BALANCE] Error:", err);
    res.status(500).json({ error: "Error al actualizar saldo" });
  }
});

// --- STEAM ROUTES ---

import fetch from 'node-fetch';

app.get("/api/steam-inventory/:steamId", async (req, res) => {
  const steamId = req.params.steamId;
  console.log(`[STEAM] Solicitando inventario para: ${steamId}`);

  try {
    const response = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://steamcommunity.com/"
        }
      }
    );

    if (response.status !== 200) {
      console.error(`[STEAM] Error from Steam API: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[STEAM] Body: ${errorText}`);
      return res.status(response.status).json({ error: `Steam respondió con error ${response.status}` });
    }

    const data = await response.json();

    if (!data || data.success === false) {
      console.warn("[STEAM] Respuesta fallida o perfil privado");
      return res.status(403).json({ error: "El inventario es privado o no se pudo acceder. Por favor, cámbialo a Público en los ajustes de Steam." });
    }

    if (!data.assets || !data.descriptions) {
      console.log("[STEAM] No se encontraron objetos.");
      return res.json([]);
    }

    const inventory = data.assets.map(asset => {
      const description = data.descriptions.find(d => d.classid === asset.classid);
      if (!description) return null;

      let rarity = description.tags?.find(t => t.category === "Rarity")?.name || "Consumer Grade";
      let basePrice = 0.50;
      if (rarity.includes("Covert")) basePrice = (Math.random() * 400 + 50);
      else if (rarity.includes("Classified")) basePrice = (Math.random() * 40 + 10);
      else if (rarity.includes("Restricted")) basePrice = (Math.random() * 8 + 2);

      return {
        id: asset.assetid,
        name: description.market_hash_name,
        image: `https://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}`,
        price: parseFloat(basePrice.toFixed(2)),
        rarity: rarity,
        marketable: description.marketable === 1
      };
    }).filter(skin => skin !== null);

    console.log(`[STEAM] Éxito: ${inventory.length} items cargados`);
    res.json(inventory);
  } catch (err) {
    console.error("[STEAM] fatal error detail:", err);
    res.status(500).json({ error: "Error interno al conectar con Steam", details: err.message });
  }
});

app.get("/api/steam-price", async (req, res) => {
  const hashName = req.query.market_hash_name;
  if (!hashName) return res.status(400).json({ error: "Missing market_hash_name" });
  try {
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=${encodeURIComponent(hashName)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching price" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));