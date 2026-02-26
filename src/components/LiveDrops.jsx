import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRarityColor } from "../constants/colors";
import { getSkins } from "../hooks/useFetchSkins";

export default function LiveDrops() {
    const [drops, setDrops] = useState([]);
    const [expensiveSkins, setExpensiveSkins] = useState([]);
    const dropsRef = useRef([]);

    useEffect(() => {
        const loadSkins = async () => {
            try {
                const allSkins = await getSkins();
                // Filtrar por raras o caras (> 20€)
                const filtered = allSkins.filter(s =>
                    s.rarity === "Covert" ||
                    s.rarity === "Extraordinary" ||
                    s.rarity === "Contraband" ||
                    s.price > 20
                );

                // Si por alguna razón el filtro es muy estricto, relajarlo
                const finalPool = filtered.length > 50 ? filtered : allSkins.filter(s => s.price > 5);
                setExpensiveSkins(finalPool);

                // Inicializar con algunos drops reales
                const initial = Array.from({ length: 6 }).map((_, i) => ({
                    ...finalPool[Math.floor(Math.random() * finalPool.length)],
                    id: Date.now() - i * 1000,
                    user: ["UserX", "CryptoBro", "Gamer77", "SkinHunter", "ProPlayer"][Math.floor(Math.random() * 5)]
                }));
                setDrops(initial);
                dropsRef.current = initial;
            } catch (err) {
                console.error("Error loading skins for LiveDrops:", err);
            }
        };

        loadSkins();
    }, []);

    useEffect(() => {
        if (expensiveSkins.length === 0) return;

        const interval = setInterval(() => {
            const randomUser = ["UserX", "CryptoBro", "Gamer77", "SkinHunter", "ProPlayer", "Winner99", "LuckyStrike", "DrorpMaster", "Viper", "Zeus"][Math.floor(Math.random() * 10)];
            const skin = expensiveSkins[Math.floor(Math.random() * expensiveSkins.length)];

            const newDrop = {
                ...skin,
                id: Date.now(),
                user: randomUser
            };

            setDrops(prev => {
                const updated = [newDrop, ...prev.slice(0, 10)];
                dropsRef.current = updated;
                return updated;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [expensiveSkins]);

    return (
        <div style={{
            height: "80px",
            background: "#0c0d10",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "15px",
            overflow: "hidden",
            position: 'relative',
            zIndex: 100
        }}>
            <div style={{
                background: "rgba(245,172,59,0.1)",
                color: "#f5ac3b",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "0.7rem",
                fontWeight: "900",
                letterSpacing: "1px",
                flexShrink: 0
            }}>LIVE DROPS</div>
            <div style={{ display: "flex", gap: "10px", flex: 1, overflow: "hidden" }}>
                <AnimatePresence>
                    {drops.map((drop) => {
                        const color = getRarityColor(drop.rarity);
                        return (
                            <motion.div
                                key={drop.id}
                                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    height: "60px",
                                    minWidth: "180px",
                                    background: "rgba(255,255,255,0.02)",
                                    border: `1px solid rgba(255,255,255,0.05)`,
                                    borderBottom: `3px solid ${color}`,
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 12px",
                                    gap: "10px",
                                    flexShrink: 0,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', inset: 0, background: `linear-gradient(45deg, ${color}11 0%, transparent 100%)`, zIndex: 0
                                }} />
                                <img
                                    src={drop.image}
                                    alt={drop.name}
                                    style={{ width: "45px", height: "45px", objectFit: "contain", zIndex: 1, filter: `drop-shadow(0 0 5px ${color})` }}
                                    onError={(e) => {
                                        e.target.src = "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjx_33YzhW692_nI_ImaH3NrrXm35D4Npyjud_3_n4oUDg-Es6N272II-VdwU8ZAzT_li6x7_rjJ_t7Zybm3Vl7HQr43ePzhLj10pLcKUx0vFm35nE";
                                    }}
                                />
                                <div style={{ zIndex: 1, overflow: 'hidden', flex: 1 }}>
                                    <div style={{
                                        fontSize: "0.7rem",
                                        fontWeight: "900",
                                        color: "white",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        letterSpacing: '0.2px'
                                    }}>
                                        {drop.name}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontWeight: '800' }}>{drop.user}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#f5ac3b", fontWeight: '900' }}>€{parseFloat(drop.price).toFixed(2)}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
