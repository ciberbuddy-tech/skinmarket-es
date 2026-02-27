# Dockerfile para SkinMarket
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir el frontend (si es Vite, esto genera la carpeta 'dist')
RUN npm run build

# Exponer los puertos
EXPOSE 3000 3001

# Comando para iniciar la aplicación (usando ecosystem config)
CMD ["npx", "pm2-runtime", "ecosystem.config.js"]
