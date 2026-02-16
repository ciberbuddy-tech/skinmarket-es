import { useEffect, useState } from "react";
import SkinCard from "../components/SkinCard";

export default function Home() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
        );
        const data = await res.json();

        // Elegimos 6 skins aleatorias
        const randomSkins = data
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .map((skin) => ({
            id: skin.id,
            name: skin.name,
            price: Math.floor(Math.random() * 2000) + 200,
            rarity: skin.rarity?.name || "Unknown",
            image: skin.image || ""
          }));

        setSkins(randomSkins);
      } catch (err) {
        console.error("Error cargando skins desde API", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkins();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Cargando skins...
      </div>
    );
  }

  return (
      <div
        style={{
          minHeight: "100vh",
          background: "url('/fondo.png') center / cover no-repeat",
          padding: "40px"
        }}
      >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px"
        }}
      >
        {skins.map((skin) => (
          <SkinCard key={skin.id} skin={skin} />
        ))}
      </div>
    </div>
  );
}