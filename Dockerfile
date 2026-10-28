# syntax=docker/dockerfile:1.7

# Build a fully static export. `NEXT_OUTPUT=export` disables Cache Components
# for this build only; the app is client-only, so no Node server is needed.
FROM node:22-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT=export
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve only static HTML/JS/CSS with nginx. This is the smallest runtime surface
# for RecoSheet and keeps the zero-server guarantee.
FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
STOPSIGNAL SIGQUIT
