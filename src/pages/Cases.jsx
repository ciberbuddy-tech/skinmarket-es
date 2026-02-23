import { useAuth } from "../context/AuthContext";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRarityColor } from "../constants/colors.js";
import { generateAllCases } from "../constants/cases.js";
import { useFetchSkins } from "../hooks/useFetchSkins";

// Función para obtener color y estilo de la caja según rariedad
const getCaseStyle = (rarity) => {
  const styles = {
    "mil-spec": {
      gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
      glow: "0 0 30px rgba(100, 116, 139, 0.4)",
      border: "#64748b",
      icon: "🟢"
    },
    "restricted": {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
      glow: "0 0 30px rgba(59, 130, 246, 0.5)",
      border: "#3b82f6",
      icon: "🔵"
    },
    "classified": {
      gradient: "linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)",
      glow: "0 0 30px rgba(168, 85, 247, 0.5)",
      border: "#a855f7",
      icon: "🟣"
    },
    "covert": {
      gradient: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
      glow: "0 0 30px rgba(220, 38, 38, 0.5)",
      border: "#dc2626",
      icon: "🔴"
    }
  };
  return styles[rarity] || styles["mil-spec"];
};

// Componente de tarjeta de caja mejorado (Estilo Key-Drop)
const CaseCard = ({ caseData, allSkins, loading: parentLoading }) => {
  const navigate = useNavigate();
  const [hoverEffect, setHoverEffect] = useState(false);

  // Obtener las skins válidas para esta caja
  const validSkins = useMemo(() => {
    return allSkins.filter(skin =>
      skin.rarity && (
        (caseData.rarity === "mil-spec" && (skin.rarity === "Mil-Spec Grade" || skin.rarity === "Restricted")) ||
        (caseData.rarity === "classified" && (skin.rarity === "Restricted" || skin.rarity === "Classified")) ||
        (caseData.rarity === "covert" && (skin.rarity === "Classified" || skin.rarity === "Covert"))
      )
    );
  }, [allSkins, caseData.rarity]);

  // Skin de portada (la más cara o una aleatoria representativa)
  const coverSkin = useMemo(() => {
    if (validSkins.length === 0) return null;
    return validSkins[Math.floor(Math.random() * validSkins.length)];
  }, [validSkins]);

  return (
    <div style={{ position: "relative" }}>
      {/* Tarjeta Visual: Estilo Key-Drop */}
      <div
        onMouseEnter={() => setHoverEffect(true)}
        onMouseLeave={() => setHoverEffect(false)}
        onClick={() => !parentLoading && navigate(`/case/${caseData.id}`)}
        style={{
          background: `url(${caseData.imageSrc}) center/cover, ${caseData.bgGradient}`,
          backgroundBlendMode: "overlay",
          height: "320px",
          borderRadius: "12px",
          cursor: !parentLoading ? "pointer" : "default",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s",
          transform: hoverEffect ? "translateY(-10px)" : "translateY(0)",
          boxShadow: hoverEffect
            ? "0 20px 40px rgba(0,0,0,0.6), 0 0 15px rgba(245, 172, 59, 0.4)"
            : "0 10px 20px rgba(0,0,0,0.3)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        {/* Precio Arriba Derecha */}
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          backgroundColor: "rgba(10, 10, 12, 0.85)",
          backdropFilter: "blur(5px)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          border: "1px solid rgba(255,255,255,0.1)",
          zIndex: 2
        }}>
          {parseFloat(caseData.price).toFixed(2)} €
        </div>

        {/* Portada del Arma en el centro */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 1
        }}>
          {coverSkin && coverSkin.image ? (
            <img
              src={coverSkin.image}
              alt={caseData.name}
              style={{
                width: "90%",
                maxHeight: "200px",
                objectFit: "contain",
                filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.8))",
                transform: hoverEffect ? "scale(1.05) rotate(-2deg)" : "scale(1) rotate(0)",
                transition: "transform 0.4s ease"
              }}
            />
          ) : (
            <div style={{ fontSize: "5rem" }}>{caseData.emoji}</div>
          )}
        </div>

        {/* Badge Inferior Izquierda */}
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          backgroundColor: "rgba(10, 10, 12, 0.85)",
          backdropFilter: "blur(5px)",
          padding: "6px 12px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
          zIndex: 2
        }}>
          <span style={{ color: "white", fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase" }}>
            {caseData.name.substring(0, 12)}
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>🤍</span>
        </div>
      </div>
    </div>
  );
};

export default function Cases() {
  const { user } = useAuth();
  const { skins: allSkins, loading: skinsLoading } = useFetchSkins(1000, false);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("price-asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Pre-generar todas las cajas
  const allCases = useMemo(() => {
    return generateAllCases();
  }, []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const avgPrice = (allCases.reduce((sum, c) => sum + parseFloat(c.price), 0) / allCases.length).toFixed(2);
    return { totalCases: allCases.length, avgPrice };
  }, [allCases]);

  // Filtrar y ordenar cajas
  const filteredCases = useMemo(() => {
    let filtered = allCases;

    if (filterCategory !== "todos") {
      filtered = filtered.filter(c => c.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-desc":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allCases, filterCategory, sortBy, searchTerm]);

  if (skinsLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111318 0%, #0f1115 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px", animation: "pulse 1.5s infinite" }}>
          🎁
        </div>
        <div style={{ color: "#f5ac3b", fontSize: "1.2rem", fontWeight: "bold" }}>
          Cargando cajas y skins...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #111318 0%, #0f1115 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header mejorado */}
        <div style={{
          marginBottom: "40px",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(245, 172, 59, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
          padding: "40px 20px",
          borderRadius: "16px",
          border: "1px solid rgba(245, 172, 59, 0.2)"
        }}>
          <h1 style={{
            fontSize: "3rem",
            color: "white",
            margin: "0 0 16px 0",
            fontWeight: "bold",
            textShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }}>
            🎁 Cajas de Skins Premium
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            marginBottom: "20px"
          }}>
            Abre cajas y obtén skins reales • <span style={{ color: "#f5ac3b", fontWeight: "bold" }}>€{user?.balance?.toFixed(2) || 0}</span> disponibles
          </p>
          <div style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.6)"
          }}>
            <div>📊 <span style={{ color: "#f5ac3b", fontWeight: "bold" }}>{stats.totalCases}</span> cajas</div>
            <div>💰 Precio promedio: <span style={{ color: "#f5ac3b", fontWeight: "bold" }}>€{stats.avgPrice}</span></div>
            <div>🎒 Inventario: <span style={{ color: "#3b82f6", fontWeight: "bold" }}>{user?.inventory?.length || 0}</span></div>
          </div>
        </div>

        {/* Controles de filtro mejorados */}
        <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "32px",
          flexWrap: "wrap",
          background: "rgba(0,0,0,0.3)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid rgba(245, 172, 59, 0.2)",
          backdropFilter: "blur(10px)"
        }}>
          {/* Búsqueda */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "bold"
            }}>
              🔍 Buscar Caja
            </label>
            <input
              type="text"
              placeholder="Escribe nombre de la caja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid rgba(245, 172, 59, 0.2)",
                background: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "0.9rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "bold"
            }}>
              📂 Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid #f5ac3b",
                background: "rgba(0,0,0,0.3)",
                color: "#f5ac3b",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              <option value="todos">Todas</option>
              <option value="económica">💚 Económicas</option>
              <option value="intermedia">💙 Intermedias</option>
              <option value="premium">💜 Premium</option>
            </select>
          </div>

          {/* Ordenar */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "bold"
            }}>
              📊 Ordenar
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid #f5ac3b",
                background: "rgba(0,0,0,0.3)",
                color: "#f5ac3b",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              <option value="price-asc">💵 Menor Precio</option>
              <option value="price-desc">💴 Mayor Precio</option>
              <option value="name">🔤 Nombre (A-Z)</option>
            </select>
          </div>

          {/* Contador */}
          <div style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "rgba(245, 172, 59, 0.15)",
            border: "1px solid rgba(245, 172, 59, 0.4)",
            color: "#f5ac3b",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-end"
          }}>
            📊 {filteredCases.length} cajas
          </div>
        </div>

        {/* Grid de cajas mejorado */}
        {filteredCases.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px"
          }}>
            {filteredCases.map((caseData) => (
              <CaseCard
                key={caseData.id}
                caseData={caseData}
                allSkins={allSkins}
                loading={skinsLoading}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "rgba(255,255,255,0.5)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
            <p style={{ fontSize: "1.1rem" }}>No hay cajas que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }
        @keyframes shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
