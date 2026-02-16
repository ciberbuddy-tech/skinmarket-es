import { useState } from "react";
import { motion } from "framer-motion";

export default function CaseRoulette({ caseSkins, onWin }) {
  const [spinning, setSpinning] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(null);

  const openCase = () => {
    if (spinning) return;
    setSpinning(true);

    const randomSkin = caseSkins[Math.floor(Math.random() * caseSkins.length)];
    setSelectedSkin(randomSkin);

    setTimeout(() => {
      setSpinning(false);
      onWin(randomSkin);
    }, 3000); // duración de la animación
  };

  return (
    <div className="container">
      <h1>Abrir Caja (100€)</h1>
      <div style={{ overflow: "hidden", display: "flex", marginBottom: 20 }}>
        <motion.div
          animate={{ x: spinning ? -300 : 0 }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{ display: "flex", gap: 20 }}
        >
          {caseSkins.concat(caseSkins).map((skin, idx) => (
            <div key={idx} className="card" style={{ minWidth: 150 }}>
              <h4>{skin.name}</h4>
              <p>{skin.price} €</p>
            </div>
          ))}
        </motion.div>
      </div>
      <button onClick={openCase} disabled={spinning}>Abrir Caja</button>
      {selectedSkin && !spinning && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2>¡Ganaste!</h2>
          <p>{selectedSkin.name} ({selectedSkin.price} €)</p>
        </div>
      )}
    </div>
  );
}