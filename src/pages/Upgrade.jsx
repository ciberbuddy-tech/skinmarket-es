import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { getRarityColor } from "../constants/colors.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// The Spinner Tick Marker Component
const UpgradeSpinner = ({ chance, isSpinning, resultDegree, onComplete }) => {
  const tickRef = useRef(null);

  useEffect(() => {
    if (isSpinning && tickRef.current) {
      // Rotate 5 full circles (1800 deg) + the result degree
      const targetRotation = 1800 + resultDegree;

      tickRef.current.style.transition = "transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)";
      tickRef.current.style.transform = `rotate(${targetRotation}deg)`;

      const timer = setTimeout(() => {
        onComplete();
      }, 4100);

      return () => clearTimeout(timer);
    } else if (!isSpinning && tickRef.current) {
      tickRef.current.style.transition = "none";
      tickRef.current.style.transform = `rotate(0deg)`;
    }
  }, [isSpinning, resultDegree, onComplete]);

  // Convert chance (0-100) to degrees (0-360) for the SVG green path
  const winDegrees = chance * 3.6;

  return (
    <div style={{ position: "relative", width: "240px", height: "240px", borderRadius: "50%", margin: "0 auto", background: "#0a0c0f", boxShadow: "0 0 50px rgba(0,0,0,0.5)" }}>
      {/* Background Circle (Loss Area) */}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="10" opacity="0.2" />

        {/* Foreground Circle (Win Area) */}
        {chance > 0 && (
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="10"
            strokeDasharray={`${(chance / 100) * 283} 283`} // 2 * PI * r = 282.7
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.3s ease" }}
          />
        )}
      </svg>

      {/* The Tick Pointer */}
      <div
        ref={tickRef}
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          transformOrigin: "center center", zIndex: 10
        }}
      >
        <div style={{
          position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
          width: "0", height: "0",
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "20px solid white",
          filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))"
        }}></div>
      </div>

      {/* Center Label */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981", filter: "drop-shadow(0 0 10px rgba(16,185,129,0.5))" }}>
          {chance < 1 ? chance.toFixed(4) : chance.toFixed(2)}%
        </div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Probabilidad
        </div>
      </div>
    </div>
  );
};

export default function Upgrade() {
  const { user, updateUser } = useAuth();

  // We fetch a lot of skins to use as realistic targets for Upgrade
  const { skins: allSkins, loading: skinsLoading } = useFetchSkins(1000, false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [targetSkin, setTargetSkin] = useState(null);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);

  // Upgrade spinning state
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultDegree, setResultDegree] = useState(0);
  const [pendingResult, setPendingResult] = useState(null); // holds data until animation finishes
  const [lastResult, setLastResult] = useState(null); // { success: true/false, skin: {} }
  const [searchRight, setSearchRight] = useState("");

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Targets formatted from big skin pool
  const validTargets = useMemo(() => {
    let pool = allSkins.filter(s => s.price > 0.5);
    if (searchRight) {
      pool = pool.filter(s => s.name.toLowerCase().includes(searchRight.toLowerCase()));
    }
    // Sort cheapest to max
    return pool.sort((a, b) => a.price - b.price).slice(0, 150); // limit to 150 rendering
  }, [allSkins, searchRight]);

  if (!user) return <div style={{ padding: "40px", color: "white", textAlign: "center", fontSize: "2rem" }}>Inicia sesión para jugar Upgrades</div>;

  const handleMouseDown = (id) => { setIsDragging(true); toggleSkin(id); };
  const handleMouseEnter = (id) => { if (isDragging) toggleSkin(id); };
  const toggleSkin = (id) => {
    if (!isSpinning) setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllSkins = () => {
    if (!isSpinning) setSelectedIds(user.inventory.map(s => s.id));
  };
  const clearSelection = () => {
    if (!isSpinning) setSelectedIds([]);
  }

  // Value formatting
  const totalBetValue = selectedIds.length > 0 ? user.inventory.filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + (s.price || 0), 0) : 0;

  const calculateChance = () => {
    if (selectedIds.length === 0 || !targetSkin) return 0;

    // Exact math for casino upgrader
    const ratio = totalBetValue / targetSkin.price;
    let chance = ratio * 100;

    // Small house edge penalty mapping (e.g. 10% fee means expected value decreases)
    chance = chance * 0.95; // 5% house edge on upgrades typically

    return Math.max(Math.min(chance, 95), 0.0001); // Realistic floor and higher ceiling
  };

  const chance = calculateChance();

  const handleSpinClick = () => {
    if (selectedIds.length === 0 || !targetSkin || isSpinning) return;

    setLastResult(null);
    setIsSpinning(true);

    // Roll random 0 - 360
    const finalDeg = Math.random() * 360;
    setResultDegree(finalDeg);

    const winDegrees = chance * 3.6;
    const success = finalDeg <= winDegrees;

    // Buffer the final result until animation resolves
    setPendingResult({ success, wonSkin: { ...targetSkin, id: `upg-${Date.now()}` } });
  };

  const handleAnimationComplete = () => {
    setIsSpinning(false);

    if (pendingResult) {
      const newInventory = user.inventory.filter(s => !selectedIds.includes(s.id));

      if (pendingResult.success) {
        newInventory.push(pendingResult.wonSkin);
        setLastResult({ success: true, skin: pendingResult.wonSkin });
      } else {
        setLastResult({ success: false });
      }

      updateUser({ ...user, inventory: newInventory });
      setSelectedIds([]);
      // We optionally reset targetSkin or leave it for quick replay
      setPendingResult(null);
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0a0c0f',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 500px minmax(300px, 1fr)', gap: '30px', height: 'calc(100vh - 80px)' }}>

        {/* LEFT COLUMN - USER INVENTORY */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          background: '#111318', padding: '24px', borderRadius: '20px', border: '1px solid #1f232b',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden'
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", background: "rgba(245,172,59,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🎒</div>
                Tu Inventario
              </h2>
              <div style={{ color: "#f5ac3b", fontSize: "1.2rem", fontWeight: "bold", marginTop: "5px" }}>€{totalBetValue.toFixed(2)} Seleccionado</div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={clearSelection} disabled={isSpinning || selectedIds.length === 0}
                style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "8px 12px", cursor: isSpinning || selectedIds.length === 0 ? "not-allowed" : "pointer" }}
              >Limpiar</button>
              <button
                onClick={selectAllSkins} disabled={isSpinning || user.inventory.length === 0}
                style={{ background: "rgba(245, 172, 59, 0.1)", color: "#f5ac3b", border: "1px solid rgba(245,172,59, 0.3)", borderRadius: "8px", padding: "8px 12px", cursor: isSpinning || user.inventory.length === 0 ? "not-allowed" : "pointer" }}
              >Todo</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            {user.inventory.length > 0 ? (
              user.inventory.map(skin => {
                const isSelected = selectedIds.includes(skin.id);
                return (
                  <div
                    key={skin.id}
                    onMouseDown={() => handleMouseDown(skin.id)} onMouseEnter={() => handleMouseEnter(skin.id)}
                    style={{
                      background: isSelected ? `radial-gradient(circle at center, ${getRarityColor(skin.rarity)}40 0%, #16181c 80%)` : `radial-gradient(circle at center, #1a1d24 0%, #101215 100%)`,
                      border: `2px solid ${isSelected ? getRarityColor(skin.rarity) : "#2a2e38"}`,
                      borderRadius: '12px', padding: '15px', cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: "140px",
                      boxShadow: isSelected ? `0 0 20px ${getRarityColor(skin.rarity)}30` : 'none',
                      userSelect: 'none', transition: "all 0.1s"
                    }}
                  >
                    <img src={skin.image} alt={skin.name} style={{ width: "80px", height: "60px", objectFit: "contain", filter: `drop-shadow(0 0 10px ${getRarityColor(skin.rarity)}50)` }} onError={(e) => e.target.style.display = "none"} />
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", marginTop: "10px", textTransform: "uppercase" }}>{skin.rarity}</div>
                    <div style={{ color: "white", fontSize: "0.75rem", textAlign: "center", width: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontWeight: "bold" }}>{skin.name}</div>
                    <div style={{ color: "#f5ac3b", fontWeight: "bold", fontSize: "0.9rem", marginTop: "5px" }}>€{parseFloat(skin.price).toFixed(2)}</div>
                  </div>
                )
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontSize: "1.2rem" }}>
                Inventario vacío
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN - UPGRADER CORE */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #111318 0%, #0a0c0f 100%)', padding: '40px', borderRadius: '20px',
          border: '1px solid #1f232b', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', gap: '30px', position: "relative"
        }}>

          {/* Center Upgrader Circle */}
          <UpgradeSpinner chance={chance} isSpinning={isSpinning} resultDegree={resultDegree} onComplete={handleAnimationComplete} />

          {/* Targeted Item Preview Inside Container */}
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "20px", marginTop: "40px" }}>
            <div style={{ flex: 1, background: "#16181c", borderRadius: "12px", border: "1px dashed #2a2e38", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center", opacity: selectedIds.length ? 1 : 0.4 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "15px", textTransform: "uppercase" }}>Input Apostado</div>
              <div style={{ fontSize: "2.5rem" }}>📦</div>
              <div style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: "bold", marginTop: "10px" }}>€{totalBetValue.toFixed(2)}</div>
            </div>

            <div style={{ flex: 1, background: targetSkin ? `radial-gradient(circle at center, ${getRarityColor(targetSkin.rarity)}20 0%, #16181c 80%)` : "#16181c", borderRadius: "12px", border: targetSkin ? `1px solid ${getRarityColor(targetSkin.rarity)}50` : "1px dashed #2a2e38", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center", opacity: targetSkin ? 1 : 0.4 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "10px", textTransform: "uppercase" }}>Target Output</div>
              {targetSkin ? (
                <>
                  <img src={targetSkin.image} style={{ width: "80px", height: "50px", objectFit: "contain", filter: `drop-shadow(0 0 10px ${getRarityColor(targetSkin.rarity)})` }} />
                  <div style={{ color: "#10b981", fontSize: "1.5rem", fontWeight: "bold", marginTop: "10px" }}>€{targetSkin.price.toFixed(2)}</div>
                </>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", textAlign: "center", marginTop: "20px" }}>Selecciona un Target ➔</div>
              )}
            </div>
          </div>

          {/* UPGRADE BUTTON */}
          <button
            onClick={handleSpinClick}
            disabled={!targetSkin || selectedIds.length === 0 || isSpinning}
            style={{
              width: '100%', padding: '20px',
              background: !targetSkin || selectedIds.length === 0 || isSpinning ? '#1a1d24' : 'linear-gradient(90deg, rgb(245, 172, 59), rgb(224, 153, 42))',
              color: !targetSkin || selectedIds.length === 0 || isSpinning ? 'rgba(255,255,255,0.3)' : 'black',
              border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.5rem', cursor: !targetSkin || selectedIds.length === 0 || isSpinning ? 'not-allowed' : 'pointer',
              boxShadow: targetSkin && selectedIds.length && !isSpinning ? '0 10px 40px rgba(245, 172, 59, 0.4)' : 'none',
              textTransform: 'uppercase', letterSpacing: '2px', transition: "all 0.2s"
            }}
          >
            {isSpinning ? 'UPGRADING...' : selectedIds.length === 0 ? 'ELIGE SKINS' : !targetSkin ? 'ELIGE TARGET' : 'UPGRADE'}
          </button>

          {/* Result Toast Overlay */}
          {lastResult && !isSpinning && (
            <div style={{
              position: "absolute", bottom: "30%", left: "50%", transform: "translate(-50%, 50%)", width: "90%",
              background: lastResult.success ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)', backdropFilter: "blur(10px)", border: `2px solid ${lastResult.success ? '#10b981' : '#ef4444'}`,
              padding: "20px", borderRadius: "16px", textAlign: "center", animation: "slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)", zIndex: 50, boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
              <h3 style={{ color: "white", fontSize: "2rem", margin: "0 0 10px 0" }}>
                {lastResult.success ? '🎉 UPGRADE EXITOSO 🎉' : '💀 UPGRADE FALLIDO 💀'}
              </h3>
              {lastResult.success ? (
                <>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem" }}>Has obtenido:</div>
                  <img src={lastResult.skin.image} style={{ width: "120px", display: "block", margin: "10px auto", filter: `drop-shadow(0 0 15px white)` }} />
                  <div style={{ color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>{lastResult.skin.name}</div>
                </>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", marginTop: "10px" }}>Tus skins han sido perdidas.</div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN - TARGET STORE */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          background: '#111318', padding: '24px', borderRadius: '20px', border: '1px solid #1f232b',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", background: "rgba(16, 185, 129, 0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🎯</div>
              Elige Target
            </h2>
            <input
              type="text" placeholder="Buscar skin..." value={searchRight} onChange={e => setSearchRight(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #2a2e38", background: "#0a0c0f", color: "white", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            {skinsLoading ? (
              <div style={{ color: "white", gridColumn: "1/-1", textAlign: "center", padding: "20px" }}>Cargando skins...</div>
            ) : validTargets.length > 0 ? (
              validTargets.map(skin => {
                const isTargeted = targetSkin?.id === skin.id;
                return (
                  <div
                    key={skin.id}
                    onClick={() => { if (!isSpinning) setTargetSkin(skin); }}
                    style={{
                      background: isTargeted ? `radial-gradient(circle at center, ${getRarityColor(skin.rarity)}40 0%, #16181c 80%)` : `radial-gradient(circle at center, #1a1d24 0%, #101215 100%)`,
                      border: `2px solid ${isTargeted ? getRarityColor(skin.rarity) : "#2a2e38"}`,
                      borderRadius: '12px', padding: '15px', cursor: isSpinning ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: "140px",
                      boxShadow: isTargeted ? `0 0 20px ${getRarityColor(skin.rarity)}30` : 'none',
                      transition: "all 0.1s"
                    }}
                  >
                    <img src={skin.image} alt={skin.name} style={{ width: "80px", height: "60px", objectFit: "contain", filter: `drop-shadow(0 0 10px ${getRarityColor(skin.rarity)}50)` }} onError={(e) => e.target.style.display = "none"} />
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", marginTop: "10px", textTransform: "uppercase" }}>{skin.rarity}</div>
                    <div style={{ color: "white", fontSize: "0.75rem", textAlign: "center", width: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontWeight: "bold" }}>{skin.name}</div>
                    <div style={{ color: "#10b981", fontWeight: "bold", fontSize: "0.9rem", marginTop: "5px" }}>€{parseFloat(skin.price).toFixed(2)}</div>
                  </div>
                )
              })
            ) : (
              <div style={{ color: "white", gridColumn: "1/-1", textAlign: "center", padding: "20px" }}>Skins no encontradas.</div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 70%); }
          to { opacity: 1; transform: translate(-50%, 50%); }
        }
      `}</style>
    </div>
  );
}
