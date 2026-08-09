FROM node:20-slim

WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# Cloud hosts inject PORT; app.js reads config.port (process.env.PORT || 3000)
ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "app.js"]
