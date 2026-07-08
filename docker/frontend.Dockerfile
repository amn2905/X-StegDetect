FROM node:18-alpine as build

WORKDIR /app

# Copy dependency mappings
COPY frontend/package.json .
RUN npm install

# Copy source assets
COPY frontend/ .

# Build Vite application for production distribution
RUN npm run build

# Stage 2: Serve the build directory using a secure, lightweight Nginx container
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
