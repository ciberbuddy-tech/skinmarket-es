// src/pages/UploadSkin.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getRarityColor } from "../constants/colors.js"; // Optional if you have it

export default function UploadSkin() {
  const { user, updateUser } = useAuth();
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [steamInventory, setSteamInventory] = useState([]);
  const [selectedSkins, setSelectedSkins] = useState([]);

  const handleImportSteam = async () => {
    if (!steamId) return alert("Por favor, introduce tu SteamID64.");

    setLoading(true);
    setSteamInventory([]);
    setSelectedSkins([]);

    try {
      const res = await fetch(`http://localhost:3001/api/steam-inventory/${steamId}`);

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE")) {
        alert("El inventario de Steam es privado o no se puede acceder.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);

      if (!data || !data.assets || Object.keys(data.assets).length === 0) {
        alert("No se pudo cargar el inventario. Asegúrate de que sea público y tengas ítems de CS:GO.");
        setLoading(false);
        return;
      }

      // Map descriptions
      const descriptionsMap = {};
      Object.values(data.descriptions || {}).forEach(desc => {
        descriptionsMap[`${desc.classid}_${desc.instanceid}`] = desc;
      });

      // Parse assets
      const skins = (data.assets || []).map(item => {
        const desc = descriptionsMap[`${item.classid}_${item.instanceid}`];
        return {
          id: item.assetid,
          name: desc?.market_name || desc?.name || "Unknown Skin",
          price: parseFloat((Math.random() * 50 + 0.5).toFixed(2)), // precio simulado rápido
          rarity: desc?.tags?.find(tag => tag.category === "Rarity")?.name || "Mil-Spec Grade",
          image: desc?.icon_url
            ? `https://steamcommunity-a.akamaihd.net/economy/image/${desc.icon_url}/256fx256f`
            : ""
        };
      }).filter(skin => skin.image);

      if (skins.length === 0) {
        alert("No se encontraron skins válidas en este inventario.");
        setLoading(false);
        return;
      }

      setSteamInventory(skins);
    } catch (err) {
      console.error(err);
      alert("Error al cargar el inventario. Asegúrate de usar una SteamID64 válida.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectSkin = (skin) => {
    if (selectedSkins.find(s => s.id === skin.id)) {
      setSelectedSkins(selectedSkins.filter(s => s.id !== skin.id));
    } else {
      setSelectedSkins([...selectedSkins, skin]);
    }
  };

  const handleDeposit = () => {
    if (selectedSkins.length === 0) return;

    const totalValue = selectedSkins.reduce((acc, s) => acc + s.price, 0);

    const updatedUser = {
      ...user,
      balance: parseFloat((user.balance + totalValue).toFixed(2))
    };

    updateUser(updatedUser);

    // Quitar skins del feed de la página para simular que se enviaron
    const remaining = steamInventory.filter(s => !selectedSkins.find(sel => sel.id === s.id));
    setSteamInventory(remaining);
    setSelectedSkins([]);

    alert(`¡Depósito exitoso! Se han añadido €${totalValue.toFixed(2)} a tu cartera.`);
  };

  const totalDepositValue = selectedSkins.reduce((acc, s) => acc + s.price, 0);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '40px 20px',
      background: '#0f1115',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, rgba(245, 172, 59, 0.1) 0%, rgba(0,0,0,0.5) 100%)",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid rgba(245, 172, 59, 0.2)",
          marginBottom: "40px",
          textAlign: "center"
        }}>
          <h1 style={{ color: "white", fontSize: "2.5rem", margin: "0 0 10px 0" }}>
            💰 Depositar Skins
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", margin: "0 0 30px 0" }}>
            Conecta tu inventario público de Steam, selecciona las skins que quieres vender y añade saldo en segundos.
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", maxWidth: "600px", margin: "0 auto" }}>
            <input
              type="text"
              placeholder="Introduce tu SteamID64 público (Ej: 76561198...)"
              value={steamId}
              onChange={e => setSteamId(e.target.value)}
              style={{
                flex: "1",
                padding: "14px 20px",
                borderRadius: "8px",
                border: "2px solid #2a2e38",
                background: "#16181c",
                color: "white",
                fontSize: "1rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#f5ac3b"}
              onBlur={(e) => e.target.style.borderColor = "#2a2e38"}
            />
            <button
              onClick={handleImportSteam}
              disabled={loading}
              style={{
                padding: "14px 30px",
                background: "linear-gradient(90deg, #f5ac3b, #e0992a)",
                color: "#0f1115",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s"
              }}
            >
              {loading ? "Cargando..." : "Cargar Inventario"}
            </button>
          </div>
        </div>

        {/* Content Section */}
        {steamInventory.length > 0 && (
          <div style={{
            background: "#16181c",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid #1a1d24"
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              paddingBottom: "20px",
              borderBottom: "1px solid #2a2e38"
            }}>
              <h2 style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>
                Tu Inventario de Steam
              </h2>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                  Seleccionadas: <strong style={{ color: "white" }}>{selectedSkins.length}</strong>
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                  Valor Total: <strong style={{ color: "#f5ac3b", fontSize: "1.2rem" }}>€{totalDepositValue.toFixed(2)}</strong>
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={selectedSkins.length === 0}
                  style={{
                    padding: "12px 24px",
                    background: selectedSkins.length === 0 ? "#2a2e38" : "#f5ac3b",
                    color: selectedSkins.length === 0 ? "rgba(255,255,255,0.4)" : "#0f1115",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: selectedSkins.length === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Depositar €{totalDepositValue.toFixed(2)}
                </button>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "15px",
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "10px"
            }}>
              {steamInventory.map(skin => {
                const isSelected = !!selectedSkins.find(s => s.id === skin.id);
                // Simple color logic, if you don't have getRarityColor function imported correctly
                const getSkinColor = (rarity) => {
                  switch (rarity) {
                    case "Covert": return "#eb4b4b";
                    case "Classified": return "#d32ce6";
                    case "Restricted": return "#8847ff";
                    case "Mil-Spec Grade": return "#4b69ff";
                    case "Industrial Grade": return "#5e98d9";
                    default: return "#b0c3d9";
                  }
                };
                const color = getSkinColor(skin.rarity);

                return (
                  <div
                    key={skin.id}
                    onClick={() => toggleSelectSkin(skin)}
                    style={{
                      background: isSelected ? "rgba(245, 172, 59, 0.1)" : "#1a1d24",
                      border: `2px solid ${isSelected ? "#f5ac3b" : "transparent"}`,
                      borderBottom: `3px solid ${color}`,
                      borderRadius: "10px",
                      padding: "15px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                      position: "relative"
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#f5ac3b",
                        color: "#0f1115",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        zIndex: 2
                      }}>✓</div>
                    )}
                    <img
                      src={skin.image}
                      alt={skin.name}
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "contain",
                        marginBottom: "10px",
                        filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.4))"
                      }}
                    />
                    <div style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "5px"
                    }}>{skin.name.split(" | ")[0]}</div>
                    <div style={{
                      color: "white",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "10px"
                    }}>{skin.name.split(" | ")[1] || skin.name}</div>
                    <div style={{
                      color: "#f5ac3b",
                      fontWeight: "bold",
                      fontSize: "1rem"
                    }}>€{skin.price.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}