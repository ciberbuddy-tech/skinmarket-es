import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getSkins } from "../hooks/useFetchSkins";
import { getRarityColor } from "../constants/colors.js";

// Modal mejorado para seleccionar cajas
const BattleSelector = ({ open, onClose, onStart, userBalance, isLoading }) => {
  const [selectedBoxes, setSelectedBoxes] = useState({});

  if (!open) return null;

  const boxes = [
    { id: "basic", name: "🟢 Caja Básica", cost: 50, icon: "💚", description: "Entrada a las batallas" },
    { id: "advanced", name: "🔵 Caja Avanzada", cost: 150, icon: "💙", description: "Más skins raros" },
    { id: "epic", name: "🟣 Caja Épica", cost: 300, icon: "💜", description: "Skins premium" }
  ];

  const totalCost = Object.entries(selectedBoxes).reduce((sum, [boxId, qty]) => {
    const box = boxes.find(b => b.id === boxId);
    return sum + (box?.cost || 0) * qty;
  }, 0);

  const canAfford = totalCost > 0 && totalCost <= userBalance;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "16px",
        padding: "32px",
        maxWidth: "600px",
        width: "90%",
        border: "2px solid rgba(0, 255, 136, 0.2)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
      }}>
        <h2 style={{
          color: "#00ff88",
          margin: "0 0 24px 0",
          fontSize: "1.5rem",
          fontWeight: "bold"
        }}>
          ⚔️ Batalla de Cajas
        </h2>

        {/* Grid de cajas seleccionables */}
        <div style={{ marginBottom: "24px" }}>
          {boxes.map(box => {
            const qty = selectedBoxes[box.id] || 0;
            const maxQty = Math.floor(userBalance / box.cost);
            return (
              <div
                key={box.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                  border: qty > 0 ? "2px solid #00ff88" : "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}>
                  <div>
                    <div style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                      marginBottom: "4px"
                    }}>
                      {box.name}
                    </div>
                    <div style={{
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.6)"
                    }}>
                      {box.description} • €{box.cost} c/u
                    </div>
                  </div>
                  <div style={{
                    fontSize: "2rem"
                  }}>
                    {box.icon}
                  </div>
                </div>

                {/* Controles de cantidad */}
                <div style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center"
                }}>
                  <button
                    onClick={() => setSelectedBoxes(prev => ({
                      ...prev,
                      [box.id]: Math.max(0, (prev[box.id] || 0) - 1)
                    }))}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 255, 136, 0.3)",
                      background: "rgba(0, 255, 136, 0.1)",
                      color: "#00ff88",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem"
                    }}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="0"
                    max={maxQty}
                    value={qty}
                    onChange={(e) => setSelectedBoxes(prev => ({
                      ...prev,
                      [box.id]: Math.max(0, Math.min(maxQty, parseInt(e.target.value) || 0))
                    }))}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 255, 136, 0.3)",
                      background: "rgba(0, 255, 136, 0.05)",
                      color: "#00ff88",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "0.95rem"
                    }}
                  />

                  <button
                    onClick={() => setSelectedBoxes(prev => ({
                      ...prev,
                      [box.id]: Math.min(maxQty, (prev[box.id] || 0) + 1)
                    }))}
                    disabled={qty >= maxQty}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 255, 136, 0.3)",
                      background: qty >= maxQty ? "rgba(255,255,255,0.05)" : "rgba(0, 255, 136, 0.1)",
                      color: qty >= maxQty ? "rgba(255,255,255,0.3)" : "#00ff88",
                      cursor: qty >= maxQty ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div style={{
          background: "rgba(0, 255, 136, 0.1)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
          border: "1px solid rgba(0, 255, 136, 0.3)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.8)"
          }}>
            <span>Total cajas:</span>
            <span style={{ fontWeight: "bold" }}>
              {Object.values(selectedBoxes).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#00ff88"
          }}>
            <span>Costo total:</span>
            <span>€{totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              onStart(selectedBoxes);
              setSelectedBoxes({});
            }}
            disabled={!canAfford || isLoading}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: canAfford && !isLoading
                ? "linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)"
                : "rgba(255,255,255,0.1)",
              color: canAfford && !isLoading ? "black" : "rgba(255,255,255,0.5)",
              fontWeight: "bold",
              cursor: canAfford && !isLoading ? "pointer" : "not-allowed",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              if (canAfford && !isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 20px rgba(0, 255, 136, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (canAfford && !isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {isLoading ? "Abriendo..." : "⚔️ Iniciar Batalla"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "14px 24px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Battles() {
  const { user, updateUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [skinsAPI, setSkinsAPI] = useState([]);

  useEffect(() => {
    getSkins()
      .then(data => setSkinsAPI(data))
      .catch(err => console.error("Error cargando skins:", err));
  }, []);

  const boxes = {
    basic: { name: "Caja Básica", cost: 50, color: "#10b981" },
    advanced: { name: "Caja Avanzada", cost: 150, color: "#3b82f6" },
    epic: { name: "Caja Épica", cost: 300, color: "#a855f7" }
  };

  const createWeightedSkinList = (skins) => {
    const weighted = [];
    skins.forEach(skin => {
      const price = Math.max(0.5, skin.price || 0.5);
      const weight = Math.max(1, Math.floor(500 / (price * 10)));
      for (let i = 0; i < weight; i++) {
        weighted.push({
          ...skin,
          price: parseFloat(price.toFixed(2))
        });
      }
    });
    return weighted;
  };

  const getRandomRealSkin = () => {
    if (!skinsAPI.length) return null;
    const weightedPool = createWeightedSkinList(skinsAPI);
    const skin = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    return {
      id: `${skin.id}-${Date.now()}-${Math.random()}`,
      name: skin.name,
      image: skin.image,
      price: skin.price,
      rarity: skin.rarity?.name || "Unknown"
    };
  };

  const handleStartBattle = (selectedBoxes) => {
    if (!user) return;

    const totalCost = Object.entries(selectedBoxes).reduce((sum, [id, qty]) => {
      return sum + (boxes[id]?.cost || 0) * qty;
    }, 0);

    if (totalCost > user.balance) {
      alert("Saldo insuficiente");
      return;
    }

    setIsLoading(true);
    setModalOpen(false);

    const resultsArray = [];
    let totalValue = 0;
    const boxesToOpen = [];

    Object.entries(selectedBoxes).forEach(([id, qty]) => {
      for (let i = 0; i < qty; i++) boxesToOpen.push(boxes[id]);
    });

    // Simular carrusel
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      spinCount++;
      if (spinCount > 40) clearInterval(spinInterval);
    }, 30);

    let index = 0;
    const openInterval = setInterval(() => {
      if (index < boxesToOpen.length) {
        const skin = getRandomRealSkin();
        resultsArray.push(skin);
        totalValue += skin.price;
        setResults({
          skins: resultsArray,
          currentIndex: index + 1,
          total: boxesToOpen.length,
          totalValue: parseFloat(totalValue.toFixed(2)),
          totalCost
        });
        index++;
      } else {
        clearInterval(openInterval);

        const newBalance = parseFloat((user.balance - totalCost).toFixed(2));
        const newInventory = [...(user.inventory || []), ...resultsArray];

        updateUser({
          ...user,
          balance: newBalance,
          inventory: newInventory
        });

        setIsLoading(false);
      }
    }, 600);
  };

  const stats = useMemo(() => {
    if (!results) return null;
    const profit = results.totalValue - results.totalCost;
    return {
      profit: parseFloat(profit.toFixed(2)),
      profitPercent: parseFloat(((profit / results.totalCost) * 100).toFixed(1))
    };
  }, [results]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          marginBottom: "40px",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
          padding: "40px 20px",
          borderRadius: "16px",
          border: "1px solid rgba(0, 255, 136, 0.2)"
        }}>
          <h1 style={{
            fontSize: "3rem",
            color: "white",
            margin: "0 0 16px 0",
            fontWeight: "bold"
          }}>
            ⚔️ Batallas de Cajas
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            marginBottom: "20px"
          }}>
            Compete contra otros jugadores • <span style={{ color: "#00ff88", fontWeight: "bold" }}>€{user?.balance?.toFixed(2) || 0}</span> disponibles
          </p>
          <div style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.6)"
          }}>
            <div>🎮 <span style={{ color: "#00ff88", fontWeight: "bold" }}>3</span> modos de batalla</div>
            <div>🏆 Probablemente justo</div>
            <div>💎 Skins reales</div>
          </div>
        </div>

        {/* Botón principal */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button
            onClick={() => setModalOpen(true)}
            disabled={isLoading || !user || user.balance < 50}
            style={{
              padding: "16px 48px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "black",
              background: isLoading || !user || user.balance < 50
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: isLoading || !user || user.balance < 50 ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0, 255, 136, 0.2)",
              opacity: isLoading || !user || user.balance < 50 ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (!isLoading && user && user.balance >= 50) {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 255, 136, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && user && user.balance >= 50) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(0, 255, 136, 0.2)";
              }
            }}
          >
            {isLoading ? "⚡ Batalla en progreso..." : "⚔️ Comenzar Batalla"}
          </button>
        </div>

        {/* Resultados */}
        {results && (
          <div>
            {/* Resumen de batalla */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              border: "2px solid rgba(0, 255, 136, 0.2)"
            }}>
              <h3 style={{
                color: "#00ff88",
                margin: "0 0 16px 0",
                fontSize: "1.3rem"
              }}>
                ✨ Batalla Completada
              </h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Cajas Abiertas</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#00ff88" }}>
                    {results.total}
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Valor Total</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#3b82f6" }}>
                    €{results.totalValue.toFixed(2)}
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                    {stats.profit > 0 ? "Ganancia" : "Pérdida"}
                  </div>
                  <div style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: stats.profit > 0 ? "#10b981" : "#ef4444"
                  }}>
                    {stats.profit > 0 ? "+" : ""}€{stats.profit.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: stats.profit > 0 ? "#10b981" : "#ef4444"
              }}>
                ROI: {stats.profitPercent > 0 ? "+" : ""}{stats.profitPercent}%
              </div>
            </div>

            {/* Grid de skins */}
            <h3 style={{ color: "white", marginBottom: "20px", fontSize: "1.3rem" }}>
              🎁 Skins Obtenidas ({results.skins.length})
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "16px",
              marginBottom: "40px"
            }}>
              {results.skins.map((skin, idx) => (
                <div
                  key={idx}
                  style={{
                    background: `${getRarityColor(skin.rarity)}15`,
                    border: `2px solid ${getRarityColor(skin.rarity)}`,
                    borderRadius: "12px",
                    padding: "12px",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 8px 16px ${getRarityColor(skin.rarity)}40`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {skin.image && (
                    <img
                      src={skin.image}
                      alt={skin.name}
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "contain",
                        marginBottom: "8px",
                        borderRadius: "6px"
                      }}
                      onError={(e) => e.target.style.display = "none"}
                    />
                  )}
                  <div style={{
                    fontSize: "0.8rem",
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {skin.name}
                  </div>
                  <div style={{
                    fontSize: "0.75rem",
                    color: getRarityColor(skin.rarity),
                    marginBottom: "4px"
                  }}>
                    {skin.rarity}
                  </div>
                  <div style={{
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: "#00ff88"
                  }}>
                    €{skin.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        <BattleSelector
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onStart={handleStartBattle}
          userBalance={user?.balance || 0}
          isLoading={isLoading}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
