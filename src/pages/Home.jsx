import SkinCard from "../components/SkinCard";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";

export default function Home() {
  const { skins, loading } = useFetchSkins(8, true);
  const { user } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1115"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px", animation: "bounce 2s infinite" }}>💎</div>
          <div style={{
            color: "#f5ac3b",
            fontSize: "1.5rem",
            fontWeight: "900",
            letterSpacing: '2px'
          }}>
            PREPARANDO EL MERCADO...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1115",
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '160px 40px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(245, 172, 59, 0.05) 0%, transparent 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, #f5ac3b11 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, #3b82f611 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 0
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: '1000px' }}
        >
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: 'rgba(245, 172, 59, 0.1)',
              border: '1px solid rgba(245, 172, 59, 0.2)',
              borderRadius: '30px',
              color: '#f5ac3b',
              fontSize: '0.9rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '40px'
            }}
          >
            LA PLATAFORMA #1 DE CS:GO EN ESPAÑA
          </motion.span>

          <h1 style={{
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            margin: "0 0 30px 0",
            fontWeight: "900",
            lineHeight: "0.9",
            letterSpacing: "-4px",
            background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
          }}>
            EL MERCADO <br />
            <span style={{
              background: 'linear-gradient(90deg, #f5ac3b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>MAS EXCLUSIVO</span>
          </h1>

          <p style={{
            fontSize: "1.4rem",
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 60px 0",
            maxWidth: "700px",
            lineHeight: '1.6',
            marginInline: 'auto',
            fontWeight: '500'
          }}>
            Vive la experiencia definitiva abriendo cajas premium, realizando upgrades
            de alto riesgo y compitiendo en batallas contra otros jugadores.
          </p>

          <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/cases" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05, translateY: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "22px 60px",
                  fontSize: "1.2rem",
                  fontWeight: "900",
                  color: "black",
                  background: "#f5ac3b",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  boxShadow: "0 20px 40px rgba(245, 172, 59, 0.3)",
                  letterSpacing: '1px'
                }}
              >
                EMPEZAR AHORA 🎁
              </motion.button>
            </Link>

            {!user && (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "22px 60px",
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    color: "white",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    cursor: "pointer",
                    backdropFilter: 'blur(10px)',
                    transition: 'border 0.3s ease'
                  }}
                >
                  INGRESAR
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '0 40px 140px' }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {[
            { label: 'Skins Activas', value: '18,500+', color: '#f5ac3b', icon: '🔥' },
            { label: 'Cajas Únicas', value: '250+', color: '#3b82f6', icon: '📦' },
            { label: 'Usuarios VIP', value: '125k+', color: '#a855f7', icon: '💎' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '50px 40px',
                borderRadius: '40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{stat.icon}</div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '8px', letterSpacing: '-1px' }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: '900' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Skins Section */}
      <section style={{ padding: '0 40px 160px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '80px'
          }}>
            <div>
              <h2 style={{ fontSize: '4rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>
                ÚLTIMOS <span style={{ color: '#f5ac3b' }}>DROPS</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', margin: '15px 0 0 0', fontSize: '1.2rem', fontWeight: '500' }}>
                Las skins más exclusivas obtenidas por nuestra comunidad en tiempo real.
              </p>
            </div>
            <Link to="/cases" style={{ textDecoration: 'none', color: '#f5ac3b', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>
              EXPLORAR TODO →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '40px'
          }}>
            {skins.map((skin, i) => (
              <motion.div
                key={skin.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <SkinCard skin={skin} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding - Removed as it's now global */}


      <style>{`
        body {
          scrollbar-width: thin;
          scrollbar-color: #f5ac3b #0f1115;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f1115;
        }
        ::-webkit-scrollbar-thumb {
          background: #f5ac3b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}