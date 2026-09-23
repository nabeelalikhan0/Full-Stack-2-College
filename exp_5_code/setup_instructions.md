# Post Composer Mini-Project Setup Guide

This guide will walk you through the process of setting up and running the Post Composer mini-project, which consists of a React frontend and a Spring Boot backend.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Java 17** (or higher)
- **Node.js** (v14 or higher) and **npm**

## 1. Running the Backend (Spring Boot)

The backend is built with Spring Boot and uses an in-memory H2 database, which means you don't need to install or configure any external database like MySQL.

1. Open a terminal.
2. Navigate to the `backend` directory inside the project folder:
   ```bash
   cd exp_5_code/backend
   ```
3. Run the application using the included Gradle wrapper:
   - On **Mac/Linux**:
     ```bash
     ./gradlew bootRun
     ```
   - On **Windows**:
     ```cmd
     gradlew.bat bootRun
     ```
4. The backend server will start on `http://localhost:8080`. Keep this terminal window open.

## 2. Running the Frontend (React)

The frontend is built with React and Vite.

1. Open a **new** terminal window (leave the backend terminal running).
2. Navigate to the `frontend` directory:
   ```bash
   cd exp_5_code/frontend
   ```
3. Install the required Node dependencies (you only need to do this once):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. The frontend application will be available at `http://localhost:5173`. Open this URL in your web browser.

## Testing the Application

Once both servers are running:
1. Go to `http://localhost:5173`.
2. You will see the Post Composer interface.
3. Select a platform (Twitter, Instagram, or Facebook).
4. Start typing your post. Notice the word count updating at the bottom.
5. If you exceed the word limit for the selected platform, a red global error banner will appear at the top, and you won't be able to add more words.
6. Click **Post** to save your message. It will appear in the "Recent Posts" list below, where you can easily edit or delete it.

## Troubleshooting

- **Port in use**: If port 8080 or 5173 is already in use by another application, you will need to stop that application first.
- **Dependencies not found**: Ensure you ran `npm install` in the frontend directory before running `npm run dev`.
