# ==============================================================================
# Experiment 9: Assignment 4 - Dockerize Application
# Multi-stage Dockerfile: Builds & Packages the Spring Boot App into a Container
# ==============================================================================

# Stage 1: Build stage with JDK and Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build executable jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-root application user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy application artifact from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose standard Spring Boot port
EXPOSE 8080

# Health check to ensure container is responsive
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Execute the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

