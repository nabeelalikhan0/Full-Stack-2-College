# Deploying Smart Crop Advisory

The frontend is a static site (Vercel) and the backend is a Java service (Render, via Docker) with a PostgreSQL database. Vercel cannot run the Spring Boot backend, so the two are hosted separately.

## 1. Backend + database on Render

1. Sign in at <https://render.com> with GitHub.
2. **New > Blueprint**, pick the `Full-Stack-2-College` repo. Render reads `smart-crop-advisory/render.yaml` if you set the blueprint path to it (or move the file to the repo root).
3. When prompted, enter:
   - `ADMIN_PASSWORD`: a strong password for the seeded admin (`admin@smartcrop.local`).
   - `APP_CORS_ALLOWED_ORIGINS`: leave blank for now; fill it in at step 3.
4. Deploy. When it is live, note the URL, e.g. `https://smart-crop-api.onrender.com`. Check `https://<that-url>/api/reference` returns 401 (the API is up and protected).

Manual alternative: create a PostgreSQL database and a Docker web service with root directory `smart-crop-advisory/backend`, then set `SPRING_PROFILES_ACTIVE=postgres`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (32+ chars), `ADMIN_PASSWORD`.

## 2. Frontend on Vercel

1. Sign in at <https://vercel.com> with GitHub, **Add New > Project**, import `Full-Stack-2-College`.
2. Set **Root Directory** to `smart-crop-advisory/frontend`. Framework preset: Vite.
3. Add environment variable `VITE_API_URL` = `https://<your-backend-url>/api`.
4. Deploy. You get a URL like `https://your-app.vercel.app`.

## 3. Allow the frontend to call the backend (CORS)

In Render, set `APP_CORS_ALLOWED_ORIGINS` = `https://your-app.vercel.app` (comma-separate several origins) and redeploy the backend.

## Notes

- Free tiers sleep when idle, so the first request can take about a minute, and free databases may have time limits. Check each provider's current terms.
- Without the `postgres` profile the backend uses file-based H2, which is wiped on most cloud hosts at each deploy. Use PostgreSQL for anything you want to keep.
- Change the default admin password and never reuse the development `JWT_SECRET`.
