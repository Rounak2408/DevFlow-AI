# DevFlow

Developer productivity and team collaboration — projects, Kanban, realtime chat, GitHub activity, analytics, and an OpenAI-backed assistant with Redis queues and caching.

## Stack

- **Client:** React (Vite), Tailwind CSS, Framer Motion, Zustand, Recharts, `@dnd-kit`, Socket.io client  
- **Server:** Node.js, Express, MongoDB (Mongoose), Socket.io, Redis (`ioredis`), Bull (queues), OpenAI, Octokit  
- **Ops:** Docker Compose (MongoDB + Redis + API), sample production Dockerfile for the API

## Prerequisites

- Node.js 20+  
- npm  
- MongoDB and Redis running locally **or** Docker Compose

## Quick start

1. **Clone and install**

   ```bash
   cd Devflow
   npm install
   npm run install:all
   ```

2. **Environment**

   Copy `.env.example` to `.env` in the **repository root** (server reads from cwd when you run `npm run dev --prefix server`). For local dev, the simplest approach:

   ```bash
   cp .env.example .env
   ```

   Edit `JWT_SECRET`, and add `OPENAI_API_KEY` if you want AI features.

3. **Start databases (Docker)**

   ```bash
   docker compose up -d mongo redis
   ```

4. **Run app**

   ```bash
   npm run dev
   ```

   - Frontend: [http://localhost:5173](http://localhost:5173)  
   - API + WebSocket: [http://localhost:4000](http://localhost:4000)

5. **Register** a user from the UI, create a project, optionally set **GitHub repo** as `owner/repo`, connect a **GitHub PAT** under Settings, then open the workspace.

## Production build

```bash
npm run build --prefix client
NODE_ENV=production npm run start --prefix server
```

Serve the `client/dist` static files with nginx or a CDN, and set `CLIENT_URL`, `VITE_API_URL`, and `VITE_SOCKET_URL` appropriately.

### Render (Static Site — frontend)

Repo root is **not** the Vite app: `npm install` at the root only installs the meta-package (~1 dependency), so **`vite` never installs** unless you install inside `client/`.

**Option A — recommended:** In Render, set **Root Directory** to `client`, **Build Command** to `npm install && npm run build`, **Publish Directory** to `dist`.

**Option B:** Leave root at `.` and set **Build Command** to:

```bash
npm run build:render
```

(`build:render` runs `npm install --prefix client` then `vite build`.)

## Docker (API + databases)

```bash
export JWT_SECRET=$(openssl rand -hex 32)
docker compose up --build
```

The bundled `Dockerfile.server` runs only the API; run the client separately or add your own static hosting.

---

## API documentation

Base URL: `/api`  
Auth: `Authorization: Bearer <JWT>` (except register/login/health).

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness |

### Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{ email, password, name }` | Create user (JWT returned) |
| POST | `/api/auth/login` | `{ email, password }` | Login |
| GET | `/api/auth/me` | — | Current user |
| PATCH | `/api/auth/me` | `{ name?, avatar? }` | Update profile |

**Roles:** `globalRole` on user is `admin` \| `member` (platform-wide). Project roles are separate (`admin` \| `member` per project).

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List projects for current user |
| POST | `/api/projects` | Create (`name`, optional `description`, `githubRepo`) |
| POST | `/api/projects/invite/accept` | Accept invite (`token`) |
| GET | `/api/projects/:id` | Project detail + members |
| PATCH | `/api/projects/:id` | Update (project **admin**) |
| POST | `/api/projects/:id/invite` | Invite by email (`email`, optional `role`) |
| PATCH | `/api/projects/:id/members/:userId/role` | Change member role (project **admin**) |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create (`title`, optional `description`, `status`, `priority`, `assignee`, `dueDate`) |
| PATCH | `/api/projects/:id/tasks/:taskId` | Update fields |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete |

**Status:** `todo` \| `in_progress` \| `review` \| `done`  
**Priority:** `low` \| `medium` \| `high` \| `urgent`

### Messages (REST; realtime via Socket.io)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/messages?limit=50` | Recent messages |
| POST | `/api/projects/:id/messages` | `{ content }` |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/analytics` | Task stats + 7-day trend (Redis-cached) |

### GitHub (user)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/github/connect` | `{ accessToken }` | Store PAT for Octokit |
| POST | `/api/github/disconnect` | — | Clear token |

### GitHub (project)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/github/activity` | Commits + contributors for `githubRepo` (`owner/repo`) |

### AI (queued + cached)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/ai/task-breakdown` | `{ text }` | JSON task suggestions via Bull + Redis cache |
| POST | `/api/ai/bug-suggest` | `{ text }` | Debugging hints |

### Socket.io events

Connect with `auth: { token: "<JWT>" }` (or `Authorization` header).

| Event | Payload | Description |
|-------|---------|-------------|
| `project:join` | `projectId` | Join room `project:<id>` |
| `project:leave` | `projectId` | Leave room |
| `chat:message` | `{ projectId, content }` | Broadcast saved message |
| `chat:typing` | `{ projectId, isTyping }` | Typing indicator |

**Server → client:** `chat:message`, `chat:typing`

### Rate limits

- Global API: 300 req / 15 min per IP  
- Auth routes: 30 / 15 min  
- AI routes: 10 / min (plus JWT required)

---

## Folder structure

```
client/
  src/
    components/   layout, ui
    pages/
    hooks/
    store/
    lib/
server/
  src/
    config/
    controllers/
    routes/
    models/
    middlewares/
    services/
    socket/
    utils/
```

## Notes

- **GitHub:** Connect a PAT under Settings with `repo` read scope. Set each project’s `githubRepo` to `owner/repo` (via API `PATCH /api/projects/:id` or by recreating the project with the field).  
- **Platform admin:** Set `globalRole: 'admin'` on a user in MongoDB if you need future platform-only routes guarded by `requireAdmin`.  
- **Security:** Use strong `JWT_SECRET`, HTTPS in production, and never commit `.env`.
