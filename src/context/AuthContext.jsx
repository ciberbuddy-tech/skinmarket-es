// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getSkins } from "../hooks/useFetchSkins";

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

  // Login con skins reales desde la API pública centralizada
  const login = async (email) => {
    try {
      // Usar hook centralizado para obtener skins
      const skinsData = await getSkins();

      // Elegimos 3 skins aleatorias para el inventario inicial
      const random3 = skinsData
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((skin) => ({
          id: `${skin.id}-${Date.now()}`,
          name: skin.name,
          price: Math.floor(Math.random() * 1500) + 100,
          rarity: skin.rarity?.name || "Unknown",
          image: skin.image || ""
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