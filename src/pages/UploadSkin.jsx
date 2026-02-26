// src/pages/UploadSkin.jsx
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { getRarityColor } from "../constants/colors.js";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../context/AuthContext";

export default function UploadSkin() {
  const { user, updateUser } = useAuth();
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [steamInventory, setSteamInventory] = useState([]);
  const [selectedSkins, setSelectedSkins] = useState([]);

  const handleImportSteam = async () => {
    if (!steamId) return;

    setLoading(true);
    setSteamInventory([]);
    setSelectedSkins([]);

    try {
      const res = await fetch(`${API_URL}/steam-inventory/${steamId}`);
      const text = await res.text();

      if (text.startsWith("<!DOCTYPE")) {
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);

      if (!data || !data.assets || Object.keys(data.assets).length === 0) {
        setLoading(false);
        return;
      }

      const descriptionsMap = {};
      Object.values(data.descriptions || {}).forEach(desc => {
        descriptionsMap[`${desc.classid}_${desc.instanceid}`] = desc;
      });

      const skins = (data.assets || []).map(item => {
        const desc = descriptionsMap[`${item.classid}_${item.instanceid}`];
        return {
          id: item.assetid,
          name: desc?.market_name || desc?.name || "Unknown Skin",
          price: parseFloat((Math.random() * 50 + 0.5).toFixed(2)),
          rarity: desc?.tags?.find(tag => tag.category === "Rarity")?.name || "Mil-Spec Grade",
          image: desc?.icon_url
            ? `https://steamcommunity-a.akamaihd.net/economy/image/${desc.icon_url}/256fx256f`
            : ""
        };
      }).filter(skin => skin.image);

      setSteamInventory(skins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectSkin = (skin) => {
    if (selectedSkins.find(s => s.id === skin.id)) {
      setSelectedSkins(selectedSkins.filter(s => s.id !== skin.id));
    } else {
      setSelectedSkins([...selectedSkins, skin]);
    }
  };

  const handleDeposit = () => {
    if (selectedSkins.length === 0) return;

    const totalValue = selectedSkins.reduce((acc, s) => acc + s.price, 0);

    const updatedUser = {
      ...user,
      balance: parseFloat((user.balance + totalValue).toFixed(2)),
      inventory: [...(user.inventory || []), ...selectedSkins]
    };

    updateUser(updatedUser);

    const remaining = steamInventory.filter(s => !selectedSkins.find(sel => sel.id === s.id));
    setSteamInventory(remaining);
    setSelectedSkins([]);
  };

  const totalDepositValue = selectedSkins.reduce((acc, s) => acc + s.price, 0);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '60px 20px',
      background: '#0f1115',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(255,255,255,0.02)",
            padding: "80px 40px",
            borderRadius: "40px",
            border: "1px solid rgba(255,255,255,0.05)",
            marginBottom: "60px",
            textAlign: "center",
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: '#f5ac3b',
            filter: 'blur(150px)',
            opacity: 0.05,
            zIndex: 0
          }} />

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              color: "white",
              fontSize: "4rem",
              fontWeight: '900',
              margin: "0 0 15px 0",
              letterSpacing: '-2px',
              background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              zIndex: 1
            }}
          >
            DEPOSITAR SKINS
          </motion.h1>
          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "1.2rem",
            fontWeight: '600',
            maxWidth: '600px',
            margin: '0 auto 40px',
            position: 'relative',
            zIndex: 1
          }}>
            Conecta tu inventario de Steam y añade saldo a tu cuenta al instante.
          </p>

          <div style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            maxWidth: "700px",
            margin: "0 auto",
            position: 'relative',
            zIndex: 1
          }}>
            <input
              type="text"
              placeholder="Introduce tu SteamID64..."
              value={steamId}
              onChange={e => setSteamId(e.target.value)}
              style={{
                flex: "1",
                padding: "24px 30px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "1.1rem",
                fontWeight: '600',
                outline: "none",
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = "#f5ac3b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportSteam}
              disabled={loading}
              style={{
                padding: "0 40px",
                background: "linear-gradient(90deg, #f5ac3b, #ffba52)",
                color: "#1a1c24",
                border: "none",
                borderRadius: "20px",
                fontWeight: "900",
                fontSize: "1.1rem",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 30px rgba(245, 172, 59, 0.3)"
              }}
            >
              {loading ? "CARGANDO..." : "CARGAR"}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {steamInventory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(255,255,255,0.01)",
                borderRadius: "40px",
                padding: "40px",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: 'blur(20px)'
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "40px",
                paddingBottom: "30px",
                borderBottom: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div>
                  <h2 style={{ color: "white", margin: 0, fontSize: "2rem", fontWeight: '900', letterSpacing: '-1px' }}>
                    TU INVENTARIO
                  </h2>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '700', fontSize: '0.9rem', marginTop: '5px' }}>
                    {steamInventory.length} ITEMS ENCONTRADOS
                  </div>
                </div>

                <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: '800', marginBottom: '5px', letterSpacing: '2px' }}>SELECCIONADO</div>
                    <div style={{ color: "white", fontSize: "1.5rem", fontWeight: "900" }}>
                      €{totalDepositValue.toFixed(2)}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeposit}
                    disabled={selectedSkins.length === 0}
                    style={{
                      padding: "20px 40px",
                      background: selectedSkins.length === 0 ? "rgba(255,255,255,0.05)" : "#f5ac3b",
                      color: selectedSkins.length === 0 ? "rgba(255,255,255,0.2)" : "#1a1c24",
                      border: "none",
                      borderRadius: "20px",
                      fontWeight: "900",
                      fontSize: "1.1rem",
                      cursor: selectedSkins.length === 0 ? "not-allowed" : "pointer",
                      transition: "all 0.3s",
                      boxShadow: selectedSkins.length === 0 ? 'none' : '0 10px 30px rgba(245, 172, 59, 0.3)'
                    }}
                  >
                    VENDER ITEMS
                  </motion.button>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "20px",
                maxHeight: "60vh",
                overflowY: "auto",
                paddingRight: "10px"
              }}>
                {steamInventory.map((skin, i) => {
                  const isSelected = !!selectedSkins.find(s => s.id === skin.id);
                  const color = getRarityColor(skin.rarity);

                  return (
                    <motion.div
                      key={skin.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      whileHover={{ translateY: -5 }}
                      onClick={() => toggleSelectSkin(skin)}
                      style={{
                        background: isSelected ? `${color}15` : "rgba(255,255,255,0.02)",
                        border: `2px solid ${isSelected ? color : "rgba(255,255,255,0.05)"}`,
                        borderRadius: "24px",
                        padding: "25px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.2s",
                        position: "relative",
                        overflow: 'hidden'
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: "absolute",
                          top: "15px",
                          right: "15px",
                          background: color,
                          color: "white",
                          width: "24px",
                          height: "24px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "900",
                          fontSize: "0.8rem",
                          zIndex: 2,
                          boxShadow: `0 0 15px ${color}`
                        }}>✓</div>
                      )}
                      <img
                        src={skin.image}
                        alt={skin.name}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "contain",
                          marginBottom: "15px",
                          filter: `drop-shadow(0 10px 15px rgba(0,0,0,0.5))`
                        }}
                      />
                      <div style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.7rem",
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '5px'
                      }}>{skin.name.split(" | ")[0]}</div>
                      <div style={{
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: "900",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: "15px"
                      }}>{skin.name.split(" | ")[1] || skin.name}</div>
                      <div style={{
                        color: "#f5ac3b",
                        fontWeight: "900",
                        fontSize: "1.2rem"
                      }}>€{skin.price.toFixed(2)}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}