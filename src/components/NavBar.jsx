import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useState } from "react";
import RechargeModal from "./RechargeModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rechargeOpen, setRechargeOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkStyle = {
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "color 0.2s ease",
    padding: "8px 12px",
    borderRadius: "8px",
  };

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 40px",
          height: "80px",
          background: "#0c0d10",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "1.4rem",
              fontWeight: "900",
              color: "white",
              textDecoration: "none",
              letterSpacing: '-0.5px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: '#f5ac3b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              color: 'black',
              fontSize: '1rem'
            }}>S</div>
            <span>SKINMART<span style={{ color: '#f5ac3b' }}>ES</span></span>
          </Link>

          {user && (
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <Link to="/cases" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>Cajas</Link>
              <Link to="/upgrade" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>Upgrade</Link>
              <Link to="/battles" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>Batallas</Link>
              <Link to="/ranking" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>Ranking</Link>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '6px 16px',
                  background: 'rgba(245, 172, 59, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 172, 59, 0.2)'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>SALDO</span>
                  <span style={{ fontWeight: '900', color: '#f5ac3b' }}>{(user.balance || 0).toLocaleString()} €</span>
                </div>
                <button
                  onClick={() => setRechargeOpen(true)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', background: '#f5ac3b',
                    border: 'none', color: 'black', fontWeight: '900', cursor: 'pointer',
                    fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link to="/ranking" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontSize: '1.2rem'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  🏆
                </Link>
                <Link to="/inventory" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontSize: '1.2rem'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  🎒
                </Link>
                <Link to="/dashboard" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontSize: '1.2rem'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  👤
                </Link>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "rgba(255,85,85,0.1)",
                  color: "#ff5555",
                  fontWeight: "900",
                  cursor: "pointer",
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,85,85,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,85,85,0.1)'}
              >
                SALIR
              </button>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: "12px 32px",
                borderRadius: "12px",
                border: "none",
                background: "#f5ac3b",
                color: "black",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: '0 4px 15px rgba(245, 172, 59, 0.3)'
              }}>
                LOGIN
              </button>
            </Link>
          )}
        </div>
      </nav>
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} />
    </>
  );
}