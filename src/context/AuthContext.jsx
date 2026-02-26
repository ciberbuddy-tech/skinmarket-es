// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado al iniciar
    const token = localStorage.getItem("skinmarket_token");
    if (token) {
      checkAuth(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        const mappedInventory = (userData.inventory || []).map(item => ({ ...item, price: Number(item.price) }));

        setUser({
          ...userData,
          balance: parseFloat(userData.saldo),
          level: userData.nivel || 0,
          exp: userData.experiencia || 0,
          inventory: mappedInventory
        });
      } else {
        localStorage.removeItem("skinmarket_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Error verifying auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre_usuario, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al registrar");

    localStorage.setItem("skinmarket_token", data.token);
    const mappedUser = {
      ...data.user,
      balance: parseFloat(data.user.saldo),
      level: 0,
      exp: 0
    };
    setUser(mappedUser);
    return mappedUser;
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al iniciar sesión");

    localStorage.setItem("skinmarket_token", data.token);
    const mappedUser = {
      ...data.user,
      balance: parseFloat(data.user.saldo),
      level: data.user.nivel || 0,
      exp: data.user.experiencia || 0
    };
    setUser(mappedUser);
    return mappedUser;
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem("skinmarket_token");
  };

  const updateUser = (updatedUserOrFn) => {
    setUser((prev) => {
      const next = typeof updatedUserOrFn === "function" ? updatedUserOrFn(prev) : updatedUserOrFn;
      return next;
    });
  };

  const fetchInventory = async () => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/inventory`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const mappedInventory = data.map(item => ({ ...item, price: Number(item.price) }));
      setUser(prev => ({ ...prev, inventory: mappedInventory }));
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const sellSkin = async (skinId) => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/inventory/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: skinId })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({
          ...prev,
          balance: parseFloat(data.newBalance),
          inventory: (prev.inventory || []).filter(s => s.id !== skinId)
        }));
        return true;
      }
    } catch (err) {
      console.error("Error selling skin:", err);
    }
    return false;
  };

  const withdrawSkin = async (skinId) => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/inventory/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: skinId })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({
          ...prev,
          inventory: (prev.inventory || []).map(s => s.id === skinId ? { ...s, status: data.message?.includes("real") ? "withdrawn" : "withdrawing" } : s)
        }));

        // Si no es real, al cabo de un tiempo marcamos como completado
        if (!data.message?.includes("real")) {
          setTimeout(fetchInventory, 10000);
        }
        return data;
      }
    } catch (err) {
      console.error("Error withdrawing skin:", err);
    }
    return { success: false, error: "Error de conexión" };
  };

  const depositSkins = async (skins) => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/inventory/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: skins })
      });
      const data = await res.json();
      if (data.success) {
        const mappedItems = data.items.map(item => ({ ...item, price: Number(item.price) }));
        setUser(prev => ({
          ...prev,
          inventory: [...(prev.inventory || []), ...mappedItems]
        }));
        return mappedItems;
      }
    } catch (err) {
      console.error("Error depositing skins:", err);
    }
    return false;
  };

  const updateProfile = async (link_intercambio) => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ link_intercambio })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({
          ...prev,
          link_intercambio: data.profile.link_intercambio,
          steam_id: data.profile.steam_id
        }));
        return true;
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
    return false;
  };

  const addToBalance = async (amount) => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return;

    try {
      console.log(`[AUTH] Solicitando actualización de saldo: +${amount}`);
      const res = await fetch(`${API_URL}/update-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      console.log("[AUTH] Respuesta servidor:", data);
      if (data.success) {
        const newBalance = parseFloat(data.newBalance);
        setUser(prev => ({
          ...prev,
          balance: newBalance,
          saldo: data.newBalance
        }));
        console.log("[AUTH] Balance actualizado en estado:", newBalance);
        return true;
      }
    } catch (err) {
      console.error("Error updating balance:", err);
    }
    return false;
  };

  const importSteamInventory = async () => {
    setUser(prev => ({ ...prev, inventory: [...(prev?.inventory || []), { id: Date.now(), name: "AK-47 | Redline", price: 25.50, rarity: "Covert", image: "" }] }));
  };

  const recoverPassword = (email) => {
    return `Se ha enviado un correo de recuperación a ${email} (Simulado)`;
  };

  const claimDaily = async () => {
    const token = localStorage.getItem("skinmarket_token");
    if (!token) return { success: false, error: "Inicia sesión primero" };

    try {
      const res = await fetch(`${API_URL}/claim-daily`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({
          ...prev,
          balance: parseFloat((prev.balance + parseFloat(data.reward)).toFixed(2)),
          exp: (prev.exp || 0) + data.expReward,
          ultimo_reclamo_diario: new Date().toISOString()
        }));
      }
      return data;
    } catch (err) {
      console.error("Error claiming daily:", err);
      return { success: false, error: "Error de conexión" };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, updateUser,
      sellSkin, withdrawSkin, depositSkins, importSteamInventory,
      recoverPassword, loading, checkAuth, addToBalance, updateProfile, fetchInventory,
      claimDaily
    }}>
      {children}
    </AuthContext.Provider>
  );
}
