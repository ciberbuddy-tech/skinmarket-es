// App.jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const UploadSkin = React.lazy(() => import("./pages/UploadSkin"));
const Cases = React.lazy(() => import("./pages/Cases"));
const CaseView = React.lazy(() => import("./pages/CaseView"));
const Battles = React.lazy(() => import("./pages/Battles"));
const Upgrade = React.lazy(() => import("./pages/Upgrade"));
const Inventory = React.lazy(() => import("./components/Inventory"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadSkin /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
            <Route path="/case/:id" element={<ProtectedRoute><CaseView /></ProtectedRoute>} />
            <Route path="/battles" element={<ProtectedRoute><Battles /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}