# Image Hosting App

A small full-stack image hosting service, built as a **learning project for software
architecture**. Upload an image, get back a shareable public URL.

```
Browser ──> Next.js frontend ──HTTP──> Express backend ──> PostgreSQL (metadata)
                                                       └──> R2 / local disk (bytes)
```

## Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Frontend | Next.js (TypeScript) + Tailwind CSS         |
| Backend  | Node.js + Express (TypeScript)              |
| Storage  | Cloudflare R2 (prod) / local disk (dev)     |
| Database | PostgreSQL + `pg` driver                    |

## Layout

```
image-hosting/
├── frontend/   # Next.js TypeScript app
├── backend/    # Express TypeScript API
├── shared/     # Types shared by both sides (the API contract)
└── docker-compose.yml
```

## Quick start

```bash
# 1. install everything (npm workspaces)
npm install

# 2. start Postgres + MinIO
docker compose up -d

# 3. configure env
cp .env.example backend/.env
cp .env.example frontend/.env.local

# 4. run the migration (see NEXT_STEPS.md for the exact command)

# 5. start both apps
npm run dev:backend     # http://localhost:4000
npm run dev:frontend    # http://localhost:3000
```

## Where to start

This repo is **scaffolded, not implemented**. Every source file contains a header
comment describing its responsibility and a `TODO` describing what to build.

👉 **Read [`NEXT_STEPS.md`](./NEXT_STEPS.md)** — it walks through the build order and
explains *why* the architecture is shaped this way.
