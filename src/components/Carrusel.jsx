import Slider from "react-slick";
import { useEffect, useState } from "react";

const rarityColors = {
  "Mil-Spec Grade": "#4b92db",
  "Restricted": "#a32cc4",
  "Classified": "#d32f2f",
  "Covert": "#f39c12",
  "Exceedingly Rare": "#ffd700"
};

export default function Carrusel() {
  const [skins, setSkins] = useState([]);

  useEffect(() => {
    async function fetchSkins() {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
        );
        const data = await res.json();

        // Filtrar solo skins que tengan imagen y rareza
        const validSkins = data
          .filter(skin => skin.image && skin.rarity && skin.name)
          .map((skin, index) => ({
            id: `${skin.id}-${index}`,
            name: skin.name,
            price: Math.floor(Math.random() * 5000) + 200, // precio random
            rarity: skin.rarity?.name || "Mil-Spec Grade",
            image: skin.image
          }));

        // Mezclamos aleatoriamente
        const shuffled = validSkins.sort(() => Math.random() - 0.5);

        // Tomamos 20 skins iniciales para el carrusel
        setSkins(shuffled.slice(0, 30));

        // Cada 5 segundos agregamos una skin random al inicio
        const interval = setInterval(() => {
          const newSkin = validSkins[Math.floor(Math.random() * validSkins.length)];
          const formatted = {
            id: `${newSkin.id}-${Date.now()}`,
            name: newSkin.name,
            price: Math.floor(Math.random() * 5000) + 200,
            rarity: newSkin.rarity,
            image: newSkin.image
          };
          setSkins(prev => [formatted, ...prev.slice(0, 29)]);
        }, 5000);

        return () => clearInterval(interval);

      } catch (err) {
        console.error("Error fetching skins:", err);
      }
    }

    fetchSkins();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 4000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ]
  };

  if (!skins || skins.length === 0)
    return <p style={{ color: "white", textAlign: "center" }}>Cargando skins...</p>;

  return (
    <div style={{ padding: "2px 0", background: "#0a0f1e" }}>
      <h2 style={{ color: "white", marginLeft: "10px" }}>Últimas skins abiertas</h2>
      <Slider {...settings}>
        {skins.map((skin) => {
          const borderColor = rarityColors[skin.rarity] || "#00ff88";

          return (
            <div key={skin.id} style={{ padding: "10px" }}>
              <div style={{
                background: "#0f172a",
                borderRadius: "12px",
                padding: "10px",
                textAlign: "center",
                border: `2px solid ${borderColor}`,
                boxShadow: `0 0 10px ${borderColor}`
              }}>
                <img
                  src={skin.image}
                  alt={skin.name}
                  style={{
                    width: "100%",
                    height: "40px",
                    objectFit: "contain",
                    marginBottom: "5px"
                  }}
                />
                <h4 style={{ fontSize: "0.9rem", marginBottom: "4px", color: "white" }}>{skin.name}</h4>
                <p style={{ fontWeight: "bold", margin: "0", color: "white" }}>{skin.price.toLocaleString()} €</p>
                <p style={{ color: borderColor, fontWeight: "bold", margin: "4px 0 0 0" }}>
                  {skin.rarity.toUpperCase()}
                </p>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}