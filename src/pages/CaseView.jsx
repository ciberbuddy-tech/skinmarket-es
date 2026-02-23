import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

            const cardWidth = 140; // 130 + 10 gap
            const winnerStartIndex = items.length - 5 - quantity;
            const winnersCenter = (winnerStartIndex * cardWidth) + ((quantity * cardWidth - 10) / 2);
            const offset = winnersCenter;

            const t1 = setTimeout(() => {
                const randomJitter = Math.floor(Math.random() * 20) - 10;
                containerRef.current.style.transition = "transform 5s cubic-bezier(0.15, 0.85, 0.15, 1)";
                containerRef.current.style.transform = `translateX(-${offset + randomJitter}px)`;
            }, 50);

            const timer = setTimeout(() => {
                onCompleteRef.current();
            }, 5550);

            return () => {
                clearTimeout(t1);
                clearTimeout(timer);
            };
        } else if (!isSpinning && containerRef.current) {
            containerRef.current.style.transition = "none";
            containerRef.current.style.transform = "translateX(0px)";
        }
    }, [isSpinning, items, quantity]); // Removed onComplete to prevent React re-renders from cancelling the spinner.

    const selectorWidth = quantity * 140 - 10;

    return (
        <div style={{
            width: "100%", height: "160px", background: "#16181c", border: "2px solid #2a2e38",
            borderRadius: "12px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center"
        }}>
            {/* Center Area highlighting the winners */}
            <div style={{
                position: "absolute", left: "50%", top: "10px", bottom: "10px",
                width: `${selectorWidth}px`, transform: "translateX(-50%)",
                border: "2px solid #f5ac3b", borderRadius: "8px",
                background: "rgba(245, 172, 59, 0.1)", zIndex: 10, pointerEvents: "none",
                boxShadow: "0 0 20px rgba(245, 172, 59, 0.3)"
            }}></div>

            <div ref={containerRef} style={{
                display: "flex", gap: "10px", height: "100%", alignItems: "center", paddingLeft: "50%"
            }}>
                {items.map((skin, idx) => (
                    <div key={idx} style={{
                        minWidth: "130px", height: "120px", background: "linear-gradient(180deg, #1a1d24 0%, #101215 100%)",
                        borderBottom: `3px solid ${getRarityColor(skin.rarity)}`, borderRadius: "8px",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "10px", boxSizing: "border-box"
                    }}>
                        <img src={skin.image} alt={skin.name} style={{ width: "80px", height: "60px", objectFit: "contain", marginBottom: "8px" }} onError={(e) => e.target.style.display = "none"} />
                        <div style={{ color: "white", fontSize: "0.6rem", textAlign: "center", width: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {skin.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function CaseView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { skins: allSkins, loading: skinsLoading } = useFetchSkins(1000, false);

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
        return allSkins.filter(skin =>
            skin.rarity && (
                (caseData.rarity === "mil-spec" && (skin.rarity === "Mil-Spec Grade" || skin.rarity === "Restricted")) ||
                (caseData.rarity === "classified" && (skin.rarity === "Restricted" || skin.rarity === "Classified")) ||
                (caseData.rarity === "covert" && (skin.rarity === "Classified" || skin.rarity === "Covert"))
            )
        );
    }, [allSkins, caseData]);

    const createWeightedSkinList = (skins) => {
        const weighted = [];
        skins.forEach(skin => {
            const price = Math.max(0.5, skin.price || 0.5);
            const weight = Math.max(1, Math.floor(500 / (price * 10)));
            for (let i = 0; i < weight; i++) {
                weighted.push({ ...skin, price: parseFloat(price.toFixed(2)) });
            }
        });
        return weighted;
    };

    const startSpin = () => {
        if (!user) return alert("Inicia sesión para abrir cajas");
        const totalCost = parseFloat(caseData.price) * quantity;
        if (totalCost > user.balance) {
            setBalanceError(`Necesitas €${totalCost.toFixed(2)}`);
            return;
        }

        setBalanceError("");
        setIsSpinning(true);
        setHasCompleted(false);
        setResults([]);
        setHasActioned(false);

        const weightedPool = createWeightedSkinList(validSkins);

        const expectedResults = [];
        for (let i = 0; i < quantity; i++) {
            const finalSkin = weightedPool[Math.floor(Math.random() * weightedPool.length)];
            expectedResults.push({ ...finalSkin, price: parseFloat(finalSkin.price.toFixed(2)), id: `${finalSkin.id}-${Date.now()}-${i}` });
        }

        const newReel = [];
        for (let j = 0; j < 65; j++) {
            newReel.push(weightedPool[Math.floor(Math.random() * weightedPool.length)]);
        }
        newReel.push(...expectedResults);
        for (let j = 0; j < 5; j++) {
            newReel.push(weightedPool[Math.floor(Math.random() * weightedPool.length)]);
        }

        setReel(newReel);
        setResults(expectedResults);

        const newBalance = parseFloat((user.balance - totalCost).toFixed(2));
        updateUser({ ...user, balance: newBalance });
    };

    const handleSpinComplete = useCallback(() => {
        setIsSpinning(false);
        setHasCompleted(true);

        // Add to inventory implicitly 
        updateUser((prev) => ({
            ...prev,
            inventory: [...(prev.inventory || []), ...results]
        }));
    }, [results, updateUser]);

    const handleSellAll = () => {
        if (hasActioned) return;
        const totalValue = results.reduce((acc, s) => acc + s.price, 0);

        let inv = [...(user.inventory || [])];
        // Remove exactly these results from inventory
        results.forEach(r => {
            const idx = inv.findIndex(i => i.id === r.id);
            if (idx !== -1) inv.splice(idx, 1);
        });

        const newBalance = parseFloat((user.balance + totalValue).toFixed(2));
        updateUser({ ...user, balance: newBalance, inventory: inv });
        setHasActioned(true);
    };

    const handleUpgradeAll = () => {
        if (hasActioned) return;
        navigate("/upgrade");
    };

    if (!caseData) return <div style={{ color: "white", padding: "50px", textAlign: "center" }}>Caja no encontrada</div>;

    const totalResultsValue = results.reduce((acc, s) => acc + s.price, 0);

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0f1115",
            padding: "40px 20px"
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/cases')}
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontWeight: "bold"
                    }}
                >
                    ← Volver a Cajas
                </button>

                {isSpinning ? (
                    <div style={{ marginBottom: "40px" }}>
                        <SingleMultiRoulette
                            items={reel}
                            quantity={quantity}
                            isSpinning={isSpinning}
                            onComplete={handleSpinComplete}
                        />
                    </div>
                ) : hasCompleted ? (
                    <div style={{ marginBottom: "40px" }}>
                        <div style={{
                            background: "rgba(245, 172, 59, 0.05)",
                            border: "1px solid rgba(245, 172, 59, 0.2)",
                            borderRadius: "16px",
                            padding: "40px",
                            textAlign: "center"
                        }}>
                            <h2 style={{ color: "white", marginBottom: "30px", fontSize: "2rem" }}>¡Botín Obtenido!</h2>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", marginBottom: "40px" }}>
                                {results.map((skin, idx) => (
                                    <div key={idx} style={{
                                        width: "180px",
                                        background: "linear-gradient(180deg, #1a1d24 0%, #101215 100%)",
                                        border: `2px solid ${getRarityColor(skin.rarity)}`,
                                        borderRadius: "12px",
                                        padding: "15px",
                                        textAlign: "center",
                                        animation: `slideUp 0.5s ease ${idx * 0.1}s both`
                                    }}>
                                        <img src={skin.image} alt={skin.name} style={{ width: "100%", height: "100px", objectFit: "contain", marginBottom: "15px" }} />
                                        <div style={{ color: "white", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "5px" }}>{skin.name}</div>
                                        <div style={{ color: "#f5ac3b", fontSize: "1.2rem", fontWeight: "bold" }}>€{skin.price.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            {!hasActioned ? (
                                <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                                    <button
                                        onClick={handleSellAll}
                                        style={{
                                            padding: "15px 40px",
                                            background: "transparent",
                                            border: "2px solid #ef4444",
                                            color: "#ef4444",
                                            borderRadius: "8px",
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                            transition: "all 0.2s hover"
                                        }}
                                    >
                                        Vender por €{totalResultsValue.toFixed(2)}
                                    </button>
                                    <button
                                        onClick={handleUpgradeAll}
                                        style={{
                                            padding: "15px 40px",
                                            background: "transparent",
                                            border: "2px solid #10b981",
                                            color: "#10b981",
                                            borderRadius: "8px",
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Mejorar en Upgrade
                                    </button>
                                    <button
                                        onClick={() => { setHasCompleted(false); setResults([]); }}
                                        style={{
                                            padding: "15px 40px",
                                            background: "linear-gradient(90deg, #f5ac3b, #e0992a)",
                                            border: "none",
                                            color: "black",
                                            borderRadius: "8px",
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Quedárselo
                                    </button>
                                </div>
                            ) : (
                                <div style={{ color: "#10b981", fontSize: "1.2rem", fontWeight: "bold" }}>¡Acción completada!</div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Big Case Display
                    <div style={{
                        height: "400px",
                        background: `url(${caseData.imageSrc}) center/cover, ${caseData.bgGradient}`,
                        backgroundBlendMode: "overlay",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "40px",
                        position: "relative",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}>
                        <img src={caseData.imageSrc} style={{ width: "300px", filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.9))" }} />
                        <div style={{
                            position: "absolute",
                            bottom: "20px",
                            background: "rgba(0,0,0,0.8)",
                            padding: "10px 30px",
                            borderRadius: "30px",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "2rem"
                        }}>
                            {caseData.name}
                        </div>
                    </div>
                )}

                {/* Controls */}
                {!hasCompleted && !isSpinning && (
                    <div style={{
                        background: "#16181c",
                        borderRadius: "16px",
                        padding: "30px",
                        border: "1px solid #2a2e38",
                        textAlign: "center"
                    }}>
                        <h3 style={{ color: "white", marginBottom: "20px" }}>Selecciona cantidad (Máx 5)</h3>
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginBottom: "20px" }}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    onClick={() => !isSpinning && setQuantity(n)}
                                    disabled={isSpinning}
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "12px",
                                        background: quantity === n ? "rgba(245, 172, 59, 0.2)" : "rgba(255,255,255,0.05)",
                                        border: quantity === n ? "2px solid #f5ac3b" : "1px solid rgba(255,255,255,0.1)",
                                        color: quantity === n ? "#f5ac3b" : "white",
                                        fontSize: "1.2rem",
                                        fontWeight: "bold",
                                        cursor: isSpinning ? "not-allowed" : "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        {balanceError && <div style={{ color: "#ff5555", marginBottom: "15px" }}>{balanceError}</div>}

                        <button
                            onClick={startSpin}
                            disabled={isSpinning || skinsLoading}
                            style={{
                                padding: "16px 60px",
                                background: isSpinning ? "rgba(255,255,255,0.1)" : "linear-gradient(90deg, #f5ac3b, #e0992a)",
                                color: isSpinning ? "rgba(255,255,255,0.3)" : "black",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                cursor: isSpinning || skinsLoading ? "not-allowed" : "pointer",
                                boxShadow: isSpinning ? "none" : "0 10px 20px rgba(245, 172, 59, 0.3)"
                            }}
                        >
                            {skinsLoading ? "Cargando..." : isSpinning ? "Girando..." : `Abrir por €${(parseFloat(caseData.price) * quantity).toFixed(2)}`}
                        </button>
                    </div>
                )}

                {/* Contains */}
                <div style={{ marginTop: "40px" }}>
                    <h3 style={{ color: "white", marginBottom: "20px" }}>Skins disponibles en esta caja</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px" }}>
                        {validSkins.map((skin, idx) => (
                            <div key={idx} style={{
                                background: "#1a1d24",
                                borderBottom: `3px solid ${getRarityColor(skin.rarity)}`,
                                borderRadius: "8px",
                                padding: "15px",
                                textAlign: "center"
                            }}>
                                <img src={skin.image} alt={skin.name} style={{ width: "100%", height: "80px", objectFit: "contain", marginBottom: "10px" }} />
                                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skin.name}</div>
                                <div style={{ color: "#f5ac3b", fontWeight: "bold", fontSize: "0.9rem" }}>€{skin.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
