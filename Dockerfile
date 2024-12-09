FROM node:18-alpine

# Configurez un argument pour API_URL
ARG API_URL
# Configurez la variable d'environnement dans le conteneur
ENV API_URL=${API_URL}

WORKDIR /app
RUN rm -rf node_modules package-lock.json
RUN rm -rf .output 
COPY package*.json ./
RUN npm install
COPY . .

# Build du projet Nuxt
RUN npm run build

# Lancer Nuxt en mode production
EXPOSE 3000
CMD ["npm", "run", "start"]
