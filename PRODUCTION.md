Production checklist — NairaIQ

1) Supabase setup
- Create a Supabase project and Postgres DB.
- In Supabase > Storage, create a bucket named `avatars` and set it to private.
- Copy the project URL (e.g. `https://<project>.supabase.co`), the anon key and the service role key.
  - Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-only).

2) Environment variables
- Backend (.env or host env):
  - `DATABASE_URL` = Supabase Postgres DSN. Example: `postgresql+asyncpg://<user>:<pass>@<host>:5432/<db>`
  - `SECRET_KEY` = generate a secure random string (`python -c "import secrets; print(secrets.token_urlsafe(64))"`).
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (service role used only on server).
  - `SUPABASE_AVATAR_BUCKET` = `avatars` (default)
- Frontend (Vercel env / dev):
  - `VITE_API_BASE_URL` = https://api.yourdomain.com (backend public URL)

3) Install & run migrations
- Install dependencies: `pip install -r requirements.txt`.
- Run alembic migrations against the production DB: `alembic upgrade head`.
  - Note: Alembic auto-converts `postgresql+asyncpg` to a sync driver for migrations.

4) Avatar upload security (already implemented)
- Server-side will:
  - Accept only `image/png`, `image/jpeg`, `image/webp`.
  - Limit size to 5 MB.
  - Verify image integrity with Pillow and re-encode to WebP.
  - Resize to max dimension 1024px.
  - Upload to Supabase Storage using service role key and save the public URL on the user record.
- Ensure bucket is private if you prefer pre-signed URLs only. Currently uploaded objects are saved to the `public` path; change implementation if you want signed URLs.

5) Backend hosting recommendations
- Choose a host that supports ASGI apps (FastAPI + Uvicorn): Render, Railway, Fly, or a small VPS. Example quick options:
  - Render (free/cheap): set `pip install -r requirements.txt`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
  - Railway: similar setup, provide `DATABASE_URL` and secrets.
  - Fly: build a small image and deploy with `flyctl`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `SECRET_KEY` as protected secrets in the host.

6) Frontend (Vercel)
- Connect the `nairaiq_frontend` folder to Vercel.
- Set `VITE_API_BASE_URL` env var on Vercel.
- Build command: `npm run build`. Framework: Vite.
- Ensure CORS on the backend allows only your frontend origin(s).

7) CORS & security
- In production, restrict allowed origins to your frontend host(s).
- Use HTTPS everywhere.
- Rotate `SECRET_KEY` and Supabase service role key if leaked.
- Limit request sizes and apply rate limiting (at host or reverse-proxy level).

8) Testing after deploy
- Run `scripts/test_onboarding_flow.py` and `scripts/test_profile_update.py` against the production API to sanity-check end-to-end flows.
- Test avatar upload via the frontend and confirm avatar appears in the user's profile.

9) Helpful commands
- Generate SECRET_KEY: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
- Run dev backend: `uvicorn app.main:app --reload --port 8000`
- Run migrations locally: `DATABASE_URL=<dsn> alembic upgrade head`

If you'd like, I can:
- Run `alembic upgrade head` here if you provide the Supabase `DATABASE_URL`.
- Add a small `Dockerfile` and `render.yaml` for Render deployment.
- Change uploads to create signed URLs instead of placing files in public path.
