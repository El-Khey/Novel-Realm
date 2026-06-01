# =====================================================================
#  Dockerfile de PRODUCTION pour le front (build "multi-stage").
#  Étape 1 : on construit le bundle statique avec Node.
#  Étape 2 : on le sert avec nginx (serveur web minuscule et ultra-rapide).
#  L'image finale ne contient PAS Node, juste les fichiers compilés + nginx.
# =====================================================================

# ---- Étape 1 : build du bundle -------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# D'abord les manifestes de dépendances → cache Docker si elles ne changent pas.
COPY package*.json ./
RUN npm ci

# Puis le reste du code, et on génère le dossier statique dans /app/dist.
COPY . .
RUN npm run build

# ---- Étape 2 : service des fichiers statiques ----------------------
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# (nginx démarre tout seul via la commande par défaut de l'image)
