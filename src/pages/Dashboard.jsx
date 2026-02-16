import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  // Tomamos las 10 skins más caras
  const topSkins = user?.inventory
    ?.sort((a, b) => b.price - a.price)
    .slice(0, 10);

  const rarityColors = {
    "Mil-Spec Grade": "#4b92db",
    "Restricted": "#a32cc4",
    "Classified": "#d32f2f",
    "Covert": "#f39c12",
    "Exceedingly Rare": "#ffd700"
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #050812 0%, #0a0f1e 50%, #040609 100%)',
      color: 'white',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Panel de Usuario</h1>

      {/* Resumen del usuario */}
      {user && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#0f1324',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}>
          <h2>Saldo: {user.balance.toLocaleString()} €</h2>
          <p>Total Skins: {user.inventory?.length || 0}</p>

          {topSkins && topSkins.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Top 10 Skins:</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '10px'
              }}>
                {topSkins.map((skin) => {
                  const borderColor = rarityColors[skin.rarity] || "#00ff88";

                  return (
                    <div key={skin.id} style={{
                      background: "#0f172a",
                      borderRadius: "12px",
                      padding: "12px",
                      textAlign: "center",
                      border: `2px solid ${borderColor}`,
                      boxShadow: `0 0 10px ${borderColor}`
                    }}>
                      {skin.image && (
                        <img
                          src={skin.image}
                          alt={skin.name}
                          style={{
                            width: "100%",
                            height: "140px",
                            objectFit: "contain",
                            marginBottom: "10px"
                          }}
                        />
                      )}
                      <h4 style={{ fontSize: "1rem", marginBottom: "6px" }}>{skin.name}</h4>
                      <p style={{ fontWeight: "bold" }}>{skin.price.toLocaleString()} €</p>
                      <p style={{ color: borderColor, fontWeight: "bold" }}>{skin.rarity.toUpperCase()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}