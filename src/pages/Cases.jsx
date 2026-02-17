import { useAuth } from "../context/AuthContext";
import { useState, useMemo, useCallback, useEffect } from "react";
import { getRarityColor } from "../constants/colors.js";
import { generateAllCases } from "../constants/cases.js";
import { useFetchSkins } from "../hooks/useFetchSkins";

// Función para obtener color y estilo de la caja según rariedad
const getCaseStyle = (rarity) => {
  const styles = {
    "mil-spec": {
      gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
      glow: "0 0 30px rgba(100, 116, 139, 0.4)",
      border: "#64748b",
      icon: "🟢"
    },
    "restricted": {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
      glow: "0 0 30px rgba(59, 130, 246, 0.5)",
      border: "#3b82f6",
      icon: "🔵"
    },
    "classified": {
      gradient: "linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)",
      glow: "0 0 30px rgba(168, 85, 247, 0.5)",
      border: "#a855f7",
      icon: "🟣"
    },
    "covert": {
      gradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
      glow: "0 0 30px rgba(220, 38, 38, 0.5)",
      border: "#dc2626",
      icon: "🔴"
    }
  };
  return styles[rarity] || styles["mil-spec"];
};

// Componente de tarjeta de caja mejorado
const CaseCard = ({ caseData, allSkins, loading: parentLoading }) => {
  const { user, updateUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [hoverEffect, setHoverEffect] = useState(false);
  const caseStyle = getCaseStyle(caseData.rarity);

  // Crear array ponderado: skins baratas más repetidas, caras menos
  const createWeightedSkinList = (skins) => {
    const weighted = [];
    skins.forEach(skin => {
      // Usar precio del skin de la API
      const price = Math.max(0.5, skin.price || 0.5);
      // Weight inverso: skin más caro = menos peso = menos opciones
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

  const openCases = useCallback(() => {
    if (quantity < 1 || quantity > 100) {
      setBalanceError("Abre entre 1 y 100 cajas");
      return;
    }

    const totalCost = parseFloat(caseData.price) * quantity;
    
    if (!user || totalCost > user.balance) {
      setBalanceError(`Necesitas €${totalCost.toFixed(2)} (Tienes €${user?.balance?.toFixed(2) || 0})`);
      return;
    }

    setLoading(true);
    setBalanceError("");
    
    // Filtrar skins que coincidan con la rareza de la caja
    const validSkins = allSkins.filter(skin => 
      skin.rarity && (
        (caseData.rarity === "mil-spec" && (skin.rarity === "Mil-Spec Grade" || skin.rarity === "Restricted")) ||
        (caseData.rarity === "classified" && (skin.rarity === "Restricted" || skin.rarity === "Classified")) ||
        (caseData.rarity === "covert" && (skin.rarity === "Classified" || skin.rarity === "Covert"))
      )
    );

    if (validSkins.length === 0) {
      setBalanceError("Sin skins disponibles para esta caja");
      setLoading(false);
      return;
    }

    // Crear lista ponderada para cada apertura
    const weightedPool = createWeightedSkinList(validSkins);

    // Animar carrusel
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      spinCount++;
      if (spinCount > 50) {
        clearInterval(spinInterval);
        
        // Resultados finales después del spin
        const allResults = [];
        let totalValue = 0;
        
        for (let i = 0; i < quantity; i++) {
          const finalSkin = weightedPool[Math.floor(Math.random() * weightedPool.length)];
          const skinValue = parseFloat(finalSkin.price.toFixed(2));
          allResults.push({
            id: `${finalSkin.id}-${Date.now()}-${i}`,
            name: finalSkin.name,
            image: finalSkin.image,
            price: skinValue,
            rarity: finalSkin.rarity
          });
          totalValue += skinValue;
        }

        setResults({ skins: allResults, totalValue: parseFloat(totalValue.toFixed(2)) });

        // Actualizar inventario del usuario
        const newInventory = [...(user.inventory || []), ...allResults];
        const newBalance = parseFloat((user.balance - totalCost).toFixed(2));

        updateUser({
          ...user,
          inventory: newInventory,
          balance: newBalance
        });

        setLoading(false);
      }
    }, 30);
  }, [quantity, caseData, user, allSkins, updateUser]);

  return (
    <div
      onMouseEnter={() => setHoverEffect(true)}
      onMouseLeave={() => setHoverEffect(false)}
      style={{
        background: caseData.bgGradient,
        borderRadius: "16px",
        padding: "0",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: hoverEffect ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hoverEffect 
          ? `0 20px 40px rgba(0, 255, 136, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)` 
          : `0 8px 24px rgba(0,0,0,0.3)`,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Efecto de brillo en hover */}
      {hoverEffect && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          animation: "shine 0.6s ease-in-out"
        }}></div>
      )}

      {/* Badge de categoría con color dinámico */}
      <div style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(10px)",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "bold",
        color: caseStyle.border,
        border: `1px solid ${caseStyle.border}`,
        zIndex: 2,
        boxShadow: caseStyle.glow
      }}>
        {caseStyle.icon} {caseData.rarity.toUpperCase()}
      </div>

      {/* Contenedor interior con efecto de profundidad */}
      <div style={{ 
        padding: "20px",
        position: "relative",
        background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)`
      }}>
        {/* Efecto de caja 3D */}
        <div style={{
          position: "absolute",
          top: "40px",
          left: "20px",
          width: "100%",
          height: "100%",
          background: caseStyle.gradient,
          opacity: "0.15",
          borderRadius: "8px",
          transform: "skewY(-2deg)",
          zIndex: "0"
        }}></div>

        {/* Header */}
        <div
          onClick={() => !loading && setExpanded(!expanded)}
          style={{ cursor: !loading ? "pointer" : "default", position: "relative", zIndex: 1 }}
        >
          <div style={{ 
            fontSize: "3rem", 
            marginBottom: "12px", 
            display: "inline-block",
            animation: hoverEffect ? "bounce 0.6s ease-in-out" : "none"
          }}>
            {caseData.emoji}
          </div>
          <h3 style={{
            margin: "8px 0",
            color: "white",
            fontSize: "1.2rem",
            fontWeight: "bold",
            letterSpacing: "-0.5px"
          }}>
            {caseData.name}
          </h3>
          <p style={{
            margin: "4px 0",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.85rem"
          }}>
            {allSkins.filter(s => {
              const price = Math.max(0.5, s.price || 0.5);
              return (
                (caseData.rarity === "mil-spec" && (s.rarity === "Mil-Spec Grade" || s.rarity === "Restricted")) ||
                (caseData.rarity === "classified" && (s.rarity === "Restricted" || s.rarity === "Classified")) ||
                (caseData.rarity === "covert" && (s.rarity === "Classified" || s.rarity === "Covert"))
              );
            }).length} skins disponibles
          </p>
        </div>

        {/* Precio y botón expand */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div>
            <div style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#00ff88",
              letterSpacing: "-1px"
            }}>
              €{parseFloat(caseData.price).toFixed(2)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
              por caja
            </div>
          </div>
          <button
            onClick={() => !loading && setExpanded(!expanded)}
            disabled={loading}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: loading ? "rgba(255,255,255,0.1)" : "rgba(0, 255, 136, 0.2)",
              border: "2px solid rgba(0, 255, 136, 0.3)",
              color: "#00ff88",
              fontSize: "1.2rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(0, 255, 136, 0.3)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = "rgba(0, 255, 136, 0.2)";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            {expanded ? "▼" : "▶"}
          </button>
        </div>
      </div>

      {/* Contenido expandido */}
      {expanded && (
        <div style={{
          background: "rgba(0,0,0,0.4)",
          padding: "20px",
          borderTop: "1px solid rgba(0, 255, 136, 0.2)",
          animation: "slideDown 0.3s ease"
        }}>
          {/* Cantidad a abrir */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.9rem",
              color: "white",
              fontWeight: "bold"
            }}>
              Abrir <span style={{ color: "#00ff88" }}>{quantity}</span> {quantity === 1 ? "caja" : "cajas"}
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {[1, 2, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setQuantity(n)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: quantity === n ? "2px solid #00ff88" : "1px solid rgba(255,255,255,0.2)",
                    background: quantity === n ? "rgba(0, 255, 136, 0.2)" : "rgba(255,255,255,0.05)",
                    color: quantity === n ? "#00ff88" : "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "all 0.2s ease"
                  }}
                >
                  x{n}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => {
                setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)));
                setBalanceError("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid rgba(0, 255, 136, 0.2)",
                background: "rgba(0,0,0,0.3)",
                color: "#00ff88",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                fontWeight: "bold"
              }}
            />
            <div style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)"
            }}>
              <span>Costo total:</span>
              <span style={{ fontWeight: "bold", color: "#00ff88" }}>
                €{(parseFloat(caseData.price) * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error */}
          {balanceError && (
            <div style={{
              background: "rgba(255, 85, 85, 0.1)",
              border: "2px solid #ff5555",
              color: "#ff9999",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.85rem",
              display: "flex",
              gap: "8px",
              alignItems: "center"
            }}>
              <span>⚠️</span>
              <span>{balanceError}</span>
            </div>
          )}

          {/* Carrusel - solo visible si está abriendo */}
          {loading && (
            <div style={{
              background: "rgba(0, 0, 0, 0.5)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              marginBottom: "16px"
            }}>
              <div style={{
                height: "80px",
                background: "rgba(0, 0, 0, 0.8)",
                borderRadius: "8px",
                border: "2px solid #00ff88",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px"
              }}>
                <div style={{
                  display: "flex",
                  gap: "10px",
                  animation: "carousel 0.1s linear infinite"
                }}>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        minWidth: "70px",
                        height: "70px",
                        background: `linear-gradient(135deg, ${["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#0099ff", "#9900ff", "#ff0099", "#00ffff"][i % 8]} 0%, rgba(255,255,255,0.1) 100%)`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "1.2rem"
                      }}
                    >
                      🎁
                    </div>
                  ))}
                </div>
                <div style={{
                  position: "absolute",
                  width: "3px",
                  height: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(to bottom, transparent, #00ff88, transparent)",
                  zIndex: 10
                }}></div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#00ff88" }}>
                ⚡ Abriendo {quantity} {quantity === 1 ? "caja" : "cajas"}...
              </div>
            </div>
          )}

          {/* Botón abrir */}
          {!loading && (
            <button
              onClick={openCases}
              disabled={parentLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: parentLoading 
                  ? "rgba(255,255,255,0.1)" 
                  : "linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)",
                color: "black",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: parentLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                opacity: parentLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!parentLoading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 20px rgba(0, 255, 136, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                if (!parentLoading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              🎁 Abrir {quantity} {quantity === 1 ? "Caja" : "Cajas"}
            </button>
          )}

          {/* Resultados */}
          {results && results.skins.length > 0 && (
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(0, 255, 136, 0.1)",
              border: "2px solid rgba(0, 255, 136, 0.3)",
              borderRadius: "12px",
              animation: "slideUp 0.3s ease"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <h5 style={{
                  color: "#00ff88",
                  margin: 0,
                  fontSize: "1rem"
                }}>
                  ✨ {results.skins.length} {results.skins.length === 1 ? "Skin" : "Skins"} Obtenidas
                </h5>
                <div style={{
                  fontSize: "0.9rem",
                  color: "#00ff88",
                  fontWeight: "bold"
                }}>
                  Valor total: €{results.totalValue.toFixed(2)}
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "8px",
                maxHeight: "300px",
                overflowY: "auto"
              }}>
                {results.skins.map((skin, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: `${getRarityColor(skin.rarity)}20`,
                      border: `2px solid ${getRarityColor(skin.rarity)}`,
                      padding: "8px",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.7rem",
                      animation: "slideDown 0.3s ease"
                    }}
                  >
                    {skin.image && (
                      <img
                        src={skin.image}
                        alt={skin.name}
                        style={{
                          width: "100%",
                          height: "40px",
                          objectFit: "contain",
                          marginBottom: "4px",
                          borderRadius: "4px"
                        }}
                        onError={(e) => e.target.style.display = "none"}
                      />
                    )}
                    <div style={{
                      color: "white",
                      fontWeight: "bold",
                      marginBottom: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {skin.name}
                    </div>
                    <div style={{ color: getRarityColor(skin.rarity) }}>
                      €{skin.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }
        @keyframes shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default function Cases() {
  const { user } = useAuth();
  const { skins: allSkins, loading: skinsLoading } = useFetchSkins(1000, false);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("price-asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Pre-generar todas las cajas
  const allCases = useMemo(() => {
    return generateAllCases();
  }, []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const avgPrice = (allCases.reduce((sum, c) => sum + parseFloat(c.price), 0) / allCases.length).toFixed(2);
    return { totalCases: allCases.length, avgPrice };
  }, [allCases]);

  // Filtrar y ordenar cajas
  const filteredCases = useMemo(() => {
    let filtered = allCases;

    if (filterCategory !== "todos") {
      filtered = filtered.filter(c => c.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-desc":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allCases, filterCategory, sortBy, searchTerm]);

  if (skinsLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px", animation: "pulse 1.5s infinite" }}>
          🎁
        </div>
        <div style={{ color: "#00ff88", fontSize: "1.2rem", fontWeight: "bold" }}>
          Cargando cajas y skins...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header mejorado */}
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
            fontWeight: "bold",
            textShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }}>
            🎁 Cajas de Skins Premium
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            marginBottom: "20px"
          }}>
            Abre cajas y obtén skins reales • <span style={{ color: "#00ff88", fontWeight: "bold" }}>€{user?.balance?.toFixed(2) || 0}</span> disponibles
          </p>
          <div style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.6)"
          }}>
            <div>📊 <span style={{ color: "#00ff88", fontWeight: "bold" }}>{stats.totalCases}</span> cajas</div>
            <div>💰 Precio promedio: <span style={{ color: "#00ff88", fontWeight: "bold" }}>€{stats.avgPrice}</span></div>
            <div>🎒 Inventario: <span style={{ color: "#3b82f6", fontWeight: "bold" }}>{user?.inventory?.length || 0}</span></div>
          </div>
        </div>

        {/* Controles de filtro mejorados */}
        <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "32px",
          flexWrap: "wrap",
          background: "rgba(0,0,0,0.3)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid rgba(0, 255, 136, 0.2)",
          backdropFilter: "blur(10px)"
        }}>
          {/* Búsqueda */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "bold"
            }}>
              🔍 Buscar Caja
            </label>
            <input
              type="text"
              placeholder="Escribe nombre de la caja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid rgba(0, 255, 136, 0.2)",
                background: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "0.9rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "bold"
            }}>
              📂 Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid #00ff88",
                background: "rgba(0,0,0,0.3)",
                color: "#00ff88",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              <option value="todos">Todas</option>
              <option value="económica">💚 Económicas</option>
              <option value="intermedia">💙 Intermedias</option>
              <option value="premium">💜 Premium</option>
            </select>
          </div>

          {/* Ordenar */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "bold"
            }}>
              📊 Ordenar
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid #00ff88",
                background: "rgba(0,0,0,0.3)",
                color: "#00ff88",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              <option value="price-asc">💵 Menor Precio</option>
              <option value="price-desc">💴 Mayor Precio</option>
              <option value="name">🔤 Nombre (A-Z)</option>
            </select>
          </div>

          {/* Contador */}
          <div style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "rgba(0, 255, 136, 0.15)",
            border: "1px solid rgba(0, 255, 136, 0.4)",
            color: "#00ff88",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-end"
          }}>
            📊 {filteredCases.length} cajas
          </div>
        </div>

        {/* Grid de cajas mejorado */}
        {filteredCases.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px"
          }}>
            {filteredCases.map((caseData) => (
              <CaseCard
                key={caseData.id}
                caseData={caseData}
                allSkins={allSkins}
                loading={skinsLoading}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "rgba(255,255,255,0.5)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
            <p style={{ fontSize: "1.1rem" }}>No hay cajas que coincidan con tu búsqueda</p>
          </div>
        )}
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
