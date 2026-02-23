import { motion } from "framer-motion";

const rarityColors = {
  "Mil-Spec Grade": "#4b92db",
  "Restricted": "#a32cc4",
  "Classified": "#d32f2f",
  "Covert": "#f39c12",
  "Exceedingly Rare": "#ffd700"
};

export default function SkinCard({ skin }) {
  const rarity = skin.rarity || "Mil-Spec Grade";
  const borderColor = rarityColors[rarity] || "#f5ac3b";

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 25px ${borderColor}`
      }}
      transition={{ duration: 0.3 }}
      style={{
        background: "#0f172a",
        borderRadius: "16px",
        padding: "20px",
        color: "white",
        textAlign: "center",
        border: `2px solid ${borderColor}`,
        cursor: "pointer"
      }}
    >
      {/* Imagen */}
      {skin.image && (
        <img
          src={skin.image}
          alt={skin.name}
          style={{
            width: "100%",
            height: "140px",
            objectFit: "contain",
            marginBottom: "15px"
          }}
        />
      )}

      {/* Nombre */}
      <h2 style={{ fontSize: "1rem", marginBottom: "10px" }}>
        {skin.name}
      </h2>

      {/* Precio */}
      <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
        {skin.price} €
      </p>

      {/* Rareza */}
      <p>
        Rareza:{" "}
        <strong style={{ color: borderColor }}>
          {rarity.toUpperCase()}
        </strong>
      </p>

      {/* Botón */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        style={{
          marginTop: "12px",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          background: borderColor,
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Comprar
      </motion.button>
    </motion.div>
  );
}