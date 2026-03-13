# ── Build Stage ──────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Fix Node 20 + react-scripts 5 OpenSSL compatibility
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --silent

# Copy source
COPY . .

# Build with increased memory limit
RUN node --max-old-space-size=1024 node_modules/.bin/react-scripts build

# ── Runtime Stage (Nginx) ─────────────────────────────────
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
