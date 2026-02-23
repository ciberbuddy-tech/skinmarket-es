import SkinCard from "../components/SkinCard";
import { useFetchSkins } from "../hooks/useFetchSkins";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Carrusel from "../components/Carrusel";

export default function Home() {
  const { skins, loading, error } = useFetchSkins(6, true);
  const { user } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #111318 0%, #0f1115 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🎮</div>
          <div style={{ color: "#f5ac3b", fontSize: "1.2rem", fontWeight: "bold", animation: "pulse 1.5s infinite" }}>
            Cargando skins increíbles...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #111318 0%, #0f1115 100%)",
        color: "#ff5555"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⚠️</div>
          <p>Error cargando skins. Intenta más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #111318 0%, #0f1115 50%, #111318 100%)",
      padding: 0
    }}>
      <Carrusel />
      {/* Hero Section */}
      <div style={{
        padding: "80px 40px",
        textAlign: "center",
        background: "linear-gradient(180deg, rgba(245, 172, 59,0.1) 0%, transparent 100%)",
        borderBottom: "2px solid rgba(245, 172, 59,0.2)"
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          margin: "0 0 20px 0",
          color: "white",
          textShadow: "0 4px 20px rgba(245, 172, 59,0.3)",
          fontWeight: "900",
          letterSpacing: "-1px"
        }}>
          🎁 SkinMarket ES
        </h1>
        <p style={{
          fontSize: "1.3rem",
          color: "rgba(255,255,255,0.8)",
          margin: "0 0 40px 0",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          La mejor plataforma para comprar, vender y abrir cajas de skins de CS:GO
        </p>

        {!user && (
          <Link to="/login" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "14px 40px",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "black",
              background: "linear-gradient(90deg, #f5ac3b 0%, #e0992a 100%)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(245, 172, 59,0.3)"
            }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(245, 172, 59,0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(245, 172, 59,0.3)";
              }}>
              🚀 Comenzar Ahora
            </button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        marginBottom: "60px"
      }}>
        <div style={{
          background: "rgba(245, 172, 59,0.1)",
          padding: "20px",
          borderRadius: "12px",
          border: "2px solid rgba(245, 172, 59,0.3)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", color: "#f5ac3b", fontWeight: "bold", marginBottom: "8px" }}>
            1000+
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Skins Disponibles
          </div>
        </div>

        <div style={{
          background: "rgba(59,130,246,0.1)",
          padding: "20px",
          borderRadius: "12px",
          border: "2px solid rgba(59,130,246,0.3)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", color: "#3b82f6", fontWeight: "bold", marginBottom: "8px" }}>
            80+
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Cajas Temáticas
          </div>
        </div>

        <div style={{
          background: "rgba(168,85,247,0.1)",
          padding: "20px",
          borderRadius: "12px",
          border: "2px solid rgba(168,85,247,0.3)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", color: "#a855f7", fontWeight: "bold", marginBottom: "8px" }}>
            100%
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Seguro y Confiable
          </div>
        </div>
      </div>

      {/* Skins Destacadas */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 40px 80px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px"
        }}>
          <div>
            <h2 style={{
              fontSize: "2rem",
              margin: 0,
              color: "white",
              marginBottom: "8px"
            }}>
              ✨ Skins Destacadas
            </h2>
            <p style={{
              margin: 0,
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.9rem"
            }}>
              Descubre las mejores skins disponibles hoy
            </p>
          </div>
          <Link to="/cases" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "10px 20px",
              background: "rgba(245, 172, 59,0.2)",
              border: "2px solid #f5ac3b",
              color: "#f5ac3b",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(245, 172, 59,0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(245, 172, 59,0.2)";
              }}>
              Ver Todas →
            </button>
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px"
        }}>
          {skins.map((skin) => (
            <SkinCard key={skin.id} skin={skin} />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      {user && (
        <div style={{
          background: "#16181c",
          borderTop: "2px solid #f5ac3b",
          padding: "60px 40px",
          textAlign: "center",
          marginTop: "80px"
        }}>
          <h2 style={{ color: "white", margin: "0 0 20px 0", fontSize: "2rem" }}>
            🎮 ¿Listo para comenzar?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "30px", fontSize: "1rem" }}>
            Elige entre nuestras cajas temáticas y obtén increíbles skins
          </p>
          <Link to="/cases" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "14px 40px",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "black",
              background: "linear-gradient(90deg, #f5ac3b 0%, #e0992a 100%)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(245, 172, 59,0.3)"
            }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(245, 172, 59,0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(245, 172, 59,0.3)";
              }}>
              Ir a Cajas 🎁
            </button>
          </Link>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}