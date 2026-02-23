// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());

// Fetch dinámico para ESM
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.get("/api/steam-inventory/:steamId", async (req, res) => {
  const steamId = req.params.steamId;
  try {
    const response = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener inventario de Steam" });
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