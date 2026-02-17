// src/hooks/useFetchSkins.js
const SKINS_API = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

// Función para obtener skins con precios de Steam
export const getSkins = async () => {
  try {
    const res = await fetch(SKINS_API);
    const result = await res.json();

    const formatted = await Promise.all(
      result.map(async (skin) => {
        try {
          const priceRes = await fetch(
            `http://localhost:3001/api/steam-price?market_hash_name=${encodeURIComponent(skin.name)}`
          );
          const data = await priceRes.json();
          let price = 0;
          if (data?.lowest_price) {
            price = parseFloat(data.lowest_price.replace("€", "").replace(",", "."));
          }
          return {
            id: skin.id,
            name: skin.name,
            price: price || 0,
            rarity: skin.rarity?.name || "Unknown",
            image: skin.image || "",
            raw: skin,
          };
        } catch {
          return {
            id: skin.id,
            name: skin.name,
            price: 0,
            rarity: skin.rarity?.name || "Unknown",
            image: skin.image || "",
            raw: skin,
          };
        }
      })
    );

    return formatted;
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