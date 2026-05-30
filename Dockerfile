# Build stage — Vite/Vue
FROM node:20-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Railway injeta variáveis VITE_* no build; ARG expõe no stage do Docker
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ARG VITE_TOKEN_HEADER
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_TOKEN_HEADER=$VITE_TOKEN_HEADER

RUN npm run build

# Serve stage — Caddy (recomendado pelo Railway para SPAs)
FROM caddy:2-alpine

WORKDIR /app

COPY Caddyfile ./
RUN caddy fmt Caddyfile --overwrite

COPY --from=build /app/dist ./dist

CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
