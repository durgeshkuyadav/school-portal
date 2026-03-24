# ── Build Stage ─────────────────────────────────────────────────
# NODE_OPTIONS limits Node.js heap during build so it doesn't
# blow up memory on low-RAM machines.
FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_OPTIONS="--openssl-legacy-provider --max-old-space-size=512"
ENV GENERATE_SOURCEMAP=false
ENV CI=false

COPY package*.json ./
RUN npm install --legacy-peer-deps --silent

COPY public ./public
COPY src ./src
COPY nginx.conf ./

RUN node --max-old-space-size=512 node_modules/.bin/react-scripts build

# ── Runtime Stage ────────────────────────────────────────────────
# nginx:1.27-alpine is ~40 MB. No JVM, no Node — stays tiny.
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck hits the /health endpoint already defined in nginx.conf
# Uses wget (available in alpine) — not curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]