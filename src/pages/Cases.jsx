import { useAuth } from "../context/AuthContext";
import { useState } from "react";

/* ===========================
   CAJAS
=========================== */

const CASES = [
  {
    id: 'classic',
    name: "Caja Clásica",
    emoji: "📦",
    price: 100,
    description: "La más accesible. Skins comunes a ocasionales.",
    color: "#64748b",
    borderColor: "#94a3b8",
    skins: [
      { name: "AK-47 | Redline", price: 150, rarity: "restricted", chance: 0.45, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak_redline_light_png.png" },
      { name: "M4A4 | Zirka", price: 80, rarity: "mil-spec", chance: 0.35, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_m4a4_cu_m4a4_zirka_light_png.png" },
      { name: "USP-S | Caiman", price: 120, rarity: "restricted", chance: 0.15, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_usp_s_cu_usp_s_caiman_light_png.png" },
      { name: "P250 | Hive", price: 50, rarity: "mil-spec", chance: 0.05, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_p250_cu_p250_hive_light_png.png" }
    ]
  },
  {
    id: 'premium',
    name: "Caja Premium",
    emoji: "💎",
    price: 300,
    description: "Mejor calidad. Incluye skins raras y clasificadas.",
    color: "#3b82f6",
    borderColor: "#60a5fa",
    skins: [
      { name: "AWP | Asiimov", price: 600, rarity: "covert", chance: 0.30, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_awp_cu_awp_asiimov_light_png.png" },
      { name: "M4A1-S | Knight", price: 800, rarity: "classified", chance: 0.35, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_m4a1_s_cu_m4a1_s_knight_light_png.png" },
      { name: "Deagle | Blaze", price: 400, rarity: "restricted", chance: 0.25, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_deagle_aa_blaze_light_png.png" },
      { name: "AK-47 | Neon Rider", price: 500, rarity: "restricted", chance: 0.10, image: "https://img.cs2data.gg/static/panorama/images/econ/default_generated/weapon_ak47_cu_ak_neonrider_light_png.png" }
    ]
  }
];

/* ===========================
   RAREZA
=========================== */

const getRarityInfo = (rarity) => {
  const rarities = {
    'mil-spec': { color: '#64748b', bg: 'rgba(100,116,139,0.2)' },
    'restricted': { color: '#3b82f6', bg: 'rgba(59,130,246,0.2)' },
    'classified': { color: '#a855f7', bg: 'rgba(168,85,247,0.2)' },
    'covert': { color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
    'exceedingly-rare': { color: '#fbbf24', bg: 'rgba(251,191,36,0.2)' }
  };
  return rarities[rarity] || rarities['mil-spec'];
};

/* ===========================
   COMPONENTE
=========================== */

export default function Cases() {

  const { user, updateUser } = useAuth();
  const [result, setResult] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [quantity, setQuantity] = useState(1);

  /* ===========================
     ABRIR CAJA
  =========================== */

  const openCase = (caseData) => {

    if (!user) return;

    const maxPossible = Math.floor(user.balance / caseData.price);
    const finalQuantity = Math.min(quantity, maxPossible);

    if (finalQuantity <= 0) {
      return alert("No tienes saldo suficiente.");
    }

    setIsOpening(true);
    setResult(null);
    setSelectedCase(caseData);

    setTimeout(() => {

      const newSkins = [];

      for (let i = 0; i < finalQuantity; i++) {

        const rand = Math.random();
        let accumulated = 0;
        let selectedSkin = caseData.skins[0];

        for (const skin of caseData.skins) {
          accumulated += skin.chance;
          if (rand <= accumulated) {
            selectedSkin = skin;
            break;
          }
        }

        newSkins.push({
          ...selectedSkin,
          id: `case-${Date.now()}-${Math.random()}`
        });
      }

      const updatedUser = {
        ...user,
        balance: user.balance - (caseData.price * finalQuantity),
        inventory: [...user.inventory, ...newSkins]
      };

      updateUser(updatedUser);
      setResult({ skins: newSkins, caseData });
      setIsOpening(false);

    }, 1200);
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#050812,#0a0f1e,#040609)',
      color: 'white',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
          📦 Abrir Cajas
        </h1>

        <p style={{ textAlign: 'center', marginBottom: '30px' }}>
          Saldo disponible: <span style={{ color: '#10b981' }}>${user?.balance}</span>
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: '24px'
        }}>
          {CASES.map((caseData) => {

            const maxByMoney = user ? Math.floor(user.balance / caseData.price) : 0;

            return (
              <div key={caseData.id} style={{
                background: '#111827',
                padding: '20px',
                borderRadius: '16px',
                border: `2px solid ${caseData.borderColor}`
              }}>

                <h2>{caseData.emoji} {caseData.name}</h2>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>{caseData.description}</p>

                <h3 style={{ color: caseData.color }}>
                  ${caseData.price}
                </h3>

                {/* Cantidad */}
                <div style={{ margin: '10px 0' }}>
                  <input
                    type="number"
                    min="1"
                    max={maxByMoney}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(Number(e.target.value), maxByMoney)))
                    }
                    style={{
                      width: '80px',
                      textAlign: 'center'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Máx según saldo: {maxByMoney}
                  </div>
                </div>

                <button
                  onClick={() => openCase(caseData)}
                  disabled={isOpening || maxByMoney <= 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: maxByMoney <= 0 ? '#374151' : caseData.color,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {isOpening ? "Abriendo..." : `Abrir x${quantity}`}
                </button>

              </div>
            );
          })}
        </div>

        {/* RESULTADO */}
        {result && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: '#0f172a',
            borderRadius: '16px'
          }}>
            <h2>🎉 Resultado</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
              gap: '15px'
            }}>
              {result.skins.map((skin) => (
                <div key={skin.id} style={{
                  padding: '10px',
                  background: '#1e293b',
                  borderRadius: '10px',
                  border: `1px solid ${getRarityInfo(skin.rarity).color}`
                }}>
                  <img src={skin.image} alt={skin.name} style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'contain'
                  }} />
                  <p>{skin.name}</p>
                  <p style={{ color: '#10b981' }}>${skin.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}