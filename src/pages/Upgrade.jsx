import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const PAGE_SKINS = [
  { id: 'p1', name: "Karambit | Doppler", price: 1200, rarity: "Legendary", color: "#fe4a49" },
  { id: 'p2', name: "M4A1-S | Knight", price: 800, rarity: "Ancient", color: "#eb4b4b" },
  { id: 'p3', name: "Desert Eagle | Blaze", price: 450, rarity: "Exotic", color: "#d32ee6" },
  { id: 'p4', name: "StatTrak™ AK-47 | Vulcan", price: 600, rarity: "Covert", color: "#eb4b4b" },
];

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
    const myValue = user.inventory.filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + (s.price || 0), 0);
    const ratio = myValue / targetSkin.price;

    let baseChance = ratio * 50;
    const skinPenalty = selectedIds.length > 1 ? (selectedIds.length - 1) * 5 : 0;
    const targetValue = targetSkin.price;
    const valuePenalty = Math.max(0, (targetValue - 500) / 50);

    const finalChance = Math.max(Math.min(baseChance - skinPenalty - valuePenalty, 90), 0);
    return finalChance.toFixed(2);
  };

  const executeUpgrade = () => {
    const chance = calculateChance();
    const roll = Math.random() * 100;
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
  const chance = calculateChance();

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
