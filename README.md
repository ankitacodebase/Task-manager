# TaskFlow Enterprise — Full Auth & Task Lifecycle Management

A production-grade, clean, and modern full-stack web application with **Zero Bloat**, focused directly on:
1. **Full Authentication Lifecycle**: Tenant Registration, Admin & Team Member Login (Bcrypt cost 12, HS512 JWT), Forgot Password token generation, Password Reset, and Session Profile (`/me`).
2. **Complete Task Lifecycle**:
   - Admin creates tasks with sequential keys (`TASK-1`, `TASK-2`, ...).
   - Admin assigns tasks to team members (or members self-claim).
   - Members view assigned tasks and move status: `To Do` ➔ `In Progress` ➔ `Completed`.
   - Real-time status filter tabs (`All`, `To Do`, `In Progress`, `Completed`), "Assigned to Me" filter, and instant search.

---

## 🏗 Tech Stack

- **Backend**:
  - Python 3.12+ / FastAPI (`^0.115.0`)
  - MySQL 8.0 / 8.4 LTS via `asyncmy` (Native async connection pool)
  - Cryptography: Bcrypt (cost 12), PyJWT (`HS512` with 64-byte secret)
  - Pydantic v2 DTOs with unified API response envelope (`ApiResponse[T]`, `ErrorResponse`)
  - SlowAPI sliding rate limiting & ContextVar correlation IDs (`X-Correlation-ID`)
- **Frontend**:
  - React 19 (`^19.2.8`)
  - Vite (`^8.3.4`)
  - JavaScript (`.jsx` / `.js`)
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - Lucide React icons

---

## 📁 Clean Feature-Driven Directory Structure

```
e:/pk/task/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings with .env loading
│   │   │   ├── database.py         # asyncmy connection pool & transaction manager
│   │   │   ├── enums.py            # SystemRole, TaskStatus, TaskPriority, ErrorCode
│   │   │   ├── exceptions.py       # AppException taxonomy
│   │   │   ├── rate_limiter.py     # SlowAPI sliding limiter
│   │   │   └── security.py         # Bcrypt cost 12, HS512 JWT encode/decode, token hashing
│   │   ├── middleware/
│   │   │   ├── correlation.py      # X-Correlation-ID ContextVar injection
│   │   │   └── error_handler.py    # Global exception handler & error response envelope
│   │   ├── shared/
│   │   │   ├── dependencies.py     # Database connection injection (get_db)
│   │   │   └── schemas.py          # ApiResponse[T], ErrorResponse
│   │   ├── features/
│   │   │   ├── auth/               # Full Auth Lifecycle (Register, Login, Forgot/Reset, Me)
│   │   │   │   ├── dependencies.py # get_current_user, require_admin
│   │   │   │   ├── repository.py   # User & Tenant MySQL queries
│   │   │   │   ├── router.py       # /api/v1/auth
│   │   │   │   ├── schemas.py      # Register, Login, ForgotPassword DTOs
│   │   │   │   └── service.py      # Account lockout (5 attempts), bcrypt verification
│   │   │   ├── users/              # Team Member Administration
│   │   │   │   ├── repository.py   # Tenant-scoped user queries
│   │   │   │   ├── router.py       # /api/v1/users (GET, POST)
│   │   │   │   └── schemas.py      # User DTOs
│   │   │   └── tasks/              # Core Task Lifecycle
│   │   │       ├── repository.py   # Atomic sequential numbering (TASK-N), status & assignee queries
│   │   │       ├── router.py       # /api/v1/tasks (GET, POST, PATCH /status, PATCH /assign)
│   │   │       └── schemas.py      # Task DTOs
│   │   └── main.py                 # FastAPI Lifespan, CORS, routers
│   ├── init_db.sql                 # Complete 16-table MySQL DDL schema
│   ├── requirements.txt            # Pinned dependencies
│   └── .env                        # Server configuration
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js           # Axios instance with JWT bearer interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx     # User state, login, register, logout, session check
    │   ├── components/
    │   │   ├── Navbar.jsx          # Organization branding, user role badge, action triggers
    │   │   ├── TaskCard.jsx        # Priority, assignee, and To Do ➔ In Progress ➔ Completed lifecycle
    │   │   ├── CreateTaskModal.jsx # New task form with assignee dropdown
    │   │   └── CreateUserModal.jsx # Admin team member provisioning form
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx   # Sign in with quick demo buttons
    │   │   │   ├── RegisterPage.jsx# Register organization & admin
    │   │   │   ├── ForgotPasswordPage.jsx # Recovery token generation
    │   │   │   └── ResetPasswordPage.jsx  # Token & new password confirmation
    │   │   └── DashboardPage.jsx   # Metrics cards, status tabs (ALL/TODO/IN_PROGRESS/DONE), search
    │   ├── App.jsx                 # Auth-gated router view
    │   ├── main.jsx
    │   └── index.css               # Tailwind CSS v4 setup
    └── vite.config.js              # Vite React + Tailwind plugin
```

---

## 🚀 Running the Project

### 1. Backend Server
```powershell
cd backend
# Activate virtual environment
.\.venv\Scripts\Activate.ps1
# Start FastAPI with Uvicorn
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health Check: `http://127.0.0.1:8000/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Application
```powershell
cd frontend
# Start Vite development server
npm run dev
```
- Frontend UI: `http://127.0.0.1:5173/`

---

## 🔑 Demo Accounts (Pre-seeded & Ready to Test)

1. **Admin Account**:
   - Email: `alice@acme.com`
   - Password: `Password123!`
   - Capabilities: Create tasks, assign any user, add team members, update statuses.

2. **Team Member Account**:
   - Email: `bob@acme.com`
   - Password: `NewPassword456!` (or `Password123!`)
   - Capabilities: View assigned tasks, filter tasks, move tasks from `To Do` ➔ `In Progress` ➔ `Completed`.
