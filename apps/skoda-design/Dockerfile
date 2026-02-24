# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage: serve static build
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 8080
# Listen on 0.0.0.0 so the app is reachable from host when run in Docker
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:8080"]
