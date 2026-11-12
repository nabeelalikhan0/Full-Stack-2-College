# Smart Crop Advisory & Resource Planner

AI-assisted rural crop planning, irrigation and resource management system — a full-stack web application built with **React 18** and **Spring Boot 3**.

A farmer enters farm conditions (location, soil, pH, water, season, previous crop, climate). The system ranks crops with an **explainable weighted scoring engine**, then expands any chosen crop into a complete **farm plan**: stage-wise irrigation schedule, crop-rotation advice, and an estimate of seed, fertilizer, labour, water, cost and yield.

> Course project — Full Stack Development-II (FSD-II), B.Tech CSE (AI & ML), Chandigarh University.
> Based on the project synopsis *Smart Crop Advisory & Resource Planner*.

## Features

- **Authentication & roles** — JWT login/registration, BCrypt password hashing, `FARMER` and `ADMIN` roles, protected APIs and routes.
- **Recommendation wizard** — 3-step form; picking a district pre-fills typical soil, temperature and rainfall.
- **Explainable scoring** — 7 weighted factors (soil 25 %, season 20 %, water 20 %, pH 10 %, rotation 10 %, temperature 10 %, rainfall 5 %), each with a plain-language reason, warnings, suitability label and risk level.
- **Crop comparison** — side-by-side table for up to 3 crops.
- **Irrigation planner** — stage-wise schedule, irrigation-method efficiency, effective rainfall, water surplus/deficit, critical-stage warnings.
- **Crop-rotation planner** — predecessor compatibility, nitrogen fixation, category diversity, 3-season suggested sequence.
- **Resource planner** — seed, urea/DAP/MOP, labour days, water volume, total cost, expected yield, cost per quintal.
- **History** — every recommendation is stored and can be re-opened with its farm plans.
- **Admin dashboard** — usage statistics & charts, crop add/edit/delete, live-editable scoring weights.
- **Caching & background job** — Spring Cache for crops, weights and stats; hourly statistics refresh job.
- **Zero-setup database** — file-based H2 by default, PostgreSQL via the `postgres` profile.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 4, React Router 6, Recharts, Lucide React, Axios |
| Backend | Java 17, Spring Boot 3.3, Spring Web, Spring Security, Spring Data JPA, Bean Validation, Spring Cache |
| Auth | JWT (jjwt 0.12), BCrypt |
| Database | H2 (default, file-based) / PostgreSQL (profile `postgres`) |
| Testing | JUnit 5, Mockito, Spring Boot Test |

## Quick start

Prerequisites: **JDK 17+**, **Maven 3.9+**, **Node.js 18+**.

```bash
# 1. Backend  (http://localhost:8080)
cd smart-crop-advisory/backend
mvn spring-boot:run

# 2. Frontend (http://localhost:5173)  — in a second terminal
cd smart-crop-advisory/frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

| Account | Email | Password |
|---------|-------|----------|
| Admin (seeded on first start) | `admin@smartcrop.local` | `Admin@123` |
| Farmer | register from the UI | — |

Change the admin credentials and `JWT_SECRET` for any real deployment (see `docs/DOCUMENTATION.md`).

## Project structure

```
smart-crop-advisory/
├── backend/                      Spring Boot application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/smartcrop/
│       │   ├── config/               properties, data seeder
│       │   ├── security/             JWT service, filter, security config
│       │   ├── model/                JPA entities + enums
│       │   ├── repository/           Spring Data repositories
│       │   ├── dto/                  request / response records
│       │   ├── service/              scoring, irrigation, rotation, resources, ...
│       │   ├── controller/           REST controllers
│       │   └── exception/            error handling
│       └── resources/
│           ├── application.yml
│           └── data/crops.json   14-crop seed dataset
├── frontend/                     React + Vite application
│   └── src/{pages,components,context}
└── docs/DOCUMENTATION.md        full project documentation
```

## Documentation

See **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)** for architecture, data model, the scoring formulas with a worked example, the full REST API reference, configuration, testing, deployment, limitations and future scope.

## Disclaimer

Crop parameters, input prices and regional figures are **sample data** for an academic project. They must be validated by agricultural experts before any real-world use.
