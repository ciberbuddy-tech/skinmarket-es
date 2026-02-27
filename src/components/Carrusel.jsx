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
    let intervalId = null;

    async function loadSkins() {
      try {
        const data = await getSkins();

        const validSkins = data
          .filter(skin => skin.image && skin.rarity && skin.name)
          .map((skin, index) => ({
            id: `${skin.id}-${index}`,
            name: skin.name,
            price: Math.floor(Math.random() * 2000) + 10,
            rarity: skin.rarity?.name || "Mil-Spec Grade",
            image: skin.image
          }));

        const shuffled = validSkins.sort(() => Math.random() - 0.5);
        setSkins(shuffled.slice(0, 100));

        intervalId = setInterval(() => {
          const newSkin = validSkins[Math.floor(Math.random() * validSkins.length)];
          const formatted = {
            id: `${newSkin.id}-${Date.now()}`,
            name: newSkin.name,
            price: Math.floor(Math.random() * 2000) + 10,
            rarity: newSkin.rarity,
            image: newSkin.image
          };
          setSkins(prev => [formatted, ...prev.slice(0, 99)]);
        }, 5000);

      } catch (err) {
        console.error("Error fetching skins:", err);
      }
    }

    loadSkins();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 12,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    arrows: false,
    responsive: [
      { breakpoint: 1920, settings: { slidesToShow: 10 } },
      { breakpoint: 1600, settings: { slidesToShow: 8 } },
      { breakpoint: 1200, settings: { slidesToShow: 6 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 600, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ]
  };

  if (!skins || skins.length === 0)
    return <div style={{ height: "70px", background: "#0c0d10", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />;

  return (
    <div style={{
      padding: "0",
      background: "#0c0d10",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden",
      height: '70px',
      position: 'relative',
      zIndex: 10
    }}>
      <Slider {...settings}>
        {skins.map((skin) => {
          const color = rarityColors[skin.rarity] || "#4b92db";

          return (
            <div key={skin.id} style={{ outline: "none" }}>
              <div style={{
                position: 'relative',
                height: "70px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "0 15px",
                gap: '12px',
                borderRight: "1px solid rgba(255,255,255,0.03)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                overflow: 'hidden'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Background Glow */}
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '40px',
                  background: color,
                  filter: 'blur(25px)',
                  opacity: 0.15,
                  zIndex: 0
                }} />

                {/* Skin Image */}
                <div style={{ width: '50px', height: '40px', position: 'relative', zIndex: 1 }}>
                  <img
                    src={skin.image}
                    alt={skin.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))"
                    }}
                  />
                </div>

                {/* Info Container */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: 0,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    color: 'white',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {skin.name.split(" | ")[1] || skin.name}
                  </div>
                  <div style={{
                    fontSize: '0.6rem',
                    color: color,
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {skin.price}€
                  </div>
                </div>

                {/* Bottom Border Rarity */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                  opacity: 0.8
                }} />
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}