import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { generateAllCases } from "../constants/cases.js";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { getRarityColor } from "../constants/colors.js";

const SingleMultiRoulette = ({ items, quantity, isSpinning, onComplete }) => {
    const containerRef = useRef(null);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (isSpinning && containerRef.current) {
            containerRef.current.style.transition = "none";
            containerRef.current.style.transform = "translateX(0px)";

            void containerRef.current.offsetWidth; // Force Reflow

            const cardWidth = 160; // 150 + 10 gap
            const winnerStartIndex = items.length - 10 - quantity;
            const winnersCenter = (winnerStartIndex * cardWidth) + ((quantity * cardWidth - 10) / 2);
            const offset = winnersCenter;

            const t1 = setTimeout(() => {
                const randomJitter = Math.floor(Math.random() * 40) - 20;
                containerRef.current.style.transition = "transform 6s cubic-bezier(0.12, 0.8, 0.15, 1)";
                containerRef.current.style.transform = `translateX(-${offset + randomJitter}px)`;
            }, 50);

            const timer = setTimeout(() => {
                onCompleteRef.current();
            }, 6500);

            return () => {
                clearTimeout(t1);
                clearTimeout(timer);
            };
        } else if (!isSpinning && containerRef.current) {
            containerRef.current.style.transition = "none";
            containerRef.current.style.transform = "translateX(0px)";
        }
    }, [isSpinning, items, quantity]);

    const selectorWidth = quantity * 160 - 20;

    return (
        <div style={{
            width: "100%",
            height: "220px",
            background: "#0c0d10",
            backgroundImage: `linear-gradient(rgba(12, 13, 16, 0.8), rgba(12, 13, 16, 0.8)), var(--case-gradient, none)`,
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "24px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
        }}>
            {/* Center Area highlighting the winners */}
            <div style={{
                position: "absolute",
                left: "50%",
                top: "10px",
                bottom: "10px",
                width: `${selectorWidth}px`,
                transform: "translateX(-50%)",
                border: "2px solid #f5ac3b",
                borderRadius: "16px",
                background: "rgba(245, 172, 59, 0.05)",
                zIndex: 10,
                pointerEvents: "none",
                boxShadow: "0 0 40px rgba(245, 172, 59, 0.2)"
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '15px solid #f5ac3b',
                    filter: 'drop-shadow(0 0 10px #f5ac3b)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '15px solid #f5ac3b',
                    filter: 'drop-shadow(0 0 10px #f5ac3b)'
                }} />
            </div>

            {/* Left/Right Fades */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #0c0d10 0%, transparent 20%, transparent 80%, #0c0d10 100%)',
                zIndex: 5,
                pointerEvents: 'none'
            }} />

            <div ref={containerRef} style={{
                display: "flex",
                gap: "10px",
                height: "100%",
                alignItems: "center",
                paddingLeft: "50%"
            }}>
                {items.map((skin, idx) => {
                    const color = getRarityColor(skin.rarity);
                    return (
                        <div key={idx} style={{
                            minWidth: "150px",
                            height: "160px",
                            background: "rgba(255,255,255,0.02)",
                            borderBottom: `4px solid ${color}`,
                            borderRadius: "16px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "15px",
                            boxSizing: "border-box",
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                bottom: '-20px',
                                width: '100%',
                                height: '40px',
                                background: color,
                                filter: 'blur(30px)',
                                opacity: 0.1
                            }} />
                            <img
                                src={skin.image}
                                alt={skin.name}
                                style={{
                                    width: "100px",
                                    height: "70px",
                                    objectFit: "contain",
                                    marginBottom: "12px",
                                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                                }}
                                onError={(e) => e.target.style.display = "none"}
                            />
                            <div style={{
                                color: "rgba(255,255,255,0.5)",
                                fontSize: "0.6rem",
                                textAlign: "center",
                                width: "100%",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {skin.name.split(' | ')[0]}
                            </div>
                            <div style={{
                                color: "white",
                                fontSize: "0.75rem",
                                textAlign: "center",
                                width: "100%",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                fontWeight: 'bold'
                            }}>
                                {skin.name.split(' | ')[1] || skin.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function CaseView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser, depositSkins, sellSkin, withdrawSkin } = useAuth();
    const { skins: allSkins, loading: skinsLoading } = useFetchSkins(2000, true);

    const [quantity, setQuantity] = useState(1);
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [results, setResults] = useState([]);
    const [reel, setReel] = useState([]);
    const [balanceError, setBalanceError] = useState("");
    const [hasActioned, setHasActioned] = useState(false);

    const allCases = useMemo(() => generateAllCases(), []);
    const caseData = allCases.find((c) => c.id === id);

    const validSkins = useMemo(() => {
        if (!allSkins || !caseData) return [];

        // Filter by category rarity first
        let pool = allSkins.filter(skin =>
            skin.rarity && (
                (caseData.rarity === "mil-spec" && (skin.rarity === "Mil-Spec Grade" || skin.rarity === "Restricted")) ||
                (caseData.rarity === "classified" && (skin.rarity === "Restricted" || skin.rarity === "Classified")) ||
                (caseData.rarity === "covert" && (skin.rarity === "Classified" || skin.rarity === "Covert"))
            )
        );

        if (pool.length === 0) pool = allSkins;

        // Deterministic selection of 10 skins based on case ID
        // We use the case id to create a stable "random" seed
        const seed = caseData.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Shuffle pool using seed (simple version)
        const shuffled = [...pool].sort((a, b) => {
            const valA = (a.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const valB = (b.id + seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return (valA % 100) - (valB % 100);
        });

        // Take only 10 skins and sort them by price (ascending)
        // Ascending sort helps the probability logic where lower index = higher probability
        return shuffled.slice(0, 10).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }, [allSkins, caseData]);

    const startSpin = () => {
        if (!user) return alert("Inicia sesión para abrir cajas");
        const totalCost = parseFloat(caseData.price) * quantity;
        if (totalCost > user.balance) {
            setBalanceError(`Necesitas €${totalCost.toFixed(2)} adicionales`);
            return;
        }

        setBalanceError("");
        setIsSpinning(true);
        setHasCompleted(false);
        setResults([]);
        setHasActioned(false);

        if (!validSkins || validSkins.length === 0) {
            alert("Espera un segundo a que las skins carguen...");
            setIsSpinning(false);
            return;
        }

        // Probability logic: Lower index (lower price) has higher probability
        // Using a power distribution: roll ^ 2 will favor lower values more heavily
        const getSkinResult = () => {
            const roll = Math.random();
            // Distribution: 
            // 0 - 0.5: Item 0-2 (Cheapest)
            // 0.5 - 0.8: Item 3-5 (Mid)
            // 0.8 - 0.95: Item 6-8 (Rare)
            // 0.95 - 1.0: Item 9 (Jackpot)

            let index = 0;
            if (roll < 0.5) index = Math.floor(Math.random() * 3);
            else if (roll < 0.8) index = 3 + Math.floor(Math.random() * 3);
            else if (roll < 0.95) index = 6 + Math.floor(Math.random() * 3);
            else index = 9;

            // Clamp index to validSkins range
            index = Math.min(index, validSkins.length - 1);
            return validSkins[index];
        };

        const expectedResults = [];
        for (let i = 0; i < quantity; i++) {
            const finalSkin = getSkinResult();
            if (!finalSkin) {
                // Fallback if somehow still empty
                setIsSpinning(false);
                alert("Error al generar contenido de la caja. Inténtalo de nuevo.");
                return;
            }
            expectedResults.push({ ...finalSkin, id: `${finalSkin.id}-${Date.now()}-${i}` });
        }

        const newReel = [];
        for (let j = 0; j < 80; j++) {
            newReel.push(validSkins[Math.floor(Math.random() * validSkins.length)]);
        }
        newReel.push(...expectedResults);
        for (let j = 0; j < 10; j++) {
            newReel.push(validSkins[Math.floor(Math.random() * validSkins.length)]);
        }

        setReel(newReel);
        setResults(expectedResults);

        const newBalance = parseFloat((user.balance - totalCost).toFixed(2));
        updateUser({ ...user, balance: newBalance });
    };

    const handleSpinComplete = useCallback(async () => {
        setIsSpinning(false);
        setHasCompleted(true);
        // Guardar persistente en la DB y obtener IDs reales
        const savedItems = await depositSkins(results);
        if (savedItems) {
            setResults(savedItems);
        }
    }, [results, depositSkins]);

    const handleSellAll = async () => {
        if (hasActioned) return;
        setHasActioned(true);

        let successCount = 0;
        for (const item of results) {
            const success = await sellSkin(item.id);
            if (success) successCount++;
        }

        if (successCount < results.length) {
            alert(`Se vendieron ${successCount} de ${results.length} objetos.`);
        }
    };

    if (!caseData) return <div style={{ color: "white", padding: "100px", textAlign: "center", fontSize: '2rem', fontWeight: '900' }}>Caja no encontrada</div>;

    const totalResultsValue = results.reduce((acc, s) => acc + Number(s.price || 0), 0);

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0f1115",
            paddingBottom: "100px"
        }}>
            {/* Case Page Header */}
            <div style={{
                height: '400px',
                width: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle at center, ${caseData.color}22 0%, #0f1115 70%), ${caseData.bgGradient}`,
                backgroundBlendMode: 'overlay',
                overflow: 'hidden'
            }}>
                <button
                    onClick={() => navigate('/cases')}
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 10,
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    ← VOLVER
                </button>

                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={validSkins[validSkins.length - 1]?.image || caseData.imageSrc}
                            alt={caseData.name}
                            style={{
                                width: "400px",
                                height: "300px",
                                objectFit: "contain",
                                filter: `drop-shadow(0 30px 50px ${caseData.color}55)`,
                                animation: 'float 6s ease-in-out infinite'
                            }}
                        />
                        {validSkins[validSkins.length - 1] && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.8)',
                                color: '#f5ac3b',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '0.6rem',
                                fontWeight: '900',
                                border: '1px solid rgba(245,172,59,0.3)',
                                whiteSpace: 'nowrap'
                            }}>
                                JACKPOT POSIBLE 💎
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: '900',
                            margin: 0,
                            color: 'white',
                            textTransform: 'uppercase',
                            letterSpacing: '-1px'
                        }}>{caseData.name}</h1>
                        <div style={{
                            fontSize: '1.2rem',
                            color: caseData.color,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            marginTop: '5px'
                        }}>
                            COLECCIÓN {caseData.rarity}
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: caseData.color,
                    filter: 'blur(150px)',
                    opacity: 0.1,
                    borderRadius: '50%',
                    zIndex: 0
                }} />
            </div>

            <div style={{ maxWidth: "1200px", margin: "-60px auto 0", position: 'relative', zIndex: 10, padding: '0 20px' }}>

                {/* Roulette Area */}
                {(isSpinning || hasCompleted) && (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '32px',
                        padding: '40px',
                        marginBottom: '40px',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                        animation: 'fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        {isSpinning ? (
                            <div style={{ '--case-gradient': caseData.bgGradient }}>
                                <SingleMultiRoulette
                                    items={reel}
                                    quantity={quantity}
                                    isSpinning={isSpinning}
                                    onComplete={handleSpinComplete}
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '900',
                                    color: '#f5ac3b',
                                    letterSpacing: '3px',
                                    marginBottom: '10px'
                                }}>BOTÍN OBTENIDO</div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 40px 0' }}>¡ENHORABUENA!</h2>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", justifyContent: "center", marginBottom: "50px" }}>
                                    {results.map((skin, idx) => {
                                        const color = getRarityColor(skin.rarity);
                                        return (
                                            <div key={idx} style={{
                                                width: "220px",
                                                background: "rgba(255,255,255,0.03)",
                                                border: `1px solid rgba(255,255,255,0.05)`,
                                                borderBottom: `6px solid ${color}`,
                                                borderRadius: "24px",
                                                padding: "30px",
                                                textAlign: "center",
                                                animation: `winnerPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.15}s both`,
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-50%',
                                                    left: '-50%',
                                                    width: '200%',
                                                    height: '200%',
                                                    background: `radial-gradient(circle at center, ${color}22 0%, transparent 50%), ${caseData.bgGradient}`,
                                                    backgroundBlendMode: 'overlay',
                                                    zIndex: 0
                                                }} />
                                                <img
                                                    src={skin.image}
                                                    alt={skin.name}
                                                    style={{
                                                        width: "100%",
                                                        height: "120px",
                                                        objectFit: "contain",
                                                        marginBottom: "20px",
                                                        position: 'relative',
                                                        zIndex: 1,
                                                        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))'
                                                    }}
                                                />
                                                <div style={{ position: 'relative', zIndex: 1 }}>
                                                    <div style={{ color: color, fontSize: "0.7rem", fontWeight: '900', marginBottom: '5px' }}>{skin.rarity.toUpperCase()}</div>
                                                    <div style={{ color: "white", fontSize: "1rem", fontWeight: 'bold', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "15px" }}>{skin.name}</div>
                                                    <div style={{ fontSize: "1.6rem", fontWeight: "900", color: '#fff' }}>{Number(skin.price || 0).toFixed(2)}€</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {!hasActioned ? (
                                    <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                                        <button
                                            onClick={handleSellAll}
                                            style={{
                                                padding: "18px 40px",
                                                background: "rgba(239, 68, 68, 0.1)",
                                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                                color: "#ef4444",
                                                borderRadius: "16px",
                                                fontSize: "1rem",
                                                fontWeight: "900",
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            VENDER POR {Number(totalResultsValue || 0).toFixed(2)}€
                                        </button>
                                        <button
                                            onClick={() => navigate("/upgrade")}
                                            style={{
                                                padding: "18px 40px",
                                                background: "rgba(16, 185, 129, 0.1)",
                                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                                color: "#10b981",
                                                borderRadius: "16px",
                                                fontSize: "1rem",
                                                fontWeight: "900",
                                                cursor: "pointer"
                                            }}
                                        >
                                            MEJORAR
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!user?.link_intercambio) {
                                                    alert("Primero guarda tu Link de Intercambio en Configuración (Dashboard)");
                                                    navigate("/dashboard");
                                                    return;
                                                }
                                                setHasActioned(true);
                                                let count = 0;
                                                for (const item of results) {
                                                    const res = await withdrawSkin(item.id);
                                                    if (res.success) count++;
                                                }
                                                if (count > 0) {
                                                    alert(`Se han procesado ${count} retiros. Redirigiendo al Dashboard...`);
                                                    setTimeout(() => navigate("/dashboard"), 1000);
                                                } else {
                                                    alert("No se pudo procesar ningún retiro. Verifica tu conexión.");
                                                    setHasActioned(false);
                                                }
                                            }}
                                            style={{
                                                padding: "18px 40px",
                                                background: "rgba(59, 130, 246, 0.1)",
                                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                                color: "#3b82f6",
                                                borderRadius: "16px",
                                                fontSize: "1rem",
                                                fontWeight: "900",
                                                cursor: "pointer"
                                            }}
                                        >
                                            RETIRAR A STEAM
                                        </button>
                                        <button
                                            onClick={() => { setHasCompleted(false); setResults([]); }}
                                            style={{
                                                padding: "18px 40px",
                                                background: "#f5ac3b",
                                                border: "none",
                                                color: "black",
                                                borderRadius: "16px",
                                                fontSize: "1rem",
                                                fontWeight: "900",
                                                cursor: "pointer",
                                                boxShadow: '0 8px 25px rgba(245, 172, 59, 0.3)'
                                            }}
                                        >
                                            QUEDÁRSELO
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '20px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '16px',
                                        color: "#10b981",
                                        fontSize: "1.2rem",
                                        fontWeight: "900",
                                        display: 'inline-block'
                                    }}>
                                        ¡VENDIDO POR {Number(totalResultsValue || 0).toFixed(2)}€!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Main Controls Panel */}
                {!hasCompleted && !isSpinning && (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: "32px",
                        padding: "40px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        textAlign: "center",
                        boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '15px' }}>CANTIDAD DE CAJAS</div>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setQuantity(n)}
                                        style={{
                                            width: "70px",
                                            height: "70px",
                                            borderRadius: "16px",
                                            background: quantity === n ? "#f5ac3b" : "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                            color: quantity === n ? "black" : "white",
                                            fontSize: "1.4rem",
                                            fontWeight: "900",
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                            transform: quantity === n ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {balanceError && (
                            <div style={{
                                padding: '15px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '12px',
                                color: "#ff5555",
                                marginBottom: "20px",
                                fontWeight: 'bold'
                            }}>
                                ⚠️ {balanceError}
                            </div>
                        )}

                        <button
                            onClick={startSpin}
                            disabled={skinsLoading}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                padding: "24px 60px",
                                background: "linear-gradient(90deg, #f5ac3b, #ffba52)",
                                color: "black",
                                border: "none",
                                borderRadius: "20px",
                                fontSize: "1.4rem",
                                fontWeight: "900",
                                cursor: "pointer",
                                transition: 'all 0.3s ease',
                                boxShadow: "0 10px 40px rgba(245, 172, 59, 0.3)",
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            {skinsLoading ? "PREPARANDO..." : `ABRIR CAJAS • ${Number(parseFloat(caseData.price) * quantity).toFixed(2)}€`}
                        </button>
                    </div>
                )}

                {/* Contains List */}
                <div style={{ marginTop: "80px" }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                        padding: '0 10px'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>CONTENIDO DE LA CAJA</h3>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{validSkins.length} SKINS</div>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "20px"
                    }}>
                        {validSkins.sort((a, b) => b.price - a.price).map((skin, idx) => {
                            const color = getRarityColor(skin.rarity);
                            return (
                                <div key={idx} style={{
                                    background: "rgba(255,255,255,0.02)",
                                    borderBottom: `4px solid ${color}`,
                                    borderRadius: "20px",
                                    padding: "25px",
                                    textAlign: "center",
                                    transition: 'all 0.3s ease',
                                    cursor: 'help',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-20px',
                                        width: '100%',
                                        height: '40px',
                                        background: color,
                                        filter: 'blur(30px)',
                                        opacity: 0.05
                                    }} />
                                    <img
                                        src={skin.image}
                                        alt={skin.name}
                                        style={{
                                            width: "100%",
                                            height: "100px",
                                            objectFit: "contain",
                                            marginBottom: "15px",
                                            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                                        }}
                                    />
                                    <div style={{ color: color, fontSize: "0.6rem", fontWeight: '900', marginBottom: '5px' }}>{skin.rarity.toUpperCase()}</div>
                                    <div style={{
                                        color: "white",
                                        fontSize: "0.85rem",
                                        fontWeight: 'bold',
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        marginBottom: "10px"
                                    }}>
                                        {skin.name.split(' | ')[1] || skin.name}
                                    </div>
                                    <div style={{
                                        color: "#fff",
                                        fontWeight: "900",
                                        fontSize: "1.1rem"
                                    }}>{Number(skin.price || 0).toFixed(2)}€</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes fadeInUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes winnerPop {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
