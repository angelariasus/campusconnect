# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile - CampusConnect Backend (Node.js + Express)
# Universidad Innovatec
# ─────────────────────────────────────────────────────────────────────────────

# ── Etapa 1: Dependencias ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Instalar dependencias del sistema necesarias para pg y bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar solo package.json para aprovechar la caché de Docker
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ── Etapa 2: Build (si se necesitara transpilación) ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ── Etapa 3: Imagen final de producción ──────────────────────────────────────
FROM node:20-alpine AS production

# Metadatos de la imagen
LABEL maintainer="Innovatec DevOps <devops@innovatec.edu.pe>"
LABEL version="1.0.0"
LABEL description="CampusConnect Backend API"

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S campususer -u 1001 -G nodejs

WORKDIR /app

# Copiar dependencias y código desde etapas anteriores
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/src          ./src
COPY --from=builder /app/package.json ./package.json

# Crear directorios necesarios con permisos correctos
RUN mkdir -p uploads logs && \
    chown -R campususer:nodejs /app

# Cambiar al usuario no-root
USER campususer

# Puerto expuesto
EXPOSE 3000

# Variables de entorno por defecto (sobreescribibles vía docker-compose)
ENV NODE_ENV=production \
    PORT=3000

# Health check para Docker/Orchestrator
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Comando de inicio
CMD ["node", "src/app.js"]
