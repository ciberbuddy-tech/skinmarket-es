// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("skinmarket_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Error parsing saved user", e);
        localStorage.removeItem("skinmarket_user");
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Login con skins reales desde la API pública JSON
  const login = async (email) => {
    try {
      // Petición a CSGO-API skins JSON
      const res = await fetch(
        "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
      );
      const skinsData = await res.json();

      // Elegimos 3 skins aleatorias para el inventario inicial
      const random3 = skinsData
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((skin) => ({
          id: `${skin.id}-${Date.now()}`,       // ID único
          name: skin.name,                      // Nombre real
          price: Math.floor(Math.random() * 1500) + 100,  // Precio random
          rarity: skin.rarity?.name || "Unknown",         // Rareza si existe
          image: skin.image || ""               // Imagen real del JSON
        }));

      const newUser = {
        email,
        balance: 1000,
        inventory: random3,
      };

      setUser(newUser);
      localStorage.setItem("skinmarket_user", JSON.stringify(newUser));
    } catch (err) {
      console.error("Error cargando skins reales desde la API", err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skinmarket_user");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("skinmarket_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);