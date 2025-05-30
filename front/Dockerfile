FROM node:18-alpine
WORKDIR /app
COPY package*.json ws-server.js ./
RUN npm install --production
CMD ["node", "ws-server.js"]