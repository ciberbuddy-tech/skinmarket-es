// src/hooks/api.js
import { useEffect, useState } from "react";

export function useSkinsApi() {   // <-- export nombrado
  const [skinsData, setSkinsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkins() {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
        );
        const data = await res.json();
        setSkinsData(data);
      } catch (err) {
        console.error("Error fetching skins:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSkins();
  }, []);

  return { skinsData, loading };
}