import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { API_URL } from "../context/AuthContext";

export default function Ranking() {
  const { user } = useAuth();
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/ranking`)
      .then(res => res.json())
      .then(data => {
        setRankingData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching ranking:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ color: "white", textAlign: "center", padding: "100px" }}>Cargando ranking...</div>;

  const top3 = rankingData.slice(0, 3);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1115",
      padding: "60px 20px",
      color: "white"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "80px" }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: "4rem",
              fontWeight: "900",
              margin: 0,
              background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.4) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-2px"
            }}
          >
            TOP RANKING
          </motion.h1>
          <p style={{ color: "#f5ac3b", fontWeight: "bold", letterSpacing: "4px", textTransform: "uppercase", marginTop: "10px" }}>
            Los mejores jugadores de la plataforma
          </p>
        </header>

        {/* Podium */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "100px",
          flexWrap: "wrap",
          padding: "0 20px"
        }}>
          {/* 2nd Place */}
          {top3[1] && <PodiumCard user={top3[1]} place={2} height="200px" color="#94a3b8" />}
          {/* 1st Place */}
          {top3[0] && <PodiumCard user={top3[0]} place={1} height="260px" color="#f5ac3b" />}
          {/* 3rd Place */}
          {top3[2] && <PodiumCard user={top3[2]} place={3} height="170px" color="#b45309" />}
        </div>

        {/* List Table */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.05)",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                <th style={thStyle}>POSICIÓN</th>
                <th style={thStyle}>JUGADOR</th>
                <th style={thStyle}>VALOR TOTAL</th>
                <th style={thStyle}>NIVEL</th>
                <th style={thStyle}>PROGRESO</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((u, idx) => (
                <tr key={idx} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.02)",
                  background: user?.nombre_usuario === u.name ? "rgba(245, 172, 59, 0.05)" : "transparent"
                }}>
                  <td style={tdStyle}>
                    <span style={{
                      fontWeight: "900",
                      fontSize: "1.2rem",
                      color: idx < 3 ? "#f5ac3b" : "rgba(255,255,255,0.3)"
                    }}>#{idx + 1}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <span style={{ fontSize: "1.5rem" }}>👤</span>
                      <span style={{ fontWeight: "bold" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#f5ac3b", fontWeight: "900" }}>{Number(u.balance).toLocaleString()}€</span>
                  </td>
                  <td style={tdStyle}>Nivel {u.level || 0}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ height: "6px", width: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, (u.exp / 1000) * 100)}%`, background: "#10b981" }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{u.exp} XP</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ user, place, height, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.2 }}
      style={{
        width: "280px",
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: place === 1 ? "4rem" : "3rem", marginBottom: "15px" }}>👤</div>
      <div style={{ fontWeight: "900", fontSize: "1.2rem", marginBottom: "15px" }}>{user.name}</div>
      <div style={{
        height: height,
        background: `linear-gradient(180deg, ${color}22 0%, ${color}05 100%)`,
        border: `2px solid ${color}`,
        borderRadius: "24px 24px 0 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: `0 0 50px ${color}11`
      }}>
        <div style={{ fontSize: "3rem", fontWeight: "900", color: color }}>{place}</div>
        <div style={{ fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.5 }}>LUGAR</div>
        <div style={{
          position: "absolute",
          top: "-15px",
          background: color,
          color: "black",
          padding: "5px 15px",
          borderRadius: "10px",
          fontWeight: "900",
          fontSize: "0.8rem"
        }}>
          {user.balance.toLocaleString()}€
        </div>
      </div>
    </motion.div>
  );
}

const thStyle = {
  padding: "20px 30px", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontWeight: "900", letterSpacing: "2px"
};

const tdStyle = {
  padding: "25px 30px", fontSize: "1rem"
};