import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { generateAllCases } from "../constants/cases.js";
import { getRarityColor } from "../constants/colors.js";

// Mini Roulette for Battles
const MiniBattleRoulette = ({ items }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && items.length > 0) {
      containerRef.current.style.transition = "none";
      containerRef.current.style.transform = "translateX(0px)";

      void containerRef.current.offsetWidth; // force reflow

      const cardWidth = 110; // 100 width + 10 gap
      const winnerIndex = items.length - 4; // pushed index 45 of 49 -> 4 from end
      const offset = (winnerIndex * cardWidth) + 50; // +50 to center the 100px width card

      const t1 = setTimeout(() => {
        const randomJitter = Math.floor(Math.random() * 20) - 10;
        containerRef.current.style.transition = "transform 3.5s cubic-bezier(0.15, 0.85, 0.15, 1)";
        containerRef.current.style.transform = `translateX(-${offset + randomJitter}px)`;
      }, 50);

      return () => clearTimeout(t1);
    }
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div style={{
      width: "100%", height: "120px", background: "#16181c", border: "2px solid #2a2e38",
      borderRadius: "12px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center"
    }}>
      {/* Center line */}
      <div style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: "2px", background: "#f5ac3b", zIndex: 10, boxShadow: "0 0 10px #f5ac3b"
      }}></div>

      <div ref={containerRef} style={{
        display: "flex", gap: "10px", height: "100%", alignItems: "center", paddingLeft: "50%"
      }}>
        {items.map((skin, idx) => (
          <div key={idx} style={{
            minWidth: "100px", height: "100px", background: "linear-gradient(180deg, #1a1d24 0%, #101215 100%)",
            borderBottom: `3px solid ${getRarityColor(skin.rarity)}`, borderRadius: "8px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "5px", boxSizing: "border-box"
          }}>
            <img src={skin.image} alt={skin.name} style={{ width: "70px", height: "50px", objectFit: "contain", marginBottom: "4px" }} onError={(e) => e.target.style.display = "none"} />
            <div style={{ color: "white", fontSize: "0.6rem", textAlign: "center", width: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {skin.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal Premium para Seleccionar Cajas y Bot
const BattleSelector = ({ open, onClose, onStart, userBalance, allCases }) => {
  const [selectedBoxes, setSelectedBoxes] = useState({});
  const [botLevel, setBotLevel] = useState("normal"); // easy, normal, hard
  const [gameMode, setGameMode] = useState("classic"); // classic, crazy, terminal

  if (!open) return null;

  const totalCost = Object.entries(selectedBoxes).reduce((acc, [id, qty]) => {
    const cData = allCases.find(c => c.id === id);
    return acc + (parseFloat(cData?.price || 0) * qty);
  }, 0);

  const canAfford = totalCost > 0 && totalCost <= userBalance;

  const handleAddBox = (id) => {
    setSelectedBoxes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleRemoveBox = (id) => {
    setSelectedBoxes(prev => {
      if (!prev[id]) return prev;
      const newQty = prev[id] - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const bots = [
    { id: "easy", name: "Noob Bot", winRate: "30%", icon: "🤪", color: "#10b981" },
    { id: "normal", name: "Pro Bot", winRate: "50%", icon: "😎", color: "#3b82f6" },
    { id: "hard", name: "Hacker Bot", winRate: "80%", icon: "🤖", color: "#ef4444" }
  ];

  const modes = [
    { id: "classic", name: "Clásico", desc: "Reglas estándar, el de mayor precio total gana", icon: "⚔️" },
    { id: "crazy", name: "Crazy", desc: "El menor precio total gana, ¡Suerte invertida!", icon: "🤪" },
    { id: "joker", name: "Joker (Tiebreaker)", desc: "En caso de empate matemático, una moneda decide al ganador", icon: "🃏" }
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        background: "#0a0c0f", border: "2px solid #2a2e38", borderRadius: "20px",
        width: "100%", maxWidth: "1000px", padding: "30px", maxHeight: "90vh", overflowY: "auto", position: "relative"
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>

        <h2 style={{ color: "white", marginBottom: "5px", fontSize: "2rem" }}>Crear Batalla</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "30px" }}>Configura tus oponentes y las cajas para la batalla.</p>

        {/* Game Modes */}
        <h3 style={{ color: 'white', marginBottom: "15px" }}>1. Modo de Juego</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
          {modes.map(m => (
            <div
              key={m.id}
              onClick={() => setGameMode(m.id)}
              style={{
                background: gameMode === m.id ? "rgba(245, 172, 59, 0.1)" : "#16181c",
                border: gameMode === m.id ? "2px solid #f5ac3b" : "1px solid #2a2e38",
                padding: "15px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{m.icon}</div>
              <div style={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>{m.name}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "5px" }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {/* Bot Selection */}
        <h3 style={{ color: 'white', marginBottom: "15px" }}>2. Oponente (Bot)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
          {bots.map(b => (
            <div
              key={b.id}
              onClick={() => setBotLevel(b.id)}
              style={{
                background: botLevel === b.id ? "rgba(255,255,255,0.05)" : "#16181c",
                border: botLevel === b.id ? `2px solid ${b.color}` : "1px solid #2a2e38",
                padding: "20px", borderRadius: "12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "15px", transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: "2.5rem" }}>{b.icon}</div>
              <div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>{b.name}</div>
                <div style={{ color: b.color, fontSize: "0.9rem" }}>Win Rate: {b.winRate}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Box Selection (Clash.gg style) */}
        <h3 style={{ color: 'white', marginBottom: "15px" }}>3. Añade Cajas</h3>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "15px",
          marginBottom: "30px", maxHeight: "300px", overflowY: "auto", paddingRight: "10px"
        }}>
          {allCases.map((c) => {
            const qty = selectedBoxes[c.id] || 0;
            return (
              <div key={c.id} style={{
                background: "#16181c", padding: "10px", borderRadius: "12px", border: "1px solid #2a2e38",
                textAlign: "center", position: "relative"
              }}>
                <img src={c.imageSrc} alt={c.name} style={{ width: "80px", height: "80px", objectFit: "contain", marginBottom: "10px" }} />
                <div style={{ color: "white", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ color: "#f5ac3b", fontWeight: "bold", marginBottom: "10px" }}>€{c.price}</div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0c0f", borderRadius: "8px", padding: "5px" }}>
                  <button onClick={() => handleRemoveBox(c.id)} style={{ background: "transparent", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer", width: "30px" }}>-</button>
                  <span style={{ color: "white", fontWeight: "bold" }}>{qty}</span>
                  <button onClick={() => handleAddBox(c.id)} style={{ background: "transparent", border: "none", color: "#10b981", fontSize: "1.2rem", cursor: "pointer", width: "30px" }}>+</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #2a2e38", paddingTop: "20px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Total Cajas: <b>{Object.values(selectedBoxes).reduce((a, b) => a + b, 0)}</b></div>
            <div style={{ color: canAfford ? "#f5ac3b" : "#ef4444", fontSize: "1.5rem", fontWeight: "bold" }}>Coste: €{totalCost.toFixed(2)}</div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setSelectedBoxes({})} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Limpiar</button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
            <button
              disabled={!canAfford}
              onClick={() => onStart(selectedBoxes, totalCost, botLevel, gameMode)}
              style={{
                background: canAfford ? "linear-gradient(90deg, #f5ac3b, #e0992a)" : "rgba(255,255,255,0.1)",
                color: canAfford ? "black" : "rgba(255,255,255,0.3)",
                border: "none", padding: "10px 30px", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1rem",
                cursor: canAfford ? "pointer" : "not-allowed"
              }}
            >
              Empezar Batalla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Battles() {
  const { user, updateUser } = useAuth();
  const { skins: allSkins, loading: skinsLoading } = useFetchSkins(1000, false);
  const [modalOpen, setModalOpen] = useState(false);

  const [battleState, setBattleState] = useState(null); // { isBattling: false, userResults: [], botResults: [], userTotal: 0, botTotal: 0, winner: null }
  const [animState, setAnimState] = useState({ visibleRounds: 0, hasCompleted: false });

  const allCases = useMemo(() => generateAllCases(), []);

  const getSkinsForCase = useCallback((caseData) => {
    return allSkins.filter(skin =>
      skin.rarity && (
        (caseData.rarity === "mil-spec" && (skin.rarity === "Mil-Spec Grade" || skin.rarity === "Restricted")) ||
        (caseData.rarity === "classified" && (skin.rarity === "Restricted" || skin.rarity === "Classified")) ||
        (caseData.rarity === "covert" && (skin.rarity === "Classified" || skin.rarity === "Covert"))
      )
    );
  }, [allSkins]);

  const openBoxRandomly = (caseData, validSkins, forceGoodDrop = false) => {
    if (!validSkins.length) return null;

    const weighted = [];
    validSkins.forEach(skin => {
      const price = Math.max(0.5, skin.price || 0.5);
      // If forceGoodDrop is true, we invert the weights to give better items
      let weight = Math.max(1, Math.floor(500 / (price * 10)));
      if (forceGoodDrop) weight = Math.floor(price); // Expensive ones get more weight

      for (let i = 0; i < weight; i++) {
        weighted.push({ ...skin, price: parseFloat(price.toFixed(2)) });
      }
    });

    const skin = weighted[Math.floor(Math.random() * weighted.length)];
    return {
      id: `${skin.id}-${Date.now()}-${Math.random()}`,
      name: skin.name,
      image: skin.image,
      price: skin.price,
      rarity: skin.rarity
    };
  };

  const handleStartBattle = (selectedBoxes, totalCost, botLevel, gameMode) => {
    setModalOpen(false);

    const boxesToOpen = [];
    Object.entries(selectedBoxes).forEach(([id, qty]) => {
      const cData = allCases.find(c => c.id === id);
      for (let i = 0; i < qty; i++) {
        // Only push one element for each box quantity
        boxesToOpen.push(cData);
      }
    });

    // Subtract balance
    updateUser({ ...user, balance: parseFloat((user.balance - totalCost).toFixed(2)) });

    const userDrops = [];
    const botDrops = [];
    let uTotal = 0;
    let bTotal = 0;

    // Simulate instantly for now (we can add suspense animations later)
    boxesToOpen.forEach(cData => {
      const vSkins = getSkinsForCase(cData);
      if (vSkins.length) {
        const uSkin = openBoxRandomly(cData, vSkins);

        // Bot logic
        const isBotHacking = botLevel === "hard" && Math.random() < 0.8;
        const isBotNoob = botLevel === "easy" && Math.random() < 0.7; // Tries to get bad drops

        const bSkin = openBoxRandomly(cData, vSkins, isBotHacking);

        userDrops.push(uSkin);
        botDrops.push(bSkin);
        uTotal += uSkin.price;
        bTotal += bSkin.price;
      }
    });

    // Determine winner based on Game Mode
    let winner = "tie";

    if (gameMode === "crazy") {
      if (parseFloat(uTotal.toFixed(2)) < parseFloat(bTotal.toFixed(2))) winner = "user";
      else if (parseFloat(bTotal.toFixed(2)) < parseFloat(uTotal.toFixed(2))) winner = "bot";
    } else {
      // Classic & Joker default behavior (Highest price wins)
      if (parseFloat(uTotal.toFixed(2)) > parseFloat(bTotal.toFixed(2))) winner = "user";
      else if (parseFloat(bTotal.toFixed(2)) > parseFloat(uTotal.toFixed(2))) winner = "bot";

      // Joker Rules (Tiebreaker)
      if (winner === "tie" && gameMode === "joker") {
        winner = Math.random() > 0.5 ? "user" : "bot";
      }
    }

    setBattleState({
      isBattling: true,
      boxes: boxesToOpen,
      userResults: userDrops,
      botResults: botDrops,
      userTotal: parseFloat(uTotal.toFixed(2)),
      botTotal: parseFloat(bTotal.toFixed(2)),
      winner,
      botLevel,
      gameMode
    });

    setAnimState({ visibleRounds: 0, hasCompleted: false });

    // If user wins, user gets EVERYTHING (user drops + bot drops)
    if (winner === "user") {
      const loot = [...userDrops, ...botDrops];
      updateUser(prev => ({
        ...prev,
        inventory: [...(prev.inventory || []), ...loot]
      }));
    } else if (winner === "tie") {
      // Keep own drops
      updateUser(prev => ({
        ...prev,
        inventory: [...(prev.inventory || []), ...userDrops]
      }));
    }
    // If bot wins, user gets nothing
  };

  useEffect(() => {
    if (battleState && !animState.hasCompleted) {
      if (animState.visibleRounds < battleState.boxes.length) {
        const t = setTimeout(() => {
          setAnimState(s => ({ ...s, visibleRounds: s.visibleRounds + 1 }));
        }, 4000); // 4 seconds per round spin
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setAnimState(s => ({ ...s, hasCompleted: true }));
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [battleState, animState.visibleRounds, animState.hasCompleted]);

  // Generate fake reels once for the active round
  const [activeReels, setActiveReels] = useState({ uReel: [], bReel: [] });
  useEffect(() => {
    if (battleState && !animState.hasCompleted && animState.visibleRounds < battleState.boxes.length) {
      const roundIdx = animState.visibleRounds;
      const box = battleState.boxes[roundIdx];
      const vSkins = getSkinsForCase(box);

      if (vSkins.length > 0) {
        const uR = [];
        const bR = [];
        // Fill with garbage
        for (let i = 0; i < 45; i++) {
          uR.push(vSkins[Math.floor(Math.random() * vSkins.length)]);
          bR.push(vSkins[Math.floor(Math.random() * vSkins.length)]);
        }
        // Push winners
        uR.push(battleState.userResults[roundIdx]);
        bR.push(battleState.botResults[roundIdx]);
        // Push end padding
        for (let i = 0; i < 3; i++) {
          uR.push(vSkins[Math.floor(Math.random() * vSkins.length)]);
          bR.push(vSkins[Math.floor(Math.random() * vSkins.length)]);
        }
        setActiveReels({ uReel: uR, bReel: bR });
      }
    }
  }, [battleState, animState.visibleRounds, animState.hasCompleted, getSkinsForCase]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0c0f",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div style={{
          marginBottom: "40px",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(245, 172, 59, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
          padding: "40px 20px",
          borderRadius: "16px",
          border: "1px solid rgba(245, 172, 59, 0.2)"
        }}>
          <h1 style={{ fontSize: "3rem", color: "white", margin: "0 0 16px 0", fontWeight: "bold" }}>
            ⚔️ Batallas de Cajas
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 20px 0" }}>
            Todo o Nada contra los Bots • <span style={{ color: "#f5ac3b", fontWeight: "bold" }}>€{user?.balance?.toFixed(2) || 0}</span> disponibles
          </p>
          <button
            onClick={() => setModalOpen(true)}
            disabled={skinsLoading}
            style={{
              background: "linear-gradient(90deg, #f5ac3b, #e0992a)",
              color: "black", border: "none", padding: "15px 40px", borderRadius: "10px",
              fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer",
              boxShadow: "0 10px 30px rgba(245, 172, 59, 0.3)"
            }}
          >
            Crear Batalla
          </button>
        </div>

        {battleState && (
          <div style={{ animation: "slideUp 0.5s ease" }}>
            {animState.hasCompleted ? (
              <div style={{
                textAlign: "center", marginBottom: "30px",
                background: battleState.winner === "user" ? "rgba(16, 185, 129, 0.1)" : battleState.winner === "bot" ? "rgba(239, 68, 68, 0.1)" : "rgba(255,255,255,0.1)",
                border: `2px solid ${battleState.winner === "user" ? "#10b981" : battleState.winner === "bot" ? "#ef4444" : "grey"}`,
                padding: "20px", borderRadius: "16px",
                animation: "slideUp 0.6s ease"
              }}>
                <h2 style={{ color: "white", margin: "0 0 10px 0" }}>
                  {battleState.winner === "user" ? "🎉 ¡HAS GANADO LA BATALLA! 🎉" : battleState.winner === "bot" ? "💀 EL BOT HA GANADO 💀" : "🤝 EMPATE 🤝"}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem" }}>
                  {battleState.winner === "user" ? `Te llevas todo el botín (€${(battleState.userTotal + battleState.botTotal).toFixed(2)})` : battleState.winner === "bot" ? "Has perdido tus cajas." : "Te quedas con tus propias skins."}
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: "30px" }}>
                <div style={{ textAlign: "center", color: "white", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "15px" }}>
                  Ronda {animState.visibleRounds + 1} de {battleState.boxes.length}
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <MiniBattleRoulette key={`u-${animState.visibleRounds}`} items={activeReels.uReel} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <MiniBattleRoulette key={`b-${animState.visibleRounds}`} items={activeReels.bReel} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
              {/* Header Columns: User vs Bot */}
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1, background: "#16181c", borderRadius: "16px", padding: "20px", border: "1px solid #2a2e38", position: "relative" }}>
                  {battleState.gameMode !== "classic" && (
                    <div style={{ position: "absolute", top: "-15px", left: "20px", background: "#f5ac3b", color: "black", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.8rem", textTransform: "uppercase" }}>Modo {battleState.gameMode}</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "40px", height: "40px", background: "rgba(245,172,59,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>👤</div>
                      <h3 style={{ color: "white", margin: 0 }}>Tú</h3>
                    </div>
                    <div style={{ color: battleState.gameMode === "crazy" && battleState.userTotal < battleState.botTotal ? "#10b981" : "#f5ac3b", fontSize: "1.5rem", fontWeight: "bold" }}>
                      €{battleState.userResults.slice(0, animState.visibleRounds).reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, background: "#16181c", borderRadius: "16px", padding: "20px", border: "1px solid #2a2e38" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "40px", height: "40px", background: "rgba(239,68,68,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🤖</div>
                      <h3 style={{ color: "white", margin: 0 }}>Bot ({battleState.botLevel})</h3>
                    </div>
                    <div style={{ color: battleState.gameMode === "crazy" && battleState.botTotal < battleState.userTotal ? "#10b981" : "#ef4444", fontSize: "1.5rem", fontWeight: "bold" }}>
                      €{battleState.botResults.slice(0, animState.visibleRounds).reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rounds - Key-Drop Style */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {battleState.boxes.map((box, idx) => {
                  if (idx >= animState.visibleRounds) return null; // Don't show subsequent rounds yet

                  const uSkin = battleState.userResults[idx];
                  const bSkin = battleState.botResults[idx];

                  return (
                    <div key={idx} style={{
                      display: "flex", gap: "20px", alignItems: "center", animation: "slideUp 0.4s ease"
                    }}>
                      {/* User Box */}
                      <div style={{ flex: 1, background: "linear-gradient(135deg, #16181c 0%, #101215 100%)", border: `2px solid ${getRarityColor(uSkin.rarity)}`, padding: "10px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "15px", height: "100px" }}>
                        <img src={uSkin.image} style={{ width: "80px", height: "60px", objectFit: "contain" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "white", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uSkin.name}</div>
                          <div style={{ color: "#f5ac3b", fontWeight: "bold", fontSize: "1.1rem" }}>€{uSkin.price.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Center Box Reference */}
                      <div style={{ width: "80px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <img src={box.imageSrc} style={{ width: "60px", opacity: 0.6, filter: "drop-shadow(0 0 10px rgba(0,0,0,0.8))" }} />
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", marginTop: "5px" }}>Rnd {idx + 1}</div>
                      </div>

                      {/* Bot Box */}
                      <div style={{ flex: 1, background: "linear-gradient(135deg, #16181c 0%, #101215 100%)", border: `2px solid ${getRarityColor(bSkin.rarity)}`, padding: "10px", borderRadius: "12px", display: "flex", alignItems: "center", flexDirection: "row-reverse", gap: "15px", height: "100px" }}>
                        <img src={bSkin.image} style={{ width: "80px", height: "60px", objectFit: "contain" }} />
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ color: "white", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bSkin.name}</div>
                          <div style={{ color: "#ef4444", fontWeight: "bold", fontSize: "1.1rem" }}>€{bSkin.price.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <BattleSelector
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onStart={handleStartBattle}
          userBalance={user?.balance || 0}
          allCases={allCases}
        />
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
