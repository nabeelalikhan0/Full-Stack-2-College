# Unit 3 - Experiment 8: Kafka-Based Event-Driven Publishing Pipeline

## Overview
This experiment demonstrates how to build an **Event-Driven Architecture (EDA)** using **Apache Kafka** (in KRaft mode) and **Spring Boot**. The pipeline processes scheduled posts asynchronously and ensures system reliability through:
- **Scheduler**: Automates delayed execution of posts.
- **Retry Mechanism**: Handles transient failures.
- **Dead Letter Queue (DLQ)**: Captures failed messages that exceed retries.
- **Idempotency**: Prevents processing the same event multiple times.

## Prerequisites
- Docker & Docker Compose
- Java 17
- Maven
- Node.js (for the frontend)

## Instructions

### 1. Start Kafka (KRaft Mode)
We use Docker to run Kafka without Zookeeper.
1. Navigate to the `exp_8_code` directory.
2. Run the following command to start Kafka:
   ```bash
   docker-compose up -d
   ```
   *This starts a Kafka broker locally on port 9092.*

### 2. Start the Spring Boot Backend
1. Open a terminal and navigate to `exp_8_code/backend`.
2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(Or run it from your IDE)*. The backend will start on port `8080`.

### 3. Start the React Frontend
1. Open a new terminal and navigate to `exp_8_code/frontend`.
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (usually `http://localhost:5173`) in your browser.

## How to Test the Pipeline
1. In the frontend dashboard, create a new post and set the **Schedule Time**.
2. Click **Schedule Post**. The post will appear as `PENDING`.
3. Wait for the scheduled time to pass.
4. Watch the backend logs. The `PostSchedulerService` will pick up the due post and publish an event to the `post-topic`.
5. The `KafkaConsumerService` will consume the event, process it (with a simulated 20% failure rate to demonstrate error handling), and update the status to `PUBLISHED` (or `FAILED` if sent to the DLQ).
6. The frontend will automatically poll and reflect these status changes.

## Clean Up
To stop Kafka and remove the container:
```bash
docker-compose down
```
