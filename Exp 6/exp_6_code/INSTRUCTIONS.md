# Student Task Manager (Experiment 6 Version) 🎓

This is an advanced Full-Stack mini-project designed for students to understand how modern, scalable web applications work. It specifically covers the core topics of **Experiment 6: Scalable Read APIs with Caching & Optimization**.

## 🌟 What is this project about?
This project is a **Task Manager (To-Do List)** application that demonstrates enterprise-level backend patterns.
- **Frontend (FE):** Built with **React** (using Vite). It features a highly premium "Glassmorphism" UI design with dynamic animations, floating orbs, and a real-time status dashboard. It connects to the backend to Fetch (with Pagination), Add, Toggle, and Delete tasks.
- **Backend (BE):** Built with **Spring Boot** (Java) and an **H2 In-Memory Database**. The backend is structured professionally into Layers (Controller, Service, Repository, Entity). It implements crucial optimizations like **Pagination & Sorting**, **Caching**, **Native SQL queries**, and fixes the **N+1 Problem** using `JOIN FETCH`.

---

## 🚀 How to Run this Project

You will need to run the Backend and the Frontend separately. Open two different terminal windows.

### 1️⃣ Starting the Backend (Spring Boot)
1. Open a terminal.
2. Navigate into the `backend` folder:
   ```bash
   cd exp_6_code/backend
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
4. The backend will start running on **http://localhost:8080**.
   - Note: You can view the raw database at **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:testdb`, Username: `sa`, Password: `<empty>`).

### 2️⃣ Starting the Frontend (React)
1. Open a *new* terminal window.
2. Navigate into the `frontend` folder:
   ```bash
   cd exp_6_code/frontend
   ```
3. Install the required Node dependencies (you only need to do this once):
   ```bash
   npm install
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to the URL shown in the terminal (usually **http://localhost:5173**).

---

## 📚 Topics Covered in this Code:
* **React (Frontend):** 
  * Advanced `useState` and `useEffect` for handling paginated API responses.
  * Premium modern CSS (Glassmorphism, SVG animations, dynamic gradients, Flexbox).
  * Fetch API to connect with backend REST endpoints, handling query parameters (e.g., `?page=0&size=5`).
* **Spring Boot (Backend) [Experiment 6 Core]:**
  * **Pagination & Sorting:** Efficiently retrieving subsets of data using Spring Data's `Pageable`.
  * **Spring Data JPA & H2:** True persistence using Entities mapped to database tables.
  * **Caching:** `@EnableCaching` and `@Cacheable` to prevent unnecessary database hits, and `@CacheEvict` to clear stale data.
  * **N+1 Problem Resolution:** Using a custom JPQL query with `JOIN FETCH` to load related `Comment` entities in a single round-trip.
  * **Native SQL:** Using `@Query(nativeQuery = true)` to execute database-specific raw SQL for complex operations.

Enjoy coding and learning! 🚀
