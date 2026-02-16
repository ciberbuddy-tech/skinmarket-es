// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());

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

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));