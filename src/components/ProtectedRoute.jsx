import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container"><h1>Cargando...</h1></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}