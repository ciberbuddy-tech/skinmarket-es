#!/bin/bash
# watchdog.sh - script para verificar si los servicios clave están activos y reiniciarlos si fallan.

LOG_FILE="/var/log/watchdog.log"

check_service() {
    service_name=$1
    if ! systemctl is-active --quiet "$service_name"; then
        echo "$(date): El servicio $service_name está CAÍDO. Reiniciando..." >> $LOG_FILE
        sudo systemctl restart "$service_name"
    fi
}

check_port() {
    port=$1
    service_name=$2
    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "$(date): No hay nada escuchando en el puerto $port ($service_name/Node). Reiniciando con PM2..." >> $LOG_FILE
        # Suponiendo que PM2 se usa para los servicios de Node
        # pm2 restart all
    fi
}

# Verificar Nginx
check_service "nginx"

# Verificar Redis
check_service "redis"

# Verificar Postgres (si está en la misma máquina)
# check_service "postgresql"

# Opcional: verificar pm2 (backend y frontend)
# pm2 status | grep -q "online" || pm2 start ecosystem.config.js
