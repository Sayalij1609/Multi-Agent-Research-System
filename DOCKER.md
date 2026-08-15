# 🐳 Docker Deployment — SYNAPSE AI

SYNAPSE AI is fully containerized using Docker, allowing the complete application stack to be built and run consistently across different environments. The Docker setup packages the FastAPI backend and the production-built React frontend into a single deployable image.

---

## Docker Architecture

```
                         SYNAPSE AI
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Docker Container  │
                  │                     │
                  │   FastAPI Backend   │
                  │        :8000        │
                  │          │          │
                  │    React Frontend   │
                  │    frontend/dist    │
                  │          │          │
                  │    AI Agent System  │
                  │          │          │
                  │ ┌──────────────────┐│
                  │ │ Search │ Reader  ││
                  │ │ Writer │ Critic  ││
                  │ └──────────────────┘│
                  └─────────────────────┘
```

---

## Multi-Stage Build Workflow

The `Dockerfile` uses a **multi-stage build** strategy for an optimized, production-ready image:

```
 ┌────────────────────────────────────────────────────────────┐
 │  Stage 1: frontend-builder (node:20-alpine)               │
 │                                                            │
 │  1. Copy frontend/package*.json                           │
 │  2. npm install                                            │
 │  3. Copy frontend/ source code                            │
 │  4. npm run build  →  Outputs /app/frontend/dist          │
 └────────────────────────────────────────────────────────────┘
                              │
                   Static assets (dist/)
                              │
                              ▼
 ┌────────────────────────────────────────────────────────────┐
 │  Stage 2: runner (python:3.11-slim)                       │
 │                                                            │
 │  1. Install system deps (build-essential, curl)           │
 │  2. pip install -r requirements.txt                       │
 │  3. Copy backend .py files (app, agents, pipeline, tools) │
 │  4. COPY --from=frontend-builder /app/frontend/dist       │
 │  5. EXPOSE 8000                                            │
 │  6. CMD uvicorn app:app --host 0.0.0.0 --port 8000       │
 └────────────────────────────────────────────────────────────┘
```

### Why Multi-Stage?

| Benefit | Details |
|---|---|
| **Smaller Image** | Node.js toolchain (~400 MB) is discarded after the build; only the static `dist/` output is kept. |
| **Security** | No `node_modules`, npm cache, or build tools ship in the production image. |
| **Reproducibility** | Frontend is always built from source — no need to commit `dist/` to Git. |

---

## Quick Start

### 1. Build the Image

```bash
docker build -t synapse-ai .
```

### 2. Run the Container

```bash
docker run -d \
  --name synapse-ai \
  -p 8000:8000 \
  -e GROQ_API_KEY=your_groq_api_key_here \
  synapse-ai
```

### 3. Access the Application

Open your browser at **[http://localhost:8000](http://localhost:8000)**.

> The FastAPI backend serves both the API (`/run`, `/history`, `/download-pdf`, `/download-docx`) and the React SPA static files from the same `:8000` port.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | API key for Groq LLM inference (used by agent pipeline). |
| `PORT` | ❌ No | Override the default port (8000). Cloud platforms like Render set this automatically. |

Pass environment variables at runtime:

```bash
# Using -e flags
docker run -d -p 8000:8000 -e GROQ_API_KEY=gsk_... synapse-ai

# Using an .env file
docker run -d -p 8000:8000 --env-file .env synapse-ai
```

---

## Docker Compose (Optional)

For convenience, you can create a `docker-compose.yml`:

```yaml
version: "3.9"

services:
  synapse-ai:
    build: .
    container_name: synapse-ai
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d --build
```

---

## Deploying to Cloud Platforms

### Render

Render auto-detects the `Dockerfile` and builds the image in the cloud.

1. Connect your GitHub repository on [Render Dashboard](https://dashboard.render.com).
2. Create a **Web Service** → select **Docker** as the environment.
3. Set `GROQ_API_KEY` in the Environment tab.
4. Deploy — Render builds the image and serves it.

### Railway

```bash
railway init
railway up
```

Railway also auto-detects `Dockerfile` and deploys.

### Fly.io

```bash
fly launch
fly deploy
```

---

## File Reference

| File | Purpose |
|---|---|
| [`Dockerfile`](Dockerfile) | Multi-stage build definition (Node.js builder + Python runner). |
| [`.dockerignore`](.dockerignore) | Excludes `.venv`, `node_modules`, `.git`, `.env`, and other non-essential files from the build context. |
| [`Procfile`](Procfile) | Used by Render/Heroku for process start command. |
| [`render.yaml`](render.yaml) | Render Blueprint for automated infrastructure-as-code deployments. |

---

## Useful Commands

```bash
# Build with no cache (fresh build)
docker build --no-cache -t synapse-ai .

# View running containers
docker ps

# View container logs
docker logs -f synapse-ai

# Stop the container
docker stop synapse-ai

# Remove the container
docker rm synapse-ai

# Remove the image
docker rmi synapse-ai
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `npm run build` fails in Stage 1 | Ensure `frontend/package.json` has a valid `build` script and all dependencies are listed. |
| Port conflict on `:8000` | Map to a different host port: `docker run -p 3000:8000 synapse-ai`. |
| API key not found | Verify `GROQ_API_KEY` is passed via `-e` flag or `--env-file`. |
| Container exits immediately | Check logs with `docker logs synapse-ai` for Python startup errors. |
| Large image size | The multi-stage build keeps it lean (~500 MB). Run `docker image ls` to verify. |

---

## License

This project is licensed under the [MIT License](LICENSE).
