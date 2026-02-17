import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function BattleModal({ open, onClose, onSelectBoxes }) {
  const { user } = useAuth();
  const [selectedBoxes, setSelectedBoxes] = useState({}); 
  // ejemplo: { basic: 2, epic: 1 }

  if (!open) return null;

  const boxes = [
    { id: "basic", name: "Caja Básica", cost: 50, riskMultiplier: 1 },
    { id: "advanced", name: "Caja Avanzada", cost: 150, riskMultiplier: 1.5 },
    { id: "epic", name: "Caja Épica", cost: 300, riskMultiplier: 2 }
  ];

  const handleQuantityChange = (boxId, value, boxCost) => {
    if (!user) return;
    const maxQty = Math.floor(user.balance / boxCost);
    const newQty = Math.max(0, Math.min(value, maxQty)); // 0 permite quitar la caja
    setSelectedBoxes(prev => ({ ...prev, [boxId]: newQty }));
  };

  const totalCost = Object.entries(selectedBoxes).reduce((sum, [boxId, qty]) => {
    const box = boxes.find(b => b.id === boxId);
    return sum + (box?.cost || 0) * qty;
  }, 0);

  const canAfford = user && totalCost <= user.balance && totalCost > 0;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999
      }}
    >
      <div style={{
        background: "#0f172a",
        padding: "24px",
        borderRadius: "16px",
        minWidth: "320px",
        textAlign: "center",
        color: "white"
      }}>
        <h2 style={{ marginBottom: "20px" }}>Elige tus cajas</h2>

        {boxes.map((box) => {
          const qty = selectedBoxes[box.id] || 0;
          const maxQty = user ? Math.floor(user.balance / box.cost) : 0;
          return (
            <div key={box.id} style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                {box.name} – {box.cost}€
              </div>

              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <button
                  disabled={qty <= 0}
                  onClick={() => handleQuantityChange(box.id, qty - 1, box.cost)}
                >−</button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => handleQuantityChange(box.id, parseInt(e.target.value) || 0, box.cost)}
                  style={{ width: "60px", textAlign: "center" }}
                  min={0}
                  max={maxQty}
                />
                <button
                  disabled={qty >= maxQty}
                  onClick={() => handleQuantityChange(box.id, qty + 1, box.cost)}
                >+</button>
              </div>
            </div>
          );
        })}

        <div style={{ marginBottom: "16px" }}>
          <strong>Total:</strong> {parseFloat(totalCost).toFixed(2)}€
        </div>

        <button
          disabled={!canAfford}
          onClick={() => {
            onSelectBoxes(selectedBoxes);
            setSelectedBoxes({});
          }}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: canAfford ? "#3b82f6" : "#374151",
            cursor: canAfford ? "pointer" : "not-allowed",
            color: "white",
            fontWeight: "bold"
          }}
        >
          {canAfford ? "Abrir cajas" : "Saldo insuficiente"}
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            padding: "10px 20px",
            background: "#64748b",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>
      </div>
    </motion.div>
  );
}