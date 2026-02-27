import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [view, setView] = useState("login"); // 'login', 'register', 'recover'
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const { login, register, recoverPassword } = useAuth();
  const navigate = useNavigate();

  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  useEffect(() => {
    setEmailValid(validateEmail(email));
    setPasswordValid(validatePassword(password));
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (view === "login") {
      if (!email.trim() || !password.trim()) return setError("Todos los campos son obligatorios");
      setLoading(true);
      try {
        await login(email, password);
        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 800);
      } catch (err) {
        setError(err.message || "Error al iniciar sesión");
      } finally {
        setLoading(false);
      }
    } else if (view === "register") {
      if (!nombreUsuario.trim()) return setError("El nombre de usuario es obligatorio");
      if (!emailValid) return setError("Email inválido");
      if (!passwordValid) return setError("La contraseña debe tener 6+ caracteres");
      if (password !== confirmPassword) return setError("Las contraseñas no coinciden");

      setLoading(true);
      try {
        await register(nombreUsuario, email, password);
        setSuccess(true);
        setTimeout(() => setView("login"), 1500);
      } catch (err) {
        setError(err.message || "Error al registrar");
      } finally {
        setLoading(false);
      }
    } else if (view === "recover") {
      if (!emailValid) return setError("Email inválido");
      try {
        const msg = recoverPassword(email);
        setRecoveryMessage(msg);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f1115", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #f5ac3b11 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #3b82f611 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: 0, background: 'rgba(15, 17, 21, 0.8)',
            backdropFilter: 'blur(10px)', zIndex: 10, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              border: '4px solid rgba(245, 172, 59, 0.1)',
              borderTopColor: '#f5ac3b',
              marginBottom: '20px'
            }}
          />
          <p style={{ color: '#f5ac3b', fontWeight: '900', letterSpacing: '2px', fontSize: '0.8rem' }}>PROCESANDO...</p>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "32px", padding: "60px", maxWidth: "480px", width: "100%", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", zIndex: 1, backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
            {view === 'login' ? '🔑' : view === 'register' ? '📝' : '🛡️'}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: '900', color: "white", marginBottom: "5px", letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
            {view === 'login' ? 'Ingresar' : view === 'register' ? 'Registro' : 'Recuperar'}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", fontWeight: 'bold' }}>
            {view === 'login' ? 'Accede a tu cuenta premium' : view === 'register' ? 'Únete a la élite de SkinMarket' : 'Restablece tu acceso'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {view === 'register' && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontSize: "0.75rem", fontWeight: "900" }}>NOMBRE DE USUARIO</label>
              <input type="text" placeholder="Ej: SkinMaster77" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} style={inputStyle} />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontSize: "0.75rem", fontWeight: "900" }}>EMAIL</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>

          {view !== 'recover' && (
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontSize: "0.75rem", fontWeight: "900" }}>CONTRASEÑA</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '50px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    transition: 'color 0.2s'
                  }}
                >
                  {showPassword ? "🔒" : "🔓"}
                </button>
              </div>
            </div>
          )}

          {view === 'register' && (
            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontSize: "0.75rem", fontWeight: "900" }}>CONFIRMAR CONTRASEÑA</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
            </div>
          )}

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{view === 'register' ? '¡Registro exitoso! Redirigiendo...' : '¡Acceso concedido!'}</div>}
          {recoveryMessage && <div style={successStyle}>{recoveryMessage}</div>}

          <button type="submit" disabled={loading} style={{ ...buttonStyle, background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #f5ac3b 0%, #ffba52 100%)' }}>
            {loading ? "PROCESANDO..." : view === 'login' ? "INGRESAR" : view === 'register' ? "CREAR CUENTA" : "ENVIAR EMAIL"}
          </button>
        </form>

        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          {view === 'login' ? (
            <>
              <button onClick={() => setView("register")} style={linkStyle}>¿No tienes cuenta? Regístrate</button>
              <button onClick={() => setView("recover")} style={linkStyle}>Olvidé mi contraseña</button>
            </>
          ) : (
            <button onClick={() => setView("login")} style={linkStyle}>Volver al login</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}


const inputStyle = {
  width: "100%", padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "0.95rem", boxSizing: "border-box", outline: 'none'
};

const buttonStyle = {
  width: "100%", padding: "18px", borderRadius: "14px", border: "none", color: "black", fontWeight: "900", cursor: "pointer", fontSize: "1rem", letterSpacing: '1px'
};

const errorStyle = {
  background: "rgba(239, 68, 68, 0.1)", color: "#ff8a8a", padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.85rem", textAlign: 'center'
};

const successStyle = {
  background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.85rem", textAlign: 'center'
};

const linkStyle = {
  background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 'bold'
};