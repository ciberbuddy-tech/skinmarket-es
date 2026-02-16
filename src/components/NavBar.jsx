import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUpload } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const commonButtonStyle = {
    padding: "8px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  };

  const uploadButtonStyle = {
    ...commonButtonStyle,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#00ff88",
    color: "#000"
  };

  const logoutButtonStyle = {
    ...commonButtonStyle,
    background: "linear-gradient(90deg, #ff5555, #ff0000)",
    color: "#fff"
  };

  const loginButtonStyle = {
    ...commonButtonStyle,
    background: "#1e293b",
    color: "#fff"
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        padding: "12px 20px",
        background: "#0f172a",
        color: "white"
      }}
    >
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",          // separa logo y texto
          fontSize: "1.6rem",  // texto más grande
          fontWeight: "bold",
          color: "white",
          textDecoration: "none"
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            height: "1em",   // iguala la altura del texto
            width: "auto"
          }}
        />
        SkinMarket ES
      </Link>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: "white" }}>Panel</Link>
            <Link to="/cases" style={{ color: "white" }}>Cajas</Link>
            <Link to="/upgrade" style={{ color: "white" }}>Upgrade</Link>
            <Link to="/battles" style={{ color: "white" }}>Batallas</Link>
            <Link to="/inventory" style={{ color: "white" }}>Inventario</Link>

            <Link to="/upload">
              <button style={uploadButtonStyle}>
                <FaUpload /> Subir Skin
              </button>
            </Link>

            <span
              style={{
                background: "rgba(0, 255, 136, 0.1)",
                padding: "8px 15px",
                borderRadius: "8px",
                border: "1px solid #00ff88",
                fontSize: "0.9rem"
              }}
            >
              💰 Saldo: {user.balance.toLocaleString()} €
            </span>

            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <button style={loginButtonStyle}>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}