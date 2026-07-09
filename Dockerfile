# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Instalar dependencias primero (aprovecha la cache de Docker)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS serve

# Copiar el output del build (Angular 17+ con application builder → /browser)
COPY --from=build /app/dist/agrotrack-web-app/browser /usr/share/nginx/html

# Configuración nginx para SPA (manejo de rutas Angular)
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
