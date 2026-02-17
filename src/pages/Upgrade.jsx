import { useAuth } from "../context/AuthContext";
import { getRarityColor } from "../constants/colors.js";
import { useState, useMemo, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Pequeña lista de ejemplo (se puede reemplazar por skins API)
const PAGE_SKINS = [
  { id: 'p1', name: "Karambit | Doppler", price: 1200, rarity: "Covert", color: "#fe4a49", image: null },
  { id: 'p2', name: "M4A1-S | Knight", price: 800, rarity: "Classified", color: "#eb4b4b", image: null },
  { id: 'p3', name: "Desert Eagle | Blaze", price: 450, rarity: "Restricted", color: "#d32ee6", image: null },
  { id: 'p4', name: "StatTrak™ AK-47 | Vulcan", price: 600, rarity: "Covert", color: "#eb4b4b", image: null },
];

// Modal para seleccionar skins para vender
const SellModal = ({ open, onClose, inventory, onSell }) => {
  const [selectedForSell, setSelectedForSell] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkins = inventory.filter(skin => 
    skin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = selectedForSell.reduce((sum, id) => {
    const skin = inventory.find(s => s.id === id);
    return sum + (skin?.price || 0);
  }, 0);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "600px",
        width: "90%",
        border: "2px solid rgba(0, 255, 136, 0.2)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
      }}>
        <h2 style={{
          color: "#00ff88",
          margin: "0 0 24px 0",
          fontSize: "1.8rem",
          fontWeight: "bold"
        }}>
          💰 Vender Skins
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar skins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(0, 255, 136, 0.3)",
            background: "rgba(0, 255, 136, 0.05)",
            color: "white",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
        />

        {/* Grid de skins */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "12px",
          maxHeight: "300px",
          overflowY: "auto",
          marginBottom: "24px"
        }}>
          {filteredSkins.map(skin => (
            <div
              key={skin.id}
              onClick={() => setSelectedForSell(prev => 
                prev.includes(skin.id) 
                  ? prev.filter(id => id !== skin.id)
                  : [...prev, skin.id]
              )}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: selectedForSell.includes(skin.id) 
                  ? "2px solid #00ff88" 
                  : "1px solid rgba(255,255,255,0.1)",
                background: selectedForSell.includes(skin.id)
                  ? "rgba(0, 255, 136, 0.1)"
                  : "rgba(255,255,255,0.05)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
                transform: selectedForSell.includes(skin.id) ? "scale(1.05)" : "scale(1)"
              }}
            >
              <div style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {skin.name}
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

        {/* Resumen */}
        <div style={{
          background: "rgba(0, 255, 136, 0.1)",
          padding: "16px",
          borderRadius: "10px",
          marginBottom: "24px",
          border: "1px solid rgba(0, 255, 136, 0.3)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#00ff88",
            fontWeight: "bold",
            fontSize: "1.1rem"
          }}>
            <span>Valor total:</span>
            <span>€{totalValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              onSell(selectedForSell);
              setSelectedForSell([]);
              setSearchTerm("");
              onClose();
            }}
            disabled={selectedForSell.length === 0}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: selectedForSell.length > 0
                ? "linear-gradient(135deg, #00ff88 0%, #00cc6f 100%)"
                : "rgba(255,255,255,0.1)",
              color: selectedForSell.length > 0 ? "black" : "rgba(255,255,255,0.5)",
              fontWeight: "bold",
              cursor: selectedForSell.length > 0 ? "pointer" : "not-allowed"
            }}
            onMouseOver={(e) => {
              if (selectedForSell.length > 0) {
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseOut={(e) => {
              if (selectedForSell.length > 0) {
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            ✓ Vender
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

// Modal de upgrade avanzado
const UpgradeModal = ({ open, onClose, inventory, user, updateUser }) => {
  const [selectedSkins, setSelectedSkins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkins = inventory.filter(skin =>
    skin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = selectedSkins.reduce((sum, id) => {
    const skin = inventory.find(s => s.id === id);
    return sum + (skin?.price || 0);
  }, 0);

  const calculateOdds = () => {
    if (totalValue === 0) return 0;
    // Odds aumentan con más valor en el upgrade
    const baseOdds = Math.min(totalValue / 10, 85);
    return baseOdds.toFixed(1);
  };

  const handleUpgrade = () => {
    const odds = parseFloat(calculateOdds());
    const roll = Math.random() * 100;
    const success = roll < odds;

    const newInventory = inventory.filter(s => !selectedSkins.includes(s.id));
    let newBalance = user.balance;

    if (success) {
      // Gana dinero en upgrade exitoso (150% del valor invertido)
      const winAmount = totalValue * 1.5;
      newBalance = newBalance + winAmount;
      alert(`🎉 ¡Upgrade exitoso! Ganaste €${winAmount.toFixed(2)}`);
    } else {
      // Pierde el dinero invertido
      alert(`❌ Upgrade fallido. Perdiste €${totalValue.toFixed(2)}`);
    }

    updateUser({
      ...user,
      inventory: newInventory,
      balance: parseFloat(newBalance.toFixed(2))
    });

    setSelectedSkins([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "600px",
        width: "90%",
        border: "2px solid rgba(59, 130, 246, 0.2)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
      }}>
        <h2 style={{
          color: "#3b82f6",
          margin: "0 0 24px 0",
          fontSize: "1.8rem",
          fontWeight: "bold"
        }}>
          ⬆️ Upgrade Avanzado
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar skins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            background: "rgba(59, 130, 246, 0.05)",
            color: "white",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
        />

        {/* Grid de skins */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "12px",
          maxHeight: "300px",
          overflowY: "auto",
          marginBottom: "24px"
        }}>
          {filteredSkins.map(skin => (
            <div
              key={skin.id}
              onClick={() => setSelectedSkins(prev =>
                prev.includes(skin.id)
                  ? prev.filter(id => id !== skin.id)
                  : [...prev, skin.id]
              )}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: selectedSkins.includes(skin.id)
                  ? `2px solid ${getRarityColor(skin.rarity)?.color || '#3b82f6'}`
                  : "1px solid rgba(255,255,255,0.1)",
                background: selectedSkins.includes(skin.id)
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(255,255,255,0.05)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
                transform: selectedSkins.includes(skin.id) ? "scale(1.05)" : "scale(1)"
              }}
            >
              <div style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {skin.name}
              </div>
              <div style={{
                fontSize: "0.85rem",
                fontWeight: "bold",
                color: "#3b82f6"
              }}>
                €{skin.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <div style={{
            background: "rgba(59, 130, 246, 0.1)",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid rgba(59, 130, 246, 0.3)"
          }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Valor Invertido
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#3b82f6" }}>
              €{totalValue.toFixed(2)}
            </div>
          </div>
          <div style={{
            background: "rgba(34, 197, 94, 0.1)",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid rgba(34, 197, 94, 0.3)"
          }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Posibilidad de Éxito
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#22c55e" }}>
              {calculateOdds()}%
            </div>
          </div>
        </div>

        {/* Info de ganancia */}
        {totalValue > 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
              Si ganas:
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#22c55e" }}>
              +€{(totalValue * 1.5).toFixed(2)}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
              50% de ganancia adicional
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleUpgrade}
            disabled={selectedSkins.length === 0}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: selectedSkins.length > 0
                ? "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
                : "rgba(255,255,255,0.1)",
              color: selectedSkins.length > 0 ? "white" : "rgba(255,255,255,0.5)",
              fontWeight: "bold",
              cursor: selectedSkins.length > 0 ? "pointer" : "not-allowed"
            }}
          >
            Hacer Upgrade
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
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Upgrade() {
  const { user, updateUser } = useAuth();
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetSkin, setTargetSkin] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  if (!user) return <div className="container"><h1>Inicia sesión para jugar</h1></div>;

  const handleMouseDown = (id) => { setIsDragging(true); toggleSkin(id); };
  const handleMouseEnter = (id) => { if (isDragging) toggleSkin(id); };
  const toggleSkin = (id) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

  // Nueva función para seleccionar todas las skins
  const selectAllSkins = () => {
    const allIds = user.inventory.map(s => s.id);
    setSelectedIds(allIds);
  };

const calculateChance = () => {
  if (selectedIds.length === 0 || !targetSkin) return 0;

  const myValue = user.inventory
    .filter(s => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const ratio = myValue / targetSkin.price;

  let chance = ratio * 60;

  // penalización progresiva por muchas skins
  chance -= selectedIds.length * 3;

  // penalización si la skin es muy cara
  if (targetSkin.price > 500) {
    chance -= (targetSkin.price - 500) / 40;
  }

  return Math.max(Math.min(chance, 85), 1);
};

  const executeUpgrade = () => {
  const chance = Number(calculateChance().toFixed(2));    const roll = Math.random() * 100;
  const success = roll <= chance;

    const newInventory = user.inventory.filter(s => !selectedIds.includes(s.id));

    if (success) {
      const wonSkin = { ...targetSkin, id: `upgrade-${Date.now()}` };
      newInventory.push(wonSkin);
      setResult({ success: true, skin: wonSkin });
    } else setResult({ success: false });

    updateUser({ ...user, inventory: newInventory });
    setSelectedIds([]);
    setTargetSkin(null);
  };

  const totalBetValue = selectedIds.length > 0 ? user.inventory.filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + (s.price || 0), 0) : 0;
  const chance = Number(calculateChance().toFixed(2));
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      background: 'linear-gradient(135deg, #050812 0%, #0a0f1e 50%, #040609 100%)',
      color: 'white',
      padding: '24px'
    }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', width: '100%', height: 'calc(100vh - 48px)' }}>

        {/* COLUMNA IZQUIERDA - INVENTARIO */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8), rgba(26, 31, 58, 0.8))',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(59, 130, 246, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Tu Inventario</h2>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Selecciona tus skins para apostar</p>
          </div>

          {/* BOTÓN SELECCIONAR TODAS */}
          {user.inventory.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <button
                onClick={selectAllSkins}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)'}
                onMouseLeave={e => e.target.style.boxShadow = 'none'}
              >
                Seleccionar Todas
              </button>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '8px'
          }}>
            {user.inventory.length > 0 ? (
              user.inventory.map(skin => (
                <div
                  key={skin.id}
                  onMouseDown={() => handleMouseDown(skin.id)}
                  onMouseEnter={() => handleMouseEnter(skin.id)}
                  style={{
                    padding: '12px',
                    border: selectedIds.includes(skin.id) ? '2px solid #10b981' : '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100px',
                    background: selectedIds.includes(skin.id) ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))' : 'rgba(15, 23, 42, 0.6)',
                    boxShadow: selectedIds.includes(skin.id) ? '0 0 20px rgba(16, 185, 129, 0.5), inset 0 0 10px rgba(16, 185, 129, 0.1)' : 'inset 0 0 10px rgba(59, 130, 246, 0.05)',
                    transform: selectedIds.includes(skin.id) ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(55, 65, 81, 0.6)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#9ca3af'
                  }}>
                    IMG
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    textAlign: 'center',
                    lineHeight: '1.2',
                    marginBottom: '4px'
                  }}>
                    {skin.name}
                  </div>
                  <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>
                    ${skin.price}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                Sin skins en tu inventario
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA CENTRO - CÍRCULO Y BOTÓN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.9), rgba(26, 31, 58, 0.9))',
          padding: '32px',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(16, 185, 129, 0.05)',
          gap: '24px'
        }}>

          {/* CÍRCULO DE PROBABILIDAD */}
          <div style={{ width: '180px', height: '180px' }}>
          <CircularProgressbar
            value={chance}
            text={`${chance}%`}
            styles={buildStyles({
              rotation: 0.25,
              strokeLinecap: 'round',
              pathColor: '#10b981',
              textColor: '#10b981',
              trailColor: '#1f2937',
              textSize: '20px',
            })}
          />
          </div>

          <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '500' }}>Posibilidad de Mejorar</p>

          {selectedIds.length > 1 && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#fca5a5',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              ⚠️ -{(selectedIds.length - 1) * 5}% por {selectedIds.length} skins<br/>
              <span style={{fontSize: '10px'}}>Necesitas ${targetSkin?.price || 0} en valor</span>
            </div>
          )}

          {/* MONTO TOTAL */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
              ${totalBetValue}
            </div>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Total Apostado</p>
          </div>

          {/* BOTÓN PRINCIPAL */}
          <button
            onClick={executeUpgrade}
            disabled={!targetSkin || selectedIds.length === 0}
            style={{
              width: '100%',
              padding: '16px',
              background: !targetSkin || selectedIds.length === 0 
                ? 'rgba(55, 65, 81, 0.5)' 
                : 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: !targetSkin || selectedIds.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: !targetSkin || selectedIds.length === 0 ? 'none' : '0 0 30px rgba(16, 185, 129, 0.5)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: !targetSkin || selectedIds.length === 0 ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!(!targetSkin || selectedIds.length === 0)) {
                e.target.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.7)';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!targetSkin || selectedIds.length === 0)) {
                e.target.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.5)';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {selectedIds.length === 0 ? 'Selecciona Skins' : !targetSkin ? 'Elige un Artículo' : 'INTENTAR UPGRADE'}
          </button>

          {/* RESULTADO */}
          {result && (
            <div style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: '600',
              border: result.success ? '2px solid #10b981' : '2px solid #ef4444',
              background: result.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: result.success ? '#86efac' : '#fca5a5',
              animation: 'slideIn 0.3s ease'
            }}>
              {result.success ? (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>¡GANASTE!</div>
                  <div style={{ fontSize: '12px' }}>{result.skin.name}</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Perdiste</div>
                  <div style={{ fontSize: '12px' }}>Tus skins fueron apostados</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA - ARTÍCULOS DISPONIBLES */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8), rgba(26, 31, 58, 0.8))',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(251, 191, 36, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Elige tu Artículo</h2>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Qué quieres mejorar</p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '8px'
          }}>
            {PAGE_SKINS.map(skin => (
              <div
                key={skin.id}
                onClick={() => setTargetSkin(skin)}
                style={{
                  padding: '16px',
                  border: targetSkin?.id === skin.id ? '2px solid #fbbf24' : '1px solid rgba(251, 191, 36, 0.15)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: '16px',
                  background: targetSkin?.id === skin.id ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.08))' : 'rgba(15, 23, 42, 0.6)',
                  boxShadow: targetSkin?.id === skin.id ? '0 0 20px rgba(251, 191, 36, 0.5), inset 0 0 10px rgba(251, 191, 36, 0.1)' : 'inset 0 0 10px rgba(251, 191, 36, 0.05)',
                  transform: targetSkin?.id === skin.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '64px',
                  height: '64px',
                  background: 'rgba(55, 65, 81, 0.6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#9ca3af'
                }}>
                  IMG
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {skin.name}
                  </div>
                  <div style={{ color: skin.color, fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
                    ${skin.price}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {skin.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
