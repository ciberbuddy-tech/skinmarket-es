// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadSkin from "./pages/UploadSkin";
import Cases from "./pages/Cases";
import Battles from "./pages/Battles";
import Upgrade from "./pages/Upgrade";
import ProtectedRoute from "./components/ProtectedRoute";
import Inventory from "./components/Inventory";
import Carrusel from "./components/Carrusel";

export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Carrusel />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadSkin /></ProtectedRoute>} />
          <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
          <Route path="/battles" element={<ProtectedRoute><Battles /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}