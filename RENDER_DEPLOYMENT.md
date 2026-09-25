# Render deployment configuration

This repository is arranged to match the existing Render services.

## Frontend (`wgc-frontend`)
- Service type: Static Site
- Repository root: repository root
- Build command: `npm install && npm run build` (or `npm ci && npm run build`)
- Publish directory: `dist`
- Environment: `VITE_API_URL=https://wgc-backend.onrender.com/api/v1` (retain the production value unless intentionally migrating the API hostname)

## Backend (`wgc-backend`)
- Service type: Web Service
- Root Directory: `server`
- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/api/v1`

The `server/` directory now contains the updated NestJS backend that was previously in the separate wgc-backend repository. The obsolete Express/SQLite backend formerly under `server/` has been replaced rather than kept alongside it, so the existing Render backend service will execute the updated code.

## Important
The updated backend requires its production environment variables (PostgreSQL, Redis, JWT, Cloudinary, mail, Google/YouTube/notification settings as applicable). Copy the values from the working backend environment; do not commit secrets.

The API root is `/api/v1`. Swagger is exposed at `/api/v1/docs`.
