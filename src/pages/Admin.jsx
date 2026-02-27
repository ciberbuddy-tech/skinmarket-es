import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { API_URL } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Admin() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [probs, setProbs] = useState({ covert: 0.5, classified: 2, restricted: 15, mil_spec: 82.5 });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        const token = localStorage.getItem("skinmarket_token");
        try {
            const sRes = await fetch(`${API_URL}/admin/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const sData = await sRes.json();
            setStats(sData);

            const pRes = await fetch(`${API_URL}/admin/settings/probabilities`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const pData = await pRes.json();
            if (pData.covert !== undefined) setProbs(pData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateProbs = async () => {
        const token = localStorage.getItem("skinmarket_token");
        const total = Object.values(probs).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        if (Math.abs(total - 100) > 0.01) {
            alert("La suma de probabilidades debe ser 100%");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/settings/probabilities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ probabilities: probs })
            });
            if (res.ok) {
                setMessage("¡Probabilidades actualizadas con éxito!");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            alert("Error al actualizar");
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Cargando panel de administración...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0f1115', color: 'white', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '40px' }}>🛡️ PANEL DE ADMINISTRACIÓN</h1>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    <StatCard title="USUARIOS TOTALES" value={stats?.users || 0} color="#3b82f6" />
                    <StatCard title="TRANSACCIONES" value={stats?.transactions || 0} color="#a855f7" />
                    <StatCard title="TOTAL DEPOSITADO" value={`${stats?.deposited || 0} €`} color="#10b981" />
                    <StatCard title="TOTAL RETIRADO" value={`${stats?.withdrawn || 0} €`} color="#ef4444" />
                </div>

                {/* Settings Area */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '30px' }}>⚙️ CONFIGURACIÓN DE PROBABILIDADES (CAJAS)</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Define los porcentajes (%) de aparición de cada rareza en las aperturas.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                        <ProbInput label="COVERT (Rojo)" value={probs.covert} onChange={(v) => setProbs({ ...probs, covert: v })} color="#eb4b4b" />
                        <ProbInput label="CLASSIFIED (Rosa)" value={probs.classified} onChange={(v) => setProbs({ ...probs, classified: v })} color="#d32ce6" />
                        <ProbInput label="RESTRICTED (Púrpura)" value={probs.restricted} onChange={(v) => setProbs({ ...probs, restricted: v })} color="#8847ff" />
                        <ProbInput label="MIL-SPEC (Azul)" value={probs.mil_spec} onChange={(v) => setProbs({ ...probs, mil_spec: v })} color="#4b69ff" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            SUMA TOTAL: <span style={{ color: Math.abs(Object.values(probs).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) - 100) < 0.01 ? '#10b981' : '#ef4444' }}>
                                {Object.values(probs).reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toFixed(2)}%
                            </span>
                        </div>
                        <button
                            onClick={handleUpdateProbs}
                            style={{
                                padding: '18px 40px', borderRadius: '18px', background: '#f5ac3b', color: 'black',
                                border: 'none', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            GUARDAR CONFIGURACIÓN
                        </button>
                    </div>
                    {message && <div style={{ color: '#10b981', marginTop: '20px', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>{title}</div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: color }}>{value}</div>
        </div>
    );
}

function ProbInput({ label, value, onChange, color }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${color}33`, color: 'white', fontWeight: '900', outline: 'none'
                    }}
                />
                <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', opacity: 0.5 }}>%</div>
            </div>
        </div>
    );
}
