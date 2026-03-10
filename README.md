# Course Management System

A full-stack role-based Course Management System built with **React + Vite**, **Python FastAPI**, and **MySQL**.

---

## Project Structure

```
CRUD-PRANAV/
├── database/
│   └── schema.sql          ← MySQL schema + seed data
├── backend/                ← FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── courses.py
│   │   └── utils/
│   │       └── auth.py
│   ├── .env
│   └── requirements.txt
└── frontend/               ← React + Vite application
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── TeacherDashboard.jsx
    │   │   └── StudentDashboard.jsx
    │   └── components/
    │       ├── Navbar.jsx
    │       └── CourseFormModal.jsx
    ├── .env
    └── package.json
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 1 – Database Setup

```sql
-- Run in MySQL Workbench or CLI
source database/schema.sql
```

---

## 2 – Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set your MySQL credentials:
#   DB_PASSWORD=your_mysql_password
#   DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/course_management
#   SECRET_KEY=change_to_a_random_32_char_string

# Run the server
python -m app.main
```

API docs available at: **http://localhost:8000/docs**

---

## 3 – Frontend Setup

```powershell
cd frontend

npm install
npm run dev
```

App available at: **http://localhost:5173**

---

## 4 – Environment Variables

### backend/.env
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full SQLAlchemy MySQL connection string |
| `SECRET_KEY` | JWT signing key (min 32 chars, keep secret) |
| `ALGORITHM` | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default: `60`) |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) |

### frontend/.env
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend base URL (default: `http://localhost:8000`) |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Courses (all require `Authorization: Bearer <token>`)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | Both | List all (optional `?search=`) |
| GET | `/api/courses/{id}` | Both | Get course by ID |
| POST | `/api/courses` | Teacher | Create course |
| PUT | `/api/courses/{id}` | Teacher | Update course |
| DELETE | `/api/courses/{id}` | Teacher | Delete course |

---

## Seed Credentials

| Role | Username | Password |
|------|----------|----------|
| Teacher | `teacher_john` | `password123` |
| Student | `student_jane` | `password123` |
