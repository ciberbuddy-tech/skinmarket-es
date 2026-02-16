import { useAuth } from "../context/AuthContext";

export default function Inventory() {
  const { user, updateUser } = useAuth();

  const inventory = user?.inventory || [];

  // Valor total del inventario
  const totalValue = inventory.reduce(
    (acc, skin) => acc + (skin.price || 0),
    0
  );

  // Vender skin individual
  const sellSkin = (skinId) => {
    const skinToSell = inventory.find((s) => s.id === skinId);
    if (!skinToSell) return;

    const updatedInventory = inventory.filter((s) => s.id !== skinId);

    updateUser({
      ...user,
      inventory: updatedInventory,
      balance: user.balance + skinToSell.price,
    });
  };

  // Vender todas las skins
  const sellAllSkins = () => {
    updateUser({
      ...user,
      inventory: [],
      balance: user.balance + totalValue,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #050812 0%, #0a0f1e 50%, #040609 100%)",
        padding: "40px 20px",
        color: "white",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "20px" }}>
          Tu Inventario (Valor total: {totalValue.toLocaleString()} €)
        </h2>

        {/* Si no hay skins */}
        {inventory.length === 0 ? (
          <div
            style={{
              background: "rgba(20, 25, 50, 0.8)",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            No tienes skins en tu inventario actualmente.
          </div>
        ) : (
          <>
            {/* Botón vender todas */}
            <button
              onClick={sellAllSkins}
              style={{
                background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                marginBottom: "20px",
                cursor: "pointer",
              }}
            >
              Vender Todas las Skins
            </button>

            {/* Grid inventario */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {inventory.map((skin) => (
                <div
                  key={skin.id}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10,14,39,0.9), rgba(26,31,58,0.9))",
                    padding: "16px",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "300px",
                  }}
                >
                  {/* Imagen */}
                  {skin.image && (
                    <div
                      style={{
                        width: "100%",
                        height: "120px",
                        overflow: "hidden",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <img
                        src={skin.image}
                        alt={skin.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div>
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        marginBottom: "6px",
                      }}
                    >
                      {skin.name}
                    </h3>

                    <p
                      style={{
                        color: "#00ff88",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                    >
                      {skin.price} €
                    </p>

                    <p
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                      }}
                    >
                      Rareza:{" "}
                      {skin.rarity?.toUpperCase() || "MIL-SPEC"}
                    </p>
                  </div>

                  {/* Botón vender */}
                  <button
                    onClick={() => sellSkin(skin.id)}
                    style={{
                      background:
                        "linear-gradient(90deg, #ff4b2b, #ff416c)",
                      marginTop: "12px",
                      color: "white",
                      padding: "8px",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Vender por {skin.price}€
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}