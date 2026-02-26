import db from './db.js';

const initDb = async () => {
  const checkTableQuery = `
    CREATE TABLE IF NOT EXISTS usuarios (
        usuario_id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        saldo DECIMAL(15, 2) DEFAULT 0.00 CHECK (saldo >= 0),
        link_intercambio TEXT,
        steam_id VARCHAR(50),
        nivel INTEGER DEFAULT 0,
        experiencia INTEGER DEFAULT 0,
        fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Asegurar que las columnas existan si la tabla ya fue creada
  const alterTableQuery = `
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS link_intercambio TEXT;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS steam_id VARCHAR(50);
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS trade_token VARCHAR(20);
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 0;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS experiencia INTEGER DEFAULT 0;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_reclamo_diario TIMESTAMP WITH TIME ZONE;
  `;

  const checkInventoryTableQuery = `
    CREATE TABLE IF NOT EXISTS inventario (
        item_id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(usuario_id),
        name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT,
        rarity TEXT,
        marketable BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'on_site',
        fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(checkTableQuery);
    await db.query(alterTableQuery);
    await db.query(checkInventoryTableQuery);
    console.log("Tablas 'usuarios' e 'inventario' verificadas/creadas correctamente.");
    process.exit(0);
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err);
    process.exit(1);
  }
};

initDb();
