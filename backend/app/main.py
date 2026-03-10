"""
main.py – FastAPI application entry point
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.database import engine, Base
from app.routers import auth, courses, enrollments, users

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Course Management System API",
    description="""
## Course Management System

A role-based REST API for managing courses.

### Roles
| Role    | Permissions |
|---------|-------------|
| **Teacher** | Create, Read, Update, Delete courses |
| **Student** | Read & Search courses only |

### Authentication
1. Register via `POST /api/auth/register`
2. Login via `POST /api/auth/login` — copy the `access_token` from the response
3. Click **Authorize** (🔒) at the top of this page, paste the token and click **Authorize**
4. All protected endpoints will now include your token automatically
""",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "persistAuthorization": True,       
        "displayRequestDuration": True,     
        "filter": True,                     
        "syntaxHighlight.theme": "monokai",
    },
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    schema.setdefault("components", {}).setdefault("securitySchemes", {})
    schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Paste the JWT token obtained from **POST /api/auth/login**",
    }

    for path_item in schema.get("paths", {}).values():
        for operation in path_item.values():
            if isinstance(operation, dict):
                operation.setdefault("security", [{"BearerAuth": []}])

    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi


allowed_origins: list[str] = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Course Management API is running"}



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("APP_HOST", "0.0.0.0"),
        port=int(os.getenv("APP_PORT", "8000")),
        reload=True,
    )
