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

  // Validación en tiempo real
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
      await login(email, password); // Función de login del contexto
      // Guardar en localStorage
      localStorage.setItem("userEmail", email);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000); // Feedback visual antes de navegar
    } catch (err) {
      setError("Email o contraseña incorrectos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <div className="card" style={{
        maxWidth: '400px',
        margin: '0 auto',
        marginTop: '50px',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginTop: 0, textAlign: 'center' }}>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              marginBottom: '10px',
              padding: '10px',
              borderRadius: '4px',
              border: `1px solid ${email ? (emailValid ? '#28a745' : '#ff5555') : '#ccc'}`,
              boxSizing: 'border-box'
            }}
          />
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: `1px solid ${password ? (passwordValid ? '#28a745' : '#ff5555') : '#ccc'}`,
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {error && <p style={{ color: '#ff5555', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</p>}
          {success && <p style={{ color: '#28a745', fontSize: '0.9rem', marginBottom: '10px' }}>¡Login exitoso! Redirigiendo...</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '20px', textAlign: 'center' }}>
          💡 Tip: Usa tu email y una contraseña de al menos 6 caracteres
        </p>
      </div>
    </div>
  );
}