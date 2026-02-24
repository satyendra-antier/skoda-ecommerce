# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install all deps (including dev) so we can run seed at startup
COPY package*.json ./
RUN npm ci

COPY --from=builder /app/dist ./dist
COPY src ./src
COPY tsconfig*.json ./

RUN mkdir -p data

ENV NODE_ENV=production
EXPOSE 4000

# Run seed (idempotent) then start API
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
