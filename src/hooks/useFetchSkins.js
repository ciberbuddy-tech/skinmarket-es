// src/hooks/useFetchSkins.js
const SKINS_API = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

// export const getSkins
export const getSkins = async () => {
  try {
    const res = await fetch(SKINS_API);
    const result = await res.json();

    // To prevent crashing the browser and getting blocked by Steam, 
    // we limit and simulate highly realistic market prices based on rarity, 
    // just like Key-Drop caches their own DB prices.
    return result.map((skin) => {
      let basePrice = Math.random() * 10;
      switch (skin.rarity?.name) {
        case "Covert": basePrice = Math.random() * 500 + 50; break;
        case "Classified": basePrice = Math.random() * 50 + 10; break;
        case "Restricted": basePrice = Math.random() * 10 + 2; break;
        case "Mil-Spec Grade": basePrice = Math.random() * 2 + 0.5; break;
        case "Consumer Grade": basePrice = Math.random() * 0.5 + 0.05; break;
      }
      return {
        id: skin.id,
        name: skin.name,
        price: parseFloat(basePrice.toFixed(2)),
        rarity: skin.rarity?.name || "Unknown",
        image: skin.image || "",
        raw: skin,
      };
    });
  } catch (err) {
    console.error("Error cargando skins:", err);
    return [];
  }
};

// Hook React para usar skins
import { useState, useEffect } from "react";

export const useFetchSkins = (count = 6, random = true) => {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSkins = async () => {
      try {
        setLoading(true);
        const data = await getSkins();
        let result = data;

        if (random) {
          result = data.sort(() => Math.random() - 0.5).slice(0, count);
        } else {
          result = data.slice(0, count);
        }

        setSkins(result);
        setError(null);
      } catch (err) {
        console.error("Error en useFetchSkins:", err);
        setError(err.message);
        setSkins([]);
      } finally {
        setLoading(false);
      }
    };

    loadSkins();
  }, [count, random]);

  return { skins, loading, error };
};