import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { getRarityColor } from "../constants/colors.js";

const UpgradeSpinner = ({ chance, isSpinning, resultDegree, onComplete }) => {
  const tickRef = useRef(null);

  useEffect(() => {
    if (isSpinning && tickRef.current) {
      const targetRotation = 1800 + resultDegree;
      tickRef.current.style.transition = "transform 4s cubic-bezier(0.12, 0.8, 0.15, 1)";
      tickRef.current.style.transform = `rotate(${targetRotation}deg)`;

      const timer = setTimeout(() => {
        onComplete();
      }, 4500);

      return () => clearTimeout(timer);
    } else if (!isSpinning && tickRef.current) {
      tickRef.current.style.transition = "none";
      tickRef.current.style.transform = `rotate(0deg)`;
    }
  }, [isSpinning, resultDegree, onComplete]);

  return (
    <div style={{
      position: "relative",
      width: "360px",
      height: "360px",
      borderRadius: "50%",
      margin: "0 auto",
      background: "#0c0d10",
      boxShadow: "0 0 100px rgba(0,0,0,0.8), inset 0 0 50px rgba(255,255,255,0.02)",
      border: '4px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Glow effect based on probability */}
      <div style={{
        position: 'absolute',
        inset: '-20px',
        borderRadius: '50%',
        background: `conic-gradient(#f5ac3b ${chance}%, #3b82f6 ${chance}%)`,
        opacity: 0.1,
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      {/* SVG Wheel */}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", top: 10, left: 10, width: "calc(100% - 20px)", height: "calc(100% - 20px)", transform: "rotate(-90deg)", zIndex: 1 }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="6" strokeOpacity="0.2" />
        {chance > 0 && (
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="#f5ac3b" strokeWidth="6"
            strokeDasharray={`${(chance / 100) * 283} 283`}
            strokeLinecap="round"
            style={{ transition: "all 0.5s ease", filter: 'drop-shadow(0 0 10px rgba(245, 172, 59, 0.5))' }}
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
          position: "absolute", top: "5px", left: "50%", transform: "translateX(-50%)",
          width: "4px", height: "40px",
          background: "white",
          borderRadius: '4px',
          boxShadow: "0 0 20px rgba(255,255,255,1)"
        }}></div>
      </div>

      {/* Center Label */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center" }}>
        <motion.div
          key={chance}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: "4.5rem",
            fontWeight: "900",
            color: "white",
            lineHeight: '1',
            letterSpacing: '-3px'
          }}
        >
          {chance.toFixed(2)}<span style={{ fontSize: '1.5rem', color: '#f5ac3b' }}>%</span>
        </motion.div>
        <div style={{
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "4px",
          marginTop: '10px',
          fontWeight: '900'
        }}>
          PROBABILIDAD
        </div>
      </div>
    </div>
  );
};

export default function Upgrade() {
  const { user, updateUser } = useAuth();
  const { skins: allSkins } = useFetchSkins(1000, false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [targetSkins, setTargetSkins] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultDegree, setResultDegree] = useState(0);
  const [pendingResult, setPendingResult] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [searchRight, setSearchRight] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState(null); // 'select' or 'deselect'
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragAction(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const validTargets = useMemo(() => {
    let pool = allSkins.filter(s => s.price > 0.5 && s.image && s.name);
    if (searchRight) {
      pool = pool.filter(s => s.name.toLowerCase().includes(searchRight.toLowerCase()));
    }
    return pool.sort((a, b) => a.price - b.price);
  }, [allSkins, searchRight]);

  const paginatedTargets = useMemo(() => {
    const start = page * itemsPerPage;
    return validTargets.slice(start, start + itemsPerPage);
  }, [validTargets, page]);

  const maxPages = Math.ceil(validTargets.length / itemsPerPage);

  const toggleTargetSkin = (skin) => {
    if (isSpinning) return;
    setTargetSkins(prev => {
      const exists = prev.find(s => s.id === skin.id);
      if (exists) return prev.filter(s => s.id !== skin.id);
      if (prev.length >= 4) return prev;
      return [...prev, skin];
    });
  };

  const handleSkinMouseDown = (id) => {
    if (isSpinning) return;
    const isSelected = selectedIds.includes(id);
    const newAction = isSelected ? 'deselect' : 'select';
    setDragAction(newAction);
    setIsDragging(true);
    if (newAction === 'select') {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleSkinMouseEnter = (id) => {
    if (!isDragging || isSpinning) return;
    if (dragAction === 'select') {
      setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleTargetMouseDown = (skin) => {
    if (isSpinning) return;
    const isSelected = targetSkins.find(s => s.id === skin.id);
    const newAction = isSelected ? 'deselect' : 'select';
    setDragAction(newAction);
    setIsDragging(true);
    toggleTargetSkin(skin);
  };

  const handleTargetMouseEnter = (skin) => {
    if (!isDragging || isSpinning) return;
    const isSelected = targetSkins.find(s => s.id === skin.id);
    if (dragAction === 'select' && !isSelected) {
      toggleTargetSkin(skin);
    } else if (dragAction === 'deselect' && isSelected) {
      toggleTargetSkin(skin);
    }
  };

  const calculateChance = () => {
    if (selectedIds.length === 0 || targetSkins.length === 0) return 0;
    const totalBetValue = (user?.inventory || []).filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + (s.price || 0), 0);
    const totalTargetValue = targetSkins.reduce((sum, s) => sum + (s.price || 0), 0);
    const ratio = totalBetValue / totalTargetValue;
    return Math.max(Math.min(ratio * 95, 95), 0.01);
  };

  const chance = calculateChance();
  const totalBetValue = selectedIds.length > 0 ? (user?.inventory || []).filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + (s.price || 0), 0) : 0;
  const totalTargetValue = targetSkins.reduce((sum, s) => sum + (s.price || 0), 0);

  const handleSpinClick = () => {
    if (selectedIds.length === 0 || targetSkins.length === 0 || isSpinning) return;
    setLastResult(null);
    setIsSpinning(true);
    const finalDeg = Math.random() * 360;
    setResultDegree(finalDeg);
    const winDegrees = chance * 3.6;
    const success = finalDeg <= winDegrees;
    setPendingResult({
      success,
      wonSkins: targetSkins.map(s => ({ ...s, id: `upg-${Date.now()}-${Math.random()}` }))
    });
  };

  const handleAnimationComplete = () => {
    setIsSpinning(false);
    if (pendingResult) {
      const newInventory = (user?.inventory || []).filter(s => !selectedIds.includes(s.id));
      if (pendingResult.success) {
        newInventory.push(...pendingResult.wonSkins);
        setLastResult({ success: true, skins: pendingResult.wonSkins });
      } else {
        setLastResult({ success: false });
      }
      updateUser({ ...user, inventory: newInventory });
      setSelectedIds([]);
      setTargetSkins([]);
      setPendingResult(null);
    }
  };

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115', color: "white", fontSize: "2rem", fontWeight: '900' }}>INICIA SESIÓN PARA JUGAR</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1115",
      padding: "40px",
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: "1600px",
        width: '100%',
        margin: "0 auto",
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr minmax(350px, 1fr)',
        gap: '40px',
        flex: 1
      }}>

        {/* INVENTORY COLUMN */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            display: 'flex', flexDirection: 'column',
            background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)',
            maxHeight: 'calc(100vh - 80px)', backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: '30px' }}>
            <div>
              <h2 style={{ fontSize: '0.8rem', fontWeight: '900', margin: 0, color: '#f5ac3b', letterSpacing: '3px', textTransform: 'uppercase' }}>Tu Inventario</h2>
              <div style={{ color: "white", fontSize: "2.5rem", fontWeight: "900", letterSpacing: '-1.5px' }}>{totalBetValue.toFixed(2)}€</div>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              disabled={isSpinning || selectedIds.length === 0}
              style={{
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "14px",
                padding: "10px 20px",
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => !isSpinning && (e.target.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => !isSpinning && (e.target.style.background = 'rgba(255,255,255,0.03)')}
            >BORRAR TODO</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
            {(user?.inventory || []).filter(s => s.image && s.name && s.price > 0).map((skin, i) => {
              const isSelected = selectedIds.includes(skin.id);
              const color = getRarityColor(skin.rarity);
              return (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onMouseDown={() => handleSkinMouseDown(skin.id)}
                  onMouseEnter={() => handleSkinMouseEnter(skin.id)}
                  style={{
                    background: isSelected ? `${color}15` : 'rgba(255,255,255,0.02)',
                    border: isSelected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '24px', padding: '15px', cursor: 'grab', textAlign: 'center', transition: "all 0.2s",
                    aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    userSelect: 'none'
                  }}
                >
                  <img src={skin.image} alt={skin.name} style={{ width: "80%", height: "60%", objectFit: "contain", filter: `drop-shadow(0 10px 15px rgba(0,0,0,0.4))`, pointerEvents: 'none' }} />
                  <div style={{ color: "white", fontSize: "0.7rem", fontWeight: "800", marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '90%', pointerEvents: 'none' }}>{skin.name}</div>
                  <div style={{ color: "#f5ac3b", fontWeight: "900", fontSize: "1rem", marginTop: '2px', pointerEvents: 'none' }}>{skin.price.toFixed(2)}€</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CENTER COLUMN */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '50px', position: "relative"
        }}>
          <UpgradeSpinner chance={chance} isSpinning={isSpinning} resultDegree={resultDegree} onComplete={handleAnimationComplete} />

          <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: "25px", alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '15px', textTransform: 'uppercase' }}>Seleccionado</div>
              <div style={{
                height: '140px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '900',
                color: '#fff',
                letterSpacing: '-1px'
              }}>
                {totalBetValue.toFixed(2)}€
              </div>
            </div>

            <div style={{ fontSize: '2.5rem', opacity: 0.1, color: 'white' }}>➔</div>

            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981', letterSpacing: '3px', marginBottom: '15px', textTransform: 'uppercase' }}>Recompensa</div>
              <div style={{
                height: '140px',
                background: targetSkins.length > 0 ? `rgba(16, 185, 129, 0.05)` : 'rgba(255,255,255,0.01)',
                borderRadius: '32px',
                border: targetSkins.length > 0 ? `2px solid rgba(16, 185, 129, 0.2)` : '1px dashed rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                gap: '5px',
                padding: '10px'
              }}>
                {targetSkins.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {targetSkins.map(s => (
                        <img key={s.id} src={s.image} style={{ width: targetSkins.length > 1 ? '45px' : '90px', height: 'auto', objectFit: 'contain' }} />
                      ))}
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', color: '#10b981', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-0.5px', background: 'rgba(0,0,0,0.6)', padding: '2px 10px', borderRadius: '10px' }}>
                      {totalTargetValue.toFixed(2)}€
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.05)', fontSize: '3rem', fontWeight: '900' }}>?</div>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={(!targetSkins.length || selectedIds.length === 0 || isSpinning) ? {} : { scale: 1.02, translateY: -5 }}
            whileTap={(!targetSkins.length || selectedIds.length === 0 || isSpinning) ? {} : { scale: 0.98 }}
            onClick={handleSpinClick}
            disabled={!targetSkins.length || selectedIds.length === 0 || isSpinning}
            style={{
              width: '100%', padding: '28px',
              background: !targetSkins.length || selectedIds.length === 0 || isSpinning ? 'rgba(255,255,255,0.03)' : 'linear-gradient(90deg, #f5ac3b, #ffba52)',
              color: !targetSkins.length || selectedIds.length === 0 || isSpinning ? 'rgba(255,255,255,0.2)' : 'black',
              border: 'none', borderRadius: '24px', fontWeight: '900', fontSize: '1.5rem',
              cursor: 'pointer', transition: "all 0.3s",
              boxShadow: targetSkins.length && selectedIds.length && !isSpinning ? '0 20px 50px rgba(245, 172, 59, 0.3)' : 'none',
              letterSpacing: '2px'
            }}
          >
            {isSpinning ? 'MEJORANDO...' : 'INTENTAR UPGRADE 🚀'}
          </motion.button>

          <AnimatePresence>
            {lastResult && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", zIndex: 100,
                  background: lastResult.success ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  padding: "60px 40px", borderRadius: "40px", textAlign: "center",
                  boxShadow: "0 50px 150px rgba(0,0,0,0.9)",
                }}
              >
                <div style={{ fontSize: "5rem", marginBottom: "20px" }}>{lastResult.success ? '🔥' : '💀'}</div>
                <h3 style={{ color: "white", fontSize: "3rem", margin: "0 0 15px 0", fontWeight: '900', letterSpacing: '-1.5px' }}>
                  {lastResult.success ? '¡UPGRADE ÉPICO!' : 'HAS FALLADO'}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', fontWeight: '600', marginBottom: '30px' }}>
                  {lastResult.success ? `¡Felicidades! Has conseguido esta skin épica.` : 'No te rindas, la suerte es para los valientes.'}
                </p>
                {lastResult.success && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '30px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                    {lastResult.skins.map(skin => (
                      <div key={skin.id} style={{ textAlign: 'center' }}>
                        <img src={skin.image} style={{ width: "100px", margin: "0 auto", filter: 'drop-shadow(0 0 30px white)' }} />
                        <div style={{ color: "white", fontWeight: "900", fontSize: "0.9rem", marginTop: '10px' }}>{skin.name}</div>
                        <div style={{ color: "#fff", fontWeight: "900", fontSize: "1.2rem", opacity: 0.8 }}>{skin.price.toFixed(2)}€</div>
                      </div>
                    ))}
                    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', color: '#10b981', fontWeight: '900', fontSize: '1.8rem' }}>
                      TOTAL: {lastResult.skins.reduce((a, b) => a + b.price, 0).toFixed(2)}€
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setLastResult(null)}
                  style={{ padding: '15px 40px', borderRadius: '18px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                >CONTINUAR</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TARGET STORE COLUMN */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            display: 'flex', flexDirection: 'column',
            background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)',
            maxHeight: 'calc(100vh - 80px)', backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: '900', margin: "0 0 20px 0", color: '#10b981', letterSpacing: '3px', textTransform: 'uppercase' }}>Target Store</h2>
            <div style={{ position: 'relative' }}>
              <input
                type="text" placeholder="Buscar skin de destino..." value={searchRight} onChange={e => setSearchRight(e.target.value)}
                style={{
                  width: "100%", padding: "20px 25px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(0,0,0,0.2)", color: "white", fontSize: "1rem", fontWeight: '600', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
            {paginatedTargets.map((skin, i) => {
              const isTargeted = targetSkins.find(s => s.id === skin.id);
              const color = getRarityColor(skin.rarity);
              return (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onMouseDown={() => handleTargetMouseDown(skin)}
                  onMouseEnter={() => handleTargetMouseEnter(skin)}
                  style={{
                    background: isTargeted ? `${color}15` : 'rgba(255,255,255,0.02)',
                    border: isTargeted ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '24px', padding: '15px', cursor: 'grab', textAlign: 'center', transition: "all 0.2s",
                    aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    userSelect: 'none'
                  }}
                >
                  <img src={skin.image} alt={skin.name} style={{ width: "80%", height: "60%", objectFit: "contain", filter: `drop-shadow(0 10px 15px rgba(0,0,0,0.4))`, pointerEvents: 'none' }} />
                  <div style={{ color: "white", fontSize: "0.7rem", fontWeight: "800", marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '90%', pointerEvents: 'none' }}>{skin.name}</div>
                  <div style={{ color: "#10b981", fontWeight: "900", fontSize: "1rem", marginTop: '2px', pointerEvents: 'none' }}>{skin.price.toFixed(2)}€</div>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '10px' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px 15px',
                borderRadius: '12px', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.3 : 1
              }}
            >◀</button>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '0.9rem' }}>
              PÁGINA {page + 1} DE {maxPages}
            </span>
            <button
              disabled={page >= maxPages - 1}
              onClick={() => setPage(p => Math.min(maxPages - 1, p + 1))}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px 15px',
                borderRadius: '12px', cursor: page >= maxPages - 1 ? 'default' : 'pointer', opacity: page >= maxPages - 1 ? 0.3 : 1
              }}
            >▶</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
