import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { API_URL } from "../context/AuthContext";
import { motion } from "framer-motion";
import { getRarityColor } from "../constants/colors.js";
import { getSkins } from "../hooks/useFetchSkins.js";
import RechargeModal from "../components/RechargeModal";

const SettingsModal = ({ open, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [link, setLink] = useState(user?.link_intercambio || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const success = await updateProfile(link);
    if (success) {
      alert("¡Enlace guardado correctamente!");
      onClose();
    } else {
      alert("Error al guardar el enlace. Asegúrate de que sea un enlace válido.");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
      zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: '#16191e', width: '100%', maxWidth: '500px', borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.05)', padding: '40px', textAlign: 'center'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '10px' }}>⚙️ CONFIGURACIÓN</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '30px' }}>Configura tu Link de Intercambio de Steam para cargar tus skins.</p>

        <div style={{ marginBottom: '30px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '10px' }}>LINK DE INTERCAMBIO (STEAM TRADE LINK)</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://steamcommunity.com/tradeoffer/new/..."
            style={{
              width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>CANCELAR</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '15px', borderRadius: '12px', background: '#f5ac3b', color: 'black', border: 'none', cursor: 'pointer', fontWeight: '900' }}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</button>
        </div>
      </motion.div>
    </div>
  );
};

const DepositModal = ({ open, onClose, onDeposit }) => {
  const { user } = useAuth();
  const [steamSkins, setSteamSkins] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idInput, setIdInput] = useState(user?.steam_id || "");

  const fetchInventory = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/steam-inventory/${idToFetch}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setSteamSkins(data);
      } else {
        alert(data.error || "No se ha podido cargar el inventario.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con Steam");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user?.steam_id) {
      fetchInventory(user.steam_id);
    }
  }, [open, user?.steam_id]);

  if (!open) return null;

  const toggleSelect = (skin) => {
    if (selectedItems.find(s => s.id === skin.id)) {
      setSelectedItems(prev => prev.filter(s => s.id !== skin.id));
    } else {
      setSelectedItems(prev => [...prev, skin]);
    }
  };

  const currentTotal = selectedItems.reduce((acc, s) => acc + s.price, 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: '#1a1d23', width: '100%', maxWidth: '900px', borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden'
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)',
          border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%',
          cursor: 'pointer', fontSize: '1.2rem', zIndex: 10
        }}>✕</button>

        <div style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px' }}>📦 TU INVENTARIO DE STEAM</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Selecciona los objetos que deseas depositar en la plataforma.</p>

          {!user?.steam_id && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <input
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="Introduce tu SteamID64 o Link de Intercambio..."
                style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
              <button
                onClick={() => {
                  let finalId = idInput;
                  const match = idInput.match(/partner=(\d+)/);
                  if (match) finalId = (BigInt(match[1]) + BigInt("76561197960265728")).toString();
                  fetchInventory(finalId);
                }}
                style={{ padding: '0 25px', borderRadius: '12px', background: '#f5ac3b', border: 'none', fontWeight: '900', cursor: 'pointer' }}
              >CARGAR</button>
            </div>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px'
          }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '3px solid rgba(245, 172, 59, 0.1)', borderTopColor: '#f5ac3b', borderRadius: '50%', margin: '0 auto' }} />
                <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.4)' }}>Buscando tus skins en Steam...</p>
              </div>
            ) : steamSkins.length > 0 ? steamSkins.map(skin => {
              const isSelected = selectedItems.find(s => s.id === skin.id);
              return (
                <div
                  key={skin.id}
                  onClick={() => skin.marketable !== false && toggleSelect(skin)}
                  style={{
                    background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '20px', padding: '15px',
                    cursor: skin.marketable !== false ? 'pointer' : 'not-allowed',
                    textAlign: 'center',
                    transition: 'all 0.2s', position: 'relative',
                    opacity: skin.marketable !== false ? 1 : 0.4
                  }}
                >
                  {skin.marketable === false && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.6rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '5px', zIndex: 1, color: '#ff4444' }}>🔒 COLECCIONABLE</div>
                  )}
                  <img src={skin.image} style={{ width: '100%', height: '80px', objectFit: 'contain' }} />
                  <div style={{ fontSize: '0.65rem', fontWeight: 'bold', margin: '10px 0 5px', color: 'rgba(255,255,255,0.6)' }}>{skin.name}</div>
                  <div style={{ color: '#10b981', fontWeight: '900', fontSize: '0.9rem' }}>{skin.price}€</div>
                  {isSelected && <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#3b82f6' }}>✅</div>}
                </div>
              );
            }) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.2)' }}>
                No se han encontrado objetos. Asegúrate de que tu inventario de Steam sea PÚBLICO.
              </div>
            )}
          </div>
        </div>

        <div style={{
          padding: '30px 40px', background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: '900' }}>TOTAL SELECCIONADO</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{currentTotal.toFixed(2)}€</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDeposit(selectedItems)}
            disabled={selectedItems.length === 0}
            style={{
              padding: '18px 40px', borderRadius: '18px', background: selectedItems.length > 0 ? '#10b981' : 'rgba(255,255,255,0.1)',
              color: 'white', border: 'none', fontWeight: '900', cursor: selectedItems.length > 0 ? 'pointer' : 'default'
            }}
          >
            DEPOSITAR {selectedItems.length} OBJETOS ➔
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default function Dashboard() {
  const { user, sellSkin, withdrawSkin, depositSkins } = useAuth();
  const [notification, setNotification] = useState(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  if (!user) return null;

  const stats = [
    { label: "SALDO DISPONIBLE", value: `${(user.balance || 0).toLocaleString()} €`, color: "#f5ac3b" },
    { label: "SKINS EN INVENTARIO", value: user.inventory?.length || 0, color: "#3b82f6" },
    { label: "VALOR DEL INVENTARIO", value: `${(user.inventory?.reduce((a, b) => a + Number(b.price || 0), 0) || 0).toLocaleString()} €`, color: "#a855f7" }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1115',
      color: 'white',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* Left Column: Inventory */}
        <div style={{ flex: '2', minWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>MI INVENTARIO</h2>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {user.inventory?.length || 0} OBJETOS
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '15px'
          }}>
            {user.inventory?.sort((a, b) => b.price - a.price).map((skin) => {
              const color = getRarityColor(skin.rarity);
              return (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "20px",
                    padding: "20px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderBottom: `3px solid ${color}`,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={skin.image}
                    alt={skin.name}
                    style={{ width: "90%", height: "80px", objectFit: "contain", marginBottom: '10px' }}
                    onError={(e) => {
                      e.target.src = "https://www.freeiconspng.com/uploads/no-image-icon-6.png";
                      e.target.style.opacity = "0.5";
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skin.name}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#f5ac3b', marginBottom: '15px' }}>{(skin.price || 0).toLocaleString()}€</div>

                  {/* Seccion de botones / Status */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {skin.status === "withdrawing" ? (
                      <div style={{
                        width: '100%', padding: '10px', borderRadius: '12px',
                        background: 'rgba(245, 172, 59, 0.1)', color: '#f5ac3b',
                        fontSize: '0.7rem', fontWeight: '900'
                      }}>
                        ⚙️ OFERTA ENVIADA (5s)
                      </div>
                    ) : (
                      <>
                        <motion.button
                          whileHover={skin.marketable !== false ? { scale: 1.05, background: '#ef4444', color: 'white' } : {}}
                          whileTap={skin.marketable !== false ? { scale: 0.95 } : {}}
                          onClick={() => skin.marketable !== false && sellSkin(skin.id)}
                          style={{
                            flex: 1,
                            padding: '10px 5px',
                            borderRadius: '12px',
                            border: skin.marketable !== false ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: skin.marketable !== false ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                            color: skin.marketable !== false ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            cursor: skin.marketable !== false ? 'pointer' : 'not-allowed',
                            opacity: skin.marketable !== false ? 1 : 0.5
                          }}
                        >
                          {skin.marketable !== false ? "VENDER" : "COLECCIONABLE"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, background: '#10b981', color: 'white' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            const res = await withdrawSkin(skin.id);
                            if (res.success) {
                              setNotification(res.message || `¡Propuesta de intercambio enviada para ${skin.name}!`);
                            } else {
                              setNotification(`Error: ${res.error || "No se pudo retirar"}`);
                            }
                            setTimeout(() => setNotification(null), 4000);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 5px',
                            borderRadius: '12px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            background: 'rgba(16, 185, 129, 0.05)',
                            color: '#10b981',
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            cursor: 'pointer'
                          }}
                        >
                          RECOGER
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Profile */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '32px',
            padding: '40px',
            position: 'sticky',
            top: '120px'
          }}>
            {/* User Info Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, #f5ac3b, #ffba52)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '3rem',
                fontWeight: '900',
                color: 'black',
                boxShadow: '0 20px 40px rgba(245, 172, 59, 0.3)',
                position: 'relative'
              }}>
                {user.nombre_usuario?.charAt(0).toUpperCase() || "S"}
                <div style={{
                  position: 'absolute', bottom: '-10px', right: '-10px',
                  background: '#1a1d23', padding: '5px 12px', borderRadius: '10px',
                  fontSize: '0.8rem', fontWeight: '900', border: '2px solid #f5ac3b', color: 'white'
                }}>
                  Lvl {user.level || 0}
                </div>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
                {user.nombre_usuario?.toUpperCase() || user.email.split('@')[0].toUpperCase()}
              </h1>
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '900', marginBottom: '5px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>EXPERIENCIA</span>
                  <span>{user.exp || 0} / 1000 XP</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.exp % 1000) / 10}%` }}
                    style={{ height: '100%', background: '#f5ac3b', borderRadius: '10px' }}
                  />
                </div>
              </div>
            </div>

            {/* Stats List */}
            <div style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
              {stats.map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '18px',
                  borderRadius: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <motion.button
                onClick={() => setDepositModalOpen(true)}
                whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '18px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#3b82f6',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                📥 IMPORTAR INVENTARIO STEAM
              </motion.button>

              <motion.button
                onClick={() => setRechargeModalOpen(true)}
                whileHover={{ scale: 1.02, background: 'rgba(245, 172, 59, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '18px',
                  background: '#f5ac3b',
                  border: 'none',
                  color: 'black',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                RECARGAR SALDO
              </motion.button>
              <button
                onClick={() => setSettingsModalOpen(true)}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>CONFIGURACIÓN</button>
            </div>
          </div>
        </div>

      </div>
      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            background: '#10b981', color: 'white', padding: '15px 30px', borderRadius: '15px',
            fontWeight: 'bold', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', zIndex: 1000
          }}
        >
          {notification}
        </motion.div>
      )}
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onDeposit={(selectedSkins) => {
          depositSkins(selectedSkins);
          setDepositModalOpen(false);
          setNotification(`¡${selectedSkins.length} objetos depositados correctamente!`);
          setTimeout(() => setNotification(null), 4000);
        }}
      />
      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <RechargeModal
        open={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
      />
    </div>
  );
}