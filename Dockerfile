FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build du projet Nuxt
RUN npm run build

# Lancer Nuxt en mode production
EXPOSE 3000
CMD ["npm", "run", "start"]
