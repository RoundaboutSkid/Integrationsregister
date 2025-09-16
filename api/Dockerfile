FROM node:20-alpine
WORKDIR /app
COPY api/package.json api/package-lock.json* ./
RUN npm install --omit=dev || true
COPY api ./
COPY db/migrations ./db/migrations
EXPOSE 4000
CMD ["node","src/index.js"]

