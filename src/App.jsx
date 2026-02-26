// App.jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/NavBar";
import LiveDrops from "./components/LiveDrops";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const UploadSkin = React.lazy(() => import("./pages/UploadSkin"));
const Cases = React.lazy(() => import("./pages/Cases"));
const CaseView = React.lazy(() => import("./pages/CaseView"));
const Battles = React.lazy(() => import("./pages/Battles"));
const Upgrade = React.lazy(() => import("./pages/Upgrade"));
const Ranking = React.lazy(() => import("./pages/Ranking"));
const Inventory = React.lazy(() => import("./components/Inventory"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const About = React.lazy(() => import("./pages/About"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <LiveDrops />
          <main style={{ flex: 1 }}>
            <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><UploadSkin /></ProtectedRoute>} />
                <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
                <Route path="/case/:id" element={<ProtectedRoute><CaseView /></ProtectedRoute>} />
                <Route path="/battles" element={<ProtectedRoute><Battles /></ProtectedRoute>} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}