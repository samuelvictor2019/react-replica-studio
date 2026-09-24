# Render deployment — integrated frontend + backend

This repository keeps the React/Vite frontend unchanged and adds the current `wgc-backend` NestJS project under `backend/`. The original `server/` folder is retained for reference/compatibility, but the Render Blueprint deploys `backend/` as the production API.

## Services

- `wgc` — static React/Vite frontend.
- `wgc-backend` — NestJS API, served under `/api/v1`.

The frontend continues to use `https://wgc-backend.onrender.com/api/v1`, matching the API URL already present in the supplied frontend project.

## Deploy

1. Push the contents of this folder to the Git repository connected to Render.
2. In Render, use the repository's `render.yaml` Blueprint (or update the existing services to use the same commands/settings).
3. Copy the environment-variable values from the currently working `wgc-backend` Render service into the integrated `wgc-backend` service. Variables marked `sync: false` in `render.yaml` intentionally do not contain secrets.
4. Deploy the backend first and verify `/api/v1` responds.
5. Deploy/redeploy the frontend.

## Backend commands

- Root directory: `backend`
- Build: `npm ci && npm run build`
- Start: `npm run start:prod`

## Frontend commands

- Root directory: repository root
- Build: `npm ci && npm run build`
- Publish directory: `dist`

## Important

Do not commit production secrets. `backend/.env.example` lists the backend variables that must be configured in Render. The frontend's `VITE_API_URL` is a public build-time value, not a secret.
