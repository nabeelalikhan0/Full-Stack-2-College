# Root-level Dockerfile so Render can build with its default settings (context = repo root).
# Serves the React app and the Spring Boot API from one image.

# ---- 1. build the React frontend ----
FROM node:20-alpine AS web
WORKDIR /web
COPY smart-crop-advisory/frontend/package.json ./
RUN npm install
COPY smart-crop-advisory/frontend/ ./
RUN npm run build

# ---- 2. build the Spring Boot jar with the frontend bundled in ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY smart-crop-advisory/backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY smart-crop-advisory/backend/src ./src
COPY --from=web /web/dist ./src/main/resources/static
RUN mvn -q -B clean package -DskipTests

# ---- 3. run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/smart-crop-advisory-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx350m", "-jar", "app.jar"]
