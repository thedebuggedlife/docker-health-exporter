# Stage 1: Build the application
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the final image
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 9090

CMD ["node", "dist/index.js"]
