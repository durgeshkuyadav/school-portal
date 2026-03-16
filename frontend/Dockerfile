# ── Build Stage ─────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV GENERATE_SOURCEMAP=false
ENV CI=false

COPY package*.json ./
RUN npm install --legacy-peer-deps --silent

COPY public ./public
COPY src ./src
COPY nginx.conf ./

RUN node --max-old-space-size=1024 node_modules/.bin/react-scripts build


# ── Runtime Stage ───────────────────────────
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]