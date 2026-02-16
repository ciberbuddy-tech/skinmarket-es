// src/pages/UploadSkin.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function UploadSkin() {
  const { user, updateUser } = useAuth();
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImportSteam = async () => {
    if (!steamId) return alert("Introduce tu SteamID64");

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/steam-inventory/${steamId}`);
      
      // ✅ Detectar si Steam devuelve HTML (inventario privado o error)
      const text = await res.text();
      if (text.startsWith("<!DOCTYPE")) {
        alert("El inventario de Steam es privado o no se puede acceder.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);

      if (!data || !data.assets || Object.keys(data.assets).length === 0) {
        alert("No se pudo cargar el inventario. Asegúrate de que sea público.");
        setLoading(false);
        return;
      }

      // Map de descriptions para unir icon_url y nombres
      const descriptionsMap = {};
      Object.values(data.descriptions || {}).forEach(desc => {
        descriptionsMap[`${desc.classid}_${desc.instanceid}`] = desc;
      });

      // Creamos array de skins
      const skins = (data.assets || []).map(item => {
        const desc = descriptionsMap[`${item.classid}_${item.instanceid}`];
        return {
          id: item.assetid,
          name: desc?.market_name || desc?.name || "Unknown Skin",
          price: Math.floor(Math.random() * 5000) + 200, // precio random para demo
          rarity: desc?.tags?.find(tag => tag.category === "Rarity")?.name || "Mil-Spec Grade",
          image: desc?.icon_url
            ? `https://steamcommunity-a.akamaihd.net/economy/image/${desc.icon_url}/256fx256f`
            : ""
        };
      }).filter(skin => skin.image); // solo skins con imagen

      if (skins.length === 0) {
        alert("No se encontraron skins con imagen en este inventario.");
        setLoading(false);
        return;
      }

      // Actualizamos inventario del usuario
      const updatedUser = { ...user, inventory: [...user.inventory, ...skins] };
      updateUser(updatedUser);

      alert(`Importadas ${skins.length} skins desde Steam`);
    } catch (err) {
      console.error(err);
      alert("Error al importar el inventario de Steam. Puede ser CORS, inventario privado o Steam inactivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{  width: '100%',
  minHeight: '100vh',   // asegura que siempre cubra la pantalla
  padding: '20px',
  background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8), rgba(26, 31, 58, 0.8))',
  boxSizing: 'border-box'}}>
      <h1 style={{ marginBottom: "20px" }}>Subir Skin o importar de Steam</h1>
      
      {/* Input SteamID */}
      <input
        type="text"
        placeholder="Introduce tu SteamID64"
        value={steamId}
        onChange={e => setSteamId(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #333",
          background: "#222",
          color: "white"
        }}
      />

      {/* Botón importar */}
      <button
        onClick={handleImportSteam}
        disabled={loading}
        style={{
          padding: "10px",
          width: "100%",
          background: "#00ff88",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {loading ? "Cargando..." : "Importar inventario de Steam"}
      </button>

      {/* Separador */}
      <hr style={{ margin: "20px 0", borderColor: "#444" }} />

      {/* Subida manual */}
      <p>Puedes añadir skins manualmente también en tu inventario usando tu formulario habitual.</p>
    </div>
  );
}