import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import { getRarityColor } from "../constants/colors.js";

export default function Inventory() {
  const { user, sellSkin } = useAuth();

  const inventory = user?.inventory || [];

  const totalValue = inventory.reduce(
    (acc, skin) => acc + (skin.price || 0),
    0
  );

  const handleSellSkin = async (skinId) => {
    await sellSkin(skinId);
  };

  const sellAllSkins = async () => {
    if (!window.confirm("¿Estás seguro de que quieres vender todo tu inventario?")) return;
    for (const skin of inventory) {
      await sellSkin(skin.id);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1115",
      padding: "60px 20px",
      color: "white",
    }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>

        {/* Header section */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '60px',
          background: 'rgba(255,255,255,0.02)',
          padding: '40px',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)'
        }}>
          <div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '900',
              margin: 0,
              letterSpacing: '-1px',
              background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>MI INVENTARIO</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <div style={{ fontSize: '1.2rem', color: '#f5ac3b', fontWeight: '900' }}>
                VALOR: {totalValue.toLocaleString()}€
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                {inventory.length} ARTÍCULOS
              </div>
            </div>
          </div>

          {inventory.length > 0 && (
            <button
              onClick={sellAllSkins}
              style={{
                background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
                color: "white",
                padding: "18px 40px",
                border: "none",
                borderRadius: "16px",
                fontWeight: "900",
                fontSize: '1rem',
                cursor: "pointer",
                boxShadow: '0 10px 30px rgba(255, 65, 108, 0.4)',
                letterSpacing: '1px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1) translateY(0)'}
            >
              VENDER TODO
            </button>
          )}
        </header>

        {inventory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "120px 40px",
              borderRadius: "40px",
              textAlign: "center",
              background: 'rgba(255,255,255,0.01)',
              border: '2px dashed rgba(255,255,255,0.05)'
            }}
          >
            <div style={{ fontSize: '6rem', marginBottom: '30px', filter: 'grayscale(1)' }}>🎒</div>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>TU INVENTARIO ESTÁ VACÍO</h3>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>¡Abre algunas cajas para empezar tu colección hoy mismo!</p>
          </motion.div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "25px",
          }}>
            {inventory.map((skin, i) => {
              const color = getRarityColor(skin.rarity);
              return (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "30px",
                    borderRadius: "28px",
                    display: "flex",
                    flexDirection: "column",
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: `4px solid ${color}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = `${color}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {/* Glow effect */}
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: color,
                    filter: 'blur(40px)',
                    opacity: 0.1,
                    borderRadius: '50%'
                  }} />

                  <div style={{ height: "160px", marginBottom: "25px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={skin.image}
                      alt={skin.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: color, fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px' }}>
                      {skin.rarity?.toUpperCase() || "MIL-SPEC"}
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 'bold', margin: '0 0 10px 0', height: '2.6rem', overflow: 'hidden' }}>
                      {skin.name}
                    </h3>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>
                      {skin.price.toLocaleString()}€
                    </div>
                  </div>

                  <button
                    onClick={() => handleSellSkin(skin.id)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      padding: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      fontWeight: "900",
                      fontSize: '0.8rem',
                      cursor: "pointer",
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ef4444';
                      e.target.style.borderColor = 'transparent';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.color = 'white';
                    }}
                  >
                    VENDER ARTÍCULO
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}