import { useEffect, useState } from "react";
import { getSkins } from "../hooks/useFetchSkins";

export default function WeaponSearch() {
  const [skins, setSkins] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  // Cargar skins desde API centralizado
  useEffect(() => {
    getSkins()
      .then(data => {
        setSkins(data);
        setFiltered(data);
      })
      .catch(err => console.error("Error cargando skins:", err));
  }, []);

  // Filtrar cuando el usuario escribe
  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      skins.filter(skin => 
        skin.name.toLowerCase().includes(lower)
      )
    );
  }, [search, skins]);

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h2>Buscar Skins CS2</h2>

      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Escribe el nombre o arma..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          fontSize: "16px"
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {filtered.map(skin => (
          <div key={skin.id} style={{
            background: "#1f2937",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            {/* Imagen */}
            {skin.image && (
              <img
                src={skin.image}
                alt={skin.name}
                style={{ width: "100%", borderRadius: "6px" }}
              />
            )}

            {/* Nombre */}
            <h3 style={{ fontSize: "14px", margin: "8px 0" }}>
              {skin.name}
            </h3>

            {/* Arma */}
            {skin.weapon && (
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                Arma: {skin.weapon.name}
              </p>
            )}

            {/* Rareza */}
            {skin.rarity && (
              <p style={{ fontSize: "12px", color: skin.rarity.color }}>
                Rareza: {skin.rarity.name}
              </p>
            )}

            {/* Descripción */}
            {skin.description && (
              <p style={{ fontSize: "10px", opacity: 0.7 }}>{skin.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}