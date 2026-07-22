# Build stage — Vite/Vue
FROM node:20-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Railway injeta variáveis no build; ARG + ENV expõem no stage do Docker para o Vite
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ARG VITE_TOKEN_HEADER
ARG VITE_MP_PUBLIC_KEY
ARG VITE_WHATSAPP_NUMBER
ARG VITE_MP_CHECKOUT_PRO
ARG VITE_CAPTCHA_SITE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_TOKEN_HEADER=$VITE_TOKEN_HEADER
ENV VITE_MP_PUBLIC_KEY=$VITE_MP_PUBLIC_KEY
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER
ENV VITE_MP_CHECKOUT_PRO=$VITE_MP_CHECKOUT_PRO
ENV VITE_CAPTCHA_SITE_KEY=$VITE_CAPTCHA_SITE_KEY

RUN npm run build

# Serve stage — Caddy (recomendado pelo Railway para SPAs)
FROM caddy:2-alpine

WORKDIR /app

COPY Caddyfile caddy-entrypoint.sh ./
RUN caddy fmt Caddyfile --overwrite && chmod +x caddy-entrypoint.sh

COPY --from=build /app/dist ./dist

CMD ["/app/caddy-entrypoint.sh"]
