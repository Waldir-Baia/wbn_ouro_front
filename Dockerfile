# Build stage: install dependencies and compile the Angular app
FROM node:20-slim AS build
WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
ARG BUILD_CONFIGURATION=production
RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

# Serve the compiled app using nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist/wbn-ouro-front/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
