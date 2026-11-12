# Deploying Smart Crop Advisory on Render

The whole app (React frontend + Spring Boot API) is built into **one Docker service**, plus a free PostgreSQL database. You get one URL, with no CORS or API-URL settings to wire up.

## Deploy (about 5 minutes)

1. Go to <https://render.com> and sign in with GitHub.
2. Click **New > Blueprint** and select the `Full-Stack-2-College` repository. Render finds `render.yaml` at the repo root.
3. When asked for `ADMIN_PASSWORD`, type a strong password. `JWT_SECRET` and the database settings are filled in automatically.
4. Click **Apply**. The first build takes several minutes (it builds the frontend, then the backend).
5. Open the service URL, e.g. `https://smart-crop-advisory.onrender.com`.

Log in as `admin@smartcrop.local` with the password you set, or register a farmer account.

## Checks

- `https://<your-url>/` shows the login page.
- `https://<your-url>/api/crops` returns 401 (the API is up and protected).
- Log in, run a recommendation, open a farm plan.

## If the build fails

Open the service's **Logs** tab and copy the error. The backend was written without being compiled in the authoring environment, so the first Maven build is the first real compile; send the log and it can be fixed quickly.

## Notes

- Free web services sleep when idle, so the first request after a pause can take about a minute. Free databases have time and size limits; check Render's current terms.
- Without the `postgres` profile the app uses a file-based H2 database that is wiped on each deploy, which is why the blueprint sets `SPRING_PROFILES_ACTIVE=postgres`.
- Never reuse the development `JWT_SECRET`; the blueprint generates a fresh one.
- Running the two parts separately (backend on Render, frontend on Vercel) still works: use `backend/Dockerfile`, set `VITE_API_URL` on Vercel and `APP_CORS_ALLOWED_ORIGINS` on the backend.
