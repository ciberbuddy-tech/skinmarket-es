import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Validaciones en tiempo real
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

    if (!email.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!emailValid) {
      setError("Por favor ingresa un email válido");
      return;
    }
    if (!passwordValid) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      localStorage.setItem("userEmail", email);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
        border: "2px solid rgba(245, 172, 59, 0.2)",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "420px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
      }}>
        {/* Encabezado */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎮</div>
          <h1 style={{
            fontSize: "2rem",
            margin: 0,
            color: "white",
            marginBottom: "8px"
          }}>
            Iniciar Sesión
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            fontSize: "0.9rem"
          }}>
            Accede a tu cuenta de SkinMarket ES
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "8px",
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              📧 Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: `2px solid ${
                  email ? (emailValid ? "#f5ac3b" : "#ff5555") : "rgba(245, 172, 59,0.2)"
                }`,
                background: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "all 0.2s ease"
              }}
            />
            {email && !emailValid && (
              <p style={{ color: "#ff5555", fontSize: "0.8rem", margin: "4px 0 0 0" }}>
                ✗ Email inválido
              </p>
            )}
            {email && emailValid && (
              <p style={{ color: "#f5ac3b", fontSize: "0.8rem", margin: "4px 0 0 0" }}>
                ✓ Email válido
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <label style={{
              display: "block",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "8px",
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              🔒 Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 40px 12px 12px",
                borderRadius: "8px",
                border: `2px solid ${
                  password ? (passwordValid ? "#f5ac3b" : "#ff5555") : "rgba(245, 172, 59,0.2)"
                }`,
                background: "rgba(0,0,0,0.3)",
                color: "white",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "all 0.2s ease"
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "38px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.6)",
                transition: "color 0.2s ease"
              }}
              onMouseOver={(e) => e.target.style.color = "#f5ac3b"}
              onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
            {password && !passwordValid && (
              <p style={{ color: "#ff5555", fontSize: "0.8rem", margin: "4px 0 0 0" }}>
                ✗ Mínimo 6 caracteres
              </p>
            )}
            {password && passwordValid && (
              <p style={{ color: "#f5ac3b", fontSize: "0.8rem", margin: "4px 0 0 0" }}>
                ✓ Contraseña válida
              </p>
            )}
          </div>

          {/* Mensajes */}
          {error && (
            <div style={{
              background: "rgba(255, 85, 85, 0.1)",
              border: "2px solid #ff5555",
              color: "#ff9999",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "0.9rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "rgba(245, 172, 59, 0.1)",
              border: "2px solid #f5ac3b",
              color: "#f5ac3b",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "0.9rem"
            }}>
              ✓ ¡Inicio de sesión exitoso! Redirigiendo...
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading || !emailValid || !passwordValid}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: emailValid && passwordValid && !loading
                ? "linear-gradient(90deg, #f5ac3b 0%, #e0992a 100%)"
                : "rgba(245, 172, 59, 0.2)",
              color: emailValid && passwordValid && !loading ? "black" : "rgba(255,255,255,0.5)",
              border: "none",
              cursor: emailValid && passwordValid && !loading ? "pointer" : "not-allowed",
              fontWeight: "bold",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              boxShadow: emailValid && passwordValid && !loading
                ? "0 4px 15px rgba(245, 172, 59,0.3)"
                : "none"
            }}
            onMouseOver={(e) => {
              if (emailValid && passwordValid && !loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(245, 172, 59,0.5)";
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = emailValid && passwordValid && !loading
                ? "0 4px 15px rgba(245, 172, 59,0.3)"
                : "none";
            }}
          >
            {loading ? (
              <span style={{ display: "inline-block", animation: "pulse 1s infinite" }}>
                🔄 Ingresando...
              </span>
            ) : "🚀 Iniciar Sesión"}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "30px",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.5)"
        }}>
          <p style={{ margin: "0 0 8px 0" }}>
            💡 Tip: Email y contraseña de al menos 6 caracteres
          </p>
          <p style={{ margin: 0 }}>
            Datos almacenados localmente por seguridad
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}