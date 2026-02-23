import Slider from "react-slick";
import { useEffect, useState } from "react";
import { getSkins } from "../hooks/useFetchSkins";

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
    async function loadSkins() {
      try {
        const data = await getSkins();

        // Filtrar solo skins que tengan imagen y rareza
        const validSkins = data
          .filter(skin => skin.image && skin.rarity && skin.name)
          .map((skin, index) => ({
            id: `${skin.id}-${index}`,
            name: skin.name,
            price: Math.floor(Math.random() * 5000) + 200,
            rarity: skin.rarity?.name || "Mil-Spec Grade",
            image: skin.image
          }));

        // Mezclamos aleatoriamente
        const shuffled = validSkins.sort(() => Math.random() - 0.5);

        // Tomamos 100 skins iniciales para llenar bien la barra
        setSkins(shuffled.slice(0, 100));

        // Añadir una skin nueva constantemente
        const interval = setInterval(() => {
          const newSkin = validSkins[Math.floor(Math.random() * validSkins.length)];
          const formatted = {
            id: `${newSkin.id}-${Date.now()}`,
            name: newSkin.name,
            price: Math.floor(Math.random() * 5000) + 200,
            rarity: newSkin.rarity,
            image: newSkin.image
          };
          setSkins(prev => [formatted, ...prev.slice(0, 99)]);
        }, 3000);

        return () => clearInterval(interval);

      } catch (err) {
        console.error("Error fetching skins:", err);
      }
    }

    loadSkins();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 10,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1600, settings: { slidesToShow: 8 } },
      { breakpoint: 1200, settings: { slidesToShow: 6 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 600, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ]
  };

  if (!skins || skins.length === 0)
    return <div style={{ height: "100px", background: "#101215", borderBottom: "1px solid #1a1e24" }} />;

  return (
    <div style={{ padding: "0", background: "#101215", borderBottom: "1px solid #1a1e24", overflow: "hidden" }}>
      <Slider {...settings}>
        {skins.map((skin) => {
          const borderColor = rarityColors[skin.rarity] || "#4b92db";

          return (
            <div key={skin.id} style={{ outline: "none" }}>
              <div style={{
                background: "linear-gradient(180deg, #16181c 0%, #101215 100%)",
                width: "160px",
                height: "100px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                borderBottom: `3px solid ${borderColor}`,
                borderRight: "1px solid #1a1e24",
                borderLeft: "1px solid #1a1e24",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#1a1e24";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "linear-gradient(180deg, #16181c 0%, #101215 100%)";
                }}
              >
                <img
                  src={skin.image}
                  alt={skin.name}
                  style={{
                    width: "80px",
                    height: "50px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                  }}
                />
                <div style={{ width: "100%", textAlign: "center" }}>
                  <h4 style={{
                    fontSize: "0.65rem",
                    margin: "0",
                    color: "rgba(255,255,255,0.7)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {skin.name.split(" | ")[0]}
                  </h4>
                  <h4 style={{
                    fontSize: "0.75rem",
                    margin: "2px 0 0 0",
                    color: "white",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {skin.name.split(" | ")[1] || skin.name}
                  </h4>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}