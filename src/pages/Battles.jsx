import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import BattleModal from "../components/BattleModal";

export default function Battles() {
  const { user, updateUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [isFighting, setIsFighting] = useState(false);
  const [skinsAPI, setSkinsAPI] = useState([]);

  // Cargar skins reales desde la API
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json")
      .then(res => res.json())
      .then(data => setSkinsAPI(data))
      .catch(err => console.error("Error cargando skins:", err));
  }, []);

  const boxList = {
    basic: { name: "Caja Básica", cost: 50, riskMultiplier: 1 },
    advanced: { name: "Caja Avanzada", cost: 150, riskMultiplier: 1.5 },
    epic: { name: "Caja Épica", cost: 300, riskMultiplier: 2 }
  };

  // Elegir skin real según rareza aleatoria
  const getRandomRealSkin = (riskMultiplier = 1) => {
    if (!skinsAPI.length) return null;

    const randIndex = Math.floor(Math.random() * skinsAPI.length);
    const skin = skinsAPI[randIndex];

    return {
      id: `${skin.id}-${Date.now()}`,
      name: skin.name,
      image: skin.image,
      price: Math.floor(Math.random() * 2000) + 100, // Precio aleatorio
      rarity: skin.rarity?.name || "Unknown"
    };
  };

  const handleSelectBoxes = (selectedBoxes) => {
    if (!user) return;

    const totalCost = Object.entries(selectedBoxes).reduce((sum, [id, qty]) => {
      return sum + (boxList[id]?.cost || 0) * qty;
    }, 0);

    if (totalCost > user.balance) {
      return alert("No tienes saldo suficiente");
    }

    setIsFighting(true);
    setResult(null);
    setModalOpen(false);

    const resultsArray = [];
    const boxesToOpen = [];

    Object.entries(selectedBoxes).forEach(([id, qty]) => {
      for (let i = 0; i < qty; i++) boxesToOpen.push(boxList[id]);
    });

    let index = 0;
    const openInterval = setInterval(() => {
      if (index < boxesToOpen.length) {
        const newSkin = getRandomRealSkin(boxesToOpen[index].riskMultiplier) || {
          id: `fake-${Date.now()}`,
          name: "Skin genérica",
          image: "",
          price: 100,
          rarity: "mil-spec"
        };
        resultsArray.push(newSkin);
        setResult({ skins: resultsArray, currentIndex: index + 1, total: boxesToOpen.length });
        index++;
      } else {
        clearInterval(openInterval);
        const updatedUser = {
          ...user,
          balance: user.balance - totalCost,
          inventory: [...user.inventory, ...resultsArray]
        };
        updateUser(updatedUser);
        setIsFighting(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "24px", background: "linear-gradient(135deg, #050812 0%, #0a0f1e 50%, #040609 100%)", color: "white" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>🗡️ Batallas de Cajas</h1>
      <p style={{ marginBottom: "24px" }}>Saldo: <strong>${user?.balance}</strong></p>

      <button
        onClick={() => setModalOpen(true)}
        disabled={isFighting || !user || user.balance < 50}
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          border: "none",
          background: "#3b82f6",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "24px"
        }}
      >
        {isFighting ? `Abriendo ${result?.currentIndex || 0}...` : "Seleccionar cajas"}
      </button>

      {result && (
        <div>
          <h3 style={{ marginBottom: "16px" }}>Resultados ({result.skins.length}/{result.total})</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
          {result.skins.map((s) => (
            <div key={s.id} style={{
              background: "#1e293b",
              borderRadius: "12px",
              overflow: "hidden",
              textAlign: "center",
              padding: "12px",
              border: "1px solid rgba(59,130,246,0.3)",
              height: "320px",          // 🔥 ALTURA FIJA
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              
              {/* Imagen */}
              <div style={{
                width: "100%",
                height: "150px",        // 🔥 ALTURA FIJA IMAGEN
                overflow: "hidden",
                borderRadius: "8px"
              }}>
                <img
                  src={s.image}
                  alt={s.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain" // 🔥 IMPORTANTE (no se corta)
                  }}
                />
              </div>

              {/* Info */}
              <div>
                <div style={{
                  fontWeight: "bold",
                  marginTop: "8px",
                  fontSize: "14px"
                }}>
                  {s.name}
                </div>

                <div style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginBottom: "4px"
                }}>
                  {s.rarity}
                </div>

                <div style={{
                  color: "#10b981",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}>
                  ${s.price}
                </div>
              </div>

              {/* Botón vender */}
              <button
                onClick={() => {
                  const updatedInventory = user.inventory.filter(item => item.id !== s.id);
                  updateUser({
                    ...user,
                    balance: user.balance + s.price,
                    inventory: updatedInventory
                  });

                  setResult(prev => ({
                    ...prev,
                    skins: prev.skins.filter(item => item.id !== s.id)
                  }));
                }}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Vender
              </button>

            </div>
          ))}
</div>
        </div>
      )}

      <BattleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectBoxes={handleSelectBoxes}
      />
    </div>
  );
}