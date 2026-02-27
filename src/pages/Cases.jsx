import { useAuth } from "../context/useAuth";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateAllCases } from "../constants/cases.js";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { getRarityColor } from "../constants/colors";

const DailyRouletteModal = ({ isOpen, onClose, rewardAmount, skinsPool }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [reel, setReel] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isSpinning && !hasRevealed) {
      // Preparar el reel
      const newReel = [];
      for (let i = 0; i < 60; i++) {
        newReel.push(skinsPool[Math.floor(Math.random() * skinsPool.length)]);
      }
      // El "ganador" será una skin ficticia que represente el valor o simplemente una skin cara/barata
      // Para simular KeyDrop, pondremos un item especial al final o la skin que toque
      const winnerSkin = skinsPool.find(s => s.price >= rewardAmount) || skinsPool[0];
      newReel.push(winnerSkin);
      for (let i = 0; i < 5; i++) {
        newReel.push(skinsPool[Math.floor(Math.random() * skinsPool.length)]);
      }
      setReel(newReel);

      // Iniciar giro tras un breve delay
      setTimeout(() => {
        setIsSpinning(true);
        if (containerRef.current) {
          const cardWidth = 160;
          const winnerIndex = newReel.length - 6;
          const offset = winnerIndex * cardWidth - (window.innerWidth < 600 ? 100 : 250); // Ajuste centro
          containerRef.current.style.transition = "transform 6s cubic-bezier(0.1, 0.7, 0.1, 1)";
          containerRef.current.style.transform = `translateX(-${offset}px)`;
        }
      }, 500);

      setTimeout(() => {
        setHasRevealed(true);
      }, 7000);
    }
  }, [isOpen, skinsPool, rewardAmount]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '100%', maxWidth: '900px', background: '#16191e', borderRadius: '40px',
        border: '1px solid rgba(255,255,255,0.05)', padding: '40px', position: 'relative', overflow: 'hidden'
      }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px', fontWeight: '900', letterSpacing: '2px' }}>RECOMPENSA DIARIA</h2>

        <div style={{
          height: '200px', background: '#0c0d10', border: '2px solid rgba(255,255,255,0.05)',
          borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center'
        }}>
          {/* Selector central */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px',
            background: '#f5ac3b', zIndex: 10, transform: 'translateX(-50%)', boxSShadow: '0 0 20px #f5ac3b'
          }} />

          <div ref={containerRef} style={{ display: 'flex', gap: '10px', paddingLeft: '50%', transition: 'none' }}>
            {reel.map((skin, i) => (
              <div key={i} style={{
                minWidth: '150px', height: '160px', background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '10px', borderBottom: `4px solid ${getRarityColor(skin?.rarity || 'Common')}`
              }}>
                <img src={skin?.image} style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{skin?.name}</div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {hasRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginTop: '30px' }}
            >
              <div style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>
                +{rewardAmount}€
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px', fontWeight: 'bold' }}>AÑADIDOS A TU SALDO</div>
              <button
                onClick={() => {
                  setHasRevealed(false);
                  setIsSpinning(false);
                  onClose();
                }}
                style={{
                  padding: '15px 40px', borderRadius: '20px', border: 'none',
                  background: 'linear-gradient(90deg, #f5ac3b, #ffba52)', fontWeight: '900', cursor: 'pointer'
                }}
              >ACEPTAR</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DailyCard = ({ dc, onClaimSuccess }) => {
  const { user, claimDaily } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!user?.ultimo_reclamo_diario) return 0;
      const lastClaim = new Date(user.ultimo_reclamo_diario).getTime();
      const waitTime = (dc.id === "daily-0" ? 12 : 24) * 60 * 60 * 1000;
      const now = new Date().getTime();
      const diff = waitTime - (now - lastClaim);
      return Math.max(0, diff);
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [user, dc]);

  const handleClaim = async (e) => {
    e.stopPropagation();
    if (timeLeft > 0) return;
    setIsClaiming(true);
    const res = await claimDaily();
    if (res.success) {
      onClaimSuccess(res.reward);
    } else {
      alert(res.error);
    }
    setIsClaiming(false);
  };

  const formatTime = (ms) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const canClaim = dc.unlocked && timeLeft === 0;

  return (
    <motion.div
      whileHover={canClaim ? { scale: 1.02, y: -5 } : {}}
      style={{
        background: dc.unlocked ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.4)',
        border: `1px solid ${dc.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'}`,
        borderRadius: '24px', padding: '25px', textAlign: 'center', position: 'relative',
        overflow: 'hidden', cursor: canClaim ? 'pointer' : 'default',
        opacity: dc.unlocked ? 1 : 0.6,
        transition: 'all 0.3s ease',
        boxShadow: canClaim ? `0 10px 40px ${dc.color}11` : 'none'
      }}
    >
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 150, height: 150,
        background: dc.color, filter: 'blur(70px)', opacity: canClaim ? 0.15 : 0.05,
        borderRadius: '50%', zIndex: 0
      }} />

      {!dc.unlocked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, flexDirection: 'column', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🔒</div>
          <div style={{ fontWeight: '900', fontSize: '0.7rem' }}>NIVEL {dc.level} REQUERIDO</div>
        </div>
      )}

      {dc.unlocked && timeLeft > 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, flexDirection: 'column', backdropFilter: 'blur(2px)' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>⏳</div>
          <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#f5ac3b' }}>{formatTime(timeLeft)}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>HASTA RECARGA</div>
        </div>
      )}

      <div style={{ fontSize: '4rem', marginBottom: '15px', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
        {dc.emoji}
        {dc.id === "daily-0" && (
          <div style={{ position: 'absolute', top: 0, right: 0, background: '#f5ac3b', color: 'black', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900' }}>12H</div>
        )}
      </div>

      <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: dc.color, fontWeight: '900', position: 'relative', zIndex: 1 }}>{dc.name}</h4>
      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
        {dc.id === "daily-0" ? "Disponible cada 12h" : "Disponible cada 24h"}
      </p>

      <button
        disabled={!canClaim || isClaiming}
        onClick={handleClaim}
        style={{
          marginTop: '20px', width: '100%', padding: '14px', borderRadius: '15px',
          background: canClaim ? dc.color : 'rgba(255,255,255,0.05)',
          border: 'none', color: canClaim ? 'black' : 'rgba(255,255,255,0.2)',
          fontWeight: '900', fontSize: '0.8rem', cursor: canClaim ? 'pointer' : 'default',
          position: 'relative', zIndex: 1,
          boxShadow: canClaim ? `0 8px 20px ${dc.color}44` : 'none',
          transition: 'all 0.3s'
        }}
      >
        {isClaiming ? "RECLAMANDO..." : (canClaim ? "RECLAMAR AHORA" : (timeLeft > 0 ? "EN ESPERA" : "RECLAMADO"))}
      </button>
    </motion.div>
  );
};

const CaseCard = ({ caseData, validSkins }) => {
  const navigate = useNavigate();

  const coverSkin = useMemo(() => {
    if (!validSkins || validSkins.length === 0) return null;

    // Usamos el mismo algoritmo que CaseView para obtener las 10 skins exactas de esta caja
    const seed = caseData.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...validSkins].sort((a, b) => {
      const valA = (a.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const valB = (b.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (valA % 100) - (valB % 100);
    });

    const casePool = shuffled.slice(0, 10).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    // El jackpot es la última skin (la más cara de las 10)
    return casePool[casePool.length - 1];
  }, [validSkins, caseData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/case/${caseData.id}`)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '32px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        minHeight: '380px'
      }}
    >
      {/* Background Glow & Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: caseData.bgGradient || `radial-gradient(circle at center, ${caseData.color}22 0%, #16191e 100%)`,
        opacity: 0.15,
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: caseData.color,
        filter: 'blur(80px)',
        opacity: 0.1,
        borderRadius: '50%',
        zIndex: 0
      }} />

      {/* Featured Skin Image */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {coverSkin?.image ? (
          <img
            src={coverSkin.image}
            alt={caseData.name}
            style={{
              width: '90%',
              height: '180px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.9))'
            }}
          />
        ) : (
          <div style={{ fontSize: '6rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>{caseData.emoji}</div>
        )}
      </div>

      {/* Case Info */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: '900',
          color: caseData.color,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '5px'
        }}>
          {caseData.rarity} Case
        </div>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          margin: '0 0 15px 0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {caseData.name}
        </h3>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '12px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f5ac3b' }}>
            {parseFloat(caseData.price).toFixed(2)}€
          </span>
          <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.1)' }} />
          <button style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            ABRIR
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Cases() {
  const { user } = useAuth();
  const { skins: allSkins, loading: skinsLoading } = useFetchSkins(2000, true);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [rouletteData, setRouletteData] = useState({ isOpen: false, reward: 0 });

  const allCases = useMemo(() => generateAllCases(), []);

  // Pre-calcular skins agrupadas por rareza para evitar 1000 filters por cada card
  const groupedSkins = useMemo(() => {
    if (!allSkins) return {};
    return {
      "mil-spec": allSkins.filter(s => s.rarity === "Mil-Spec Grade" || s.rarity === "Restricted"),
      "classified": allSkins.filter(s => s.rarity === "Restricted" || s.rarity === "Classified"),
      "covert": allSkins.filter(s => s.rarity === "Classified" || s.rarity === "Covert")
    };
  }, [allSkins]);

  const filteredCases = useMemo(() => {
    let filtered = [...allCases];
    if (filterCategory !== "todos") filtered = filtered.filter(c => c.category === filterCategory);
    if (searchTerm) filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return filtered.sort((a, b) => {
      if (sortBy === "price-asc") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-desc") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "alpha-asc") return a.name.localeCompare(b.name);
      if (sortBy === "alpha-desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [allCases, filterCategory, searchTerm, sortBy]);

  const categories = [
    { id: 'todos', label: 'TODAS', icon: '📦' },
    { id: 'económica', label: 'ECONÓMICAS', icon: '🍕' },
    { id: 'intermedia', label: 'ESTÁNDAR', icon: '🔥' },
    { id: 'premium', label: 'PREMIUM', icon: '💎' },
    { id: 'limited', label: 'LIMITADAS', icon: '🌟' }
  ];

  const sortOptions = [
    { id: 'price-asc', label: 'Precio: Bajo a Alto' },
    { id: 'price-desc', label: 'Precio: Alto a Bajo' },
    { id: 'alpha-asc', label: 'Nombre: A-Z' },
    { id: 'alpha-desc', label: 'Nombre: Z-A' }
  ];

  // Ya no bloqueamos toda la UI esperando a las skins.
  // Las cajas se mostrarán con emojis y luego cargarán las imágenes.

  const dailyCases = [
    { level: 0, name: "DAILY FREE", color: "#10b981", emoji: "🗳️", unlocked: true, id: "daily-0" },
    { level: 5, name: "BRONZE", color: "#cd7f32", emoji: "🧰", unlocked: (user?.level || 0) >= 5, id: "daily-5" },
    { level: 10, name: "SILVER", color: "#c0c0c0", emoji: "💼", unlocked: (user?.level || 0) >= 10, id: "daily-10" },
    { level: 20, name: "PLATINUM", color: "#e5e4e2", emoji: "📦", unlocked: (user?.level || 0) >= 20, id: "daily-20" },
    { level: 30, name: "GOLD", color: "#ffd700", emoji: "🎖️", unlocked: (user?.level || 0) >= 30, id: "daily-30" },
    { level: 40, name: "EMERALD", color: "#50c878", emoji: "🌲", unlocked: (user?.level || 0) >= 40, id: "daily-40" },
    { level: 50, name: "DIAMOND", color: "#b9f2ff", emoji: "💎", unlocked: (user?.level || 0) >= 50, id: "daily-50" },
    { level: 60, name: "RUBY", color: "#e0115f", emoji: "🏮", unlocked: (user?.level || 0) >= 60, id: "daily-60" },
    { level: 75, name: "ELITE", color: "#ff4500", emoji: "🔥", unlocked: (user?.level || 0) >= 75, id: "daily-75" },
    { level: 100, name: "LEGEND", color: "#8a2be2", emoji: "👑", unlocked: (user?.level || 0) >= 100, id: "daily-100" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1115",
      padding: "60px 20px"
    }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>

        {skinsLoading && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            style={{
              position: 'fixed', top: '80px', left: 0, right: 0, height: '2px',
              background: '#f5ac3b', zIndex: 1000, originX: 0, opacity: 0.5
            }}
          />
        )}

        {/* Daily Cases Section */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>🎁 CAJAS DIARIAS</h2>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f5ac3b' }}>TU NIVEL: {user?.level || 0}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {dailyCases.map((dc, i) => (
              <DailyCard
                key={i}
                dc={dc}
                onClaimSuccess={(reward) => setRouletteData({ isOpen: true, reward: parseFloat(reward) })}
              />
            ))}
          </div>
        </section>

        <DailyRouletteModal
          isOpen={rouletteData.isOpen}
          rewardAmount={rouletteData.reward}
          skinsPool={allSkins.length > 0 ? allSkins : [{ name: 'Cargando...', image: '', rarity: 'Common' }]}
          onClose={() => setRouletteData({ ...rouletteData, isOpen: false })}
        />

        {/* Premium Section */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <span style={{ fontSize: '2rem' }}>💎</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
              ABRE CAJAS PREMIUM Y OBTÉN SKINS ÉPICAS
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "30px"
          }}>
            {allCases.filter(c => c.category === "premium").map((caseData) => (
              <CaseCard
                key={caseData.id}
                caseData={caseData}
                validSkins={groupedSkins[caseData.rarity]}
              />
            ))}
          </div>
        </section>

        {/* Collections Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>COLECCIONES</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', margin: '5px 0 0 0' }}>Skins exclusivas de todos los valores</p>
            </div>

            {/* Filters Bar moved inside Collections */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.02)',
              padding: '10px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.05)',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {categories.filter(c => c.id !== 'premium').map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: filterCategory === cat.id ? '#f5ac3b' : 'rgba(255,255,255,0.05)',
                      color: filterCategory === cat.id ? 'black' : 'rgba(255,255,255,0.4)',
                      fontWeight: '900',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.8rem',
                  width: '150px'
                }}
              />
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "30px"
          }}>
            {filteredCases.filter(c => c.category !== "premium" && c.category !== "daily").map((caseData) => (
              <CaseCard
                key={caseData.id}
                caseData={caseData}
                validSkins={groupedSkins[caseData.rarity]}
              />
            ))}
          </div>

          {(filteredCases.filter(c => c.category !== "premium" && c.category !== "daily").length === 0) && (
            <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>📦</div>
              <h2 style={{ fontWeight: '900', letterSpacing: '2px' }}>NO SE ENCONTRARON COLECCIONES</h2>
            </div>
          )}
        </section>
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
