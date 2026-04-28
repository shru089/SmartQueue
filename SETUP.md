# SmartQueue — Local Setup Guide

> Smart Queue & Crowd Optimization System — PostgreSQL + FastAPI + React (Vite)

---

## Quick Start (Docker — Recommended)

This is the **fastest way** to get everything running. You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# 1. Clone the repo
git clone <repo-url>
cd SmartQueue

# 2. Start PostgreSQL + Backend with one command
docker-compose up --build

# 3. That's it! API is live at:
#    http://localhost:8000
#    http://localhost:8000/docs  (Swagger UI)
```

To stop everything:
```bash
docker-compose down          # Stop containers (data preserved)
docker-compose down -v       # Stop containers AND delete database data
```

---

## Manual Setup (Without Docker)

Use this if you prefer to install PostgreSQL natively on your machine.

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 14+ | See install instructions below |

---

### Step 1 — Install PostgreSQL

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
# Install via Homebrew
brew install postgresql@16
brew services start postgresql@16

# Verify it's running
psql postgres -c "SELECT version();"
```
</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

**Option A — Installer (easiest):**
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the `.exe` installer
3. During setup: set a superuser password, keep port `5432`
4. pgAdmin 4 (GUI) is included automatically

**Option B — winget:**
```powershell
winget install PostgreSQL.PostgreSQL.16
```

After install, open **SQL Shell (psql)** from the Start Menu.
</details>

<details>
<summary><strong>🐧 Linux (Ubuntu/Debian)</strong></summary>

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```
</details>

---

### Step 2 — Create Database & User

Open a PostgreSQL shell and run:

```sql
CREATE USER smartqueue_user WITH PASSWORD 'smartqueue_pass';
CREATE DATABASE smartqueue_db OWNER smartqueue_user;
GRANT ALL PRIVILEGES ON DATABASE smartqueue_db TO smartqueue_user;
```

**How to open the shell:**
- **macOS / Linux:** `psql postgres`
- **Windows:** Open "SQL Shell (psql)" from Start Menu, press Enter through the defaults, enter your superuser password

---

### Step 3 — Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate:
#   macOS/Linux:  source venv/bin/activate
#   Windows:      .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
# Edit .env if your credentials differ from the defaults
```

---

### Step 4 — Start the Backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at:
- **API Root:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

The database tables are created automatically on first startup.

---

### Step 5 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://smartqueue_user:smartqueue_pass@localhost:5432/smartqueue_db` |

See `backend/.env.example` for the template.

---

## Project Structure

```
SmartQueue/
├── backend/
│   ├── database.py          # DB engine & session config
│   ├── models.py            # SQLAlchemy ORM models (5 tables)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── main.py              # FastAPI app entry point
│   ├── routers/
│   │   ├── queue.py         # Queue & token endpoints
│   │   └── admin.py         # Admin endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Container build for backend
│   └── .env.example         # Environment variable template
├── frontend/                # React + Vite + Tailwind
├── docker-compose.yml       # One-command full stack setup
└── SETUP.md                 # ← You are here
```

---

## Troubleshooting

### "Connection refused" when starting backend
- **Docker:** Make sure `docker-compose up` finished and the db container is healthy: `docker ps`
- **Manual:** Make sure PostgreSQL is running:
  - macOS: `brew services list | grep postgresql`
  - Windows: Check "Services" app → look for "postgresql"
  - Linux: `sudo systemctl status postgresql`

### "FATAL: password authentication failed"
- Double-check the credentials in your `.env` match what you used in `CREATE USER`
- On Windows, the default superuser is `postgres`, not your Windows username

### "relation does not exist" errors
- The tables are created automatically on app startup via `Base.metadata.create_all()`
- If you still see this, try restarting the backend

### Port 5432 already in use
- Another PostgreSQL instance may be running. Either stop it or change the port in `.env` and `docker-compose.yml`
