"""
routers/courses.py – Full CRUD for courses
  Teacher: create, read, update, delete
  Student: read-only + search
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/courses", tags=["Courses"])


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _get_course_or_404(course_id: int, db: Session) -> models.Course:
    course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ─── Shared (authenticated) ──────────────────────────────────────────────────
@router.get("", response_model=schemas.APIResponse)
def list_courses(
    search: Optional[str] = Query(None, description="Search by name or code"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all courses (both roles). Optionally filter by name or code."""
    q = db.query(models.Course)
    if search:
        like = f"%{search.strip()}%"
        q = q.filter(
            models.Course.name.ilike(like) | models.Course.code.ilike(like)
        )
    courses = q.order_by(models.Course.created_at.desc()).all()
    return schemas.APIResponse(
        success=True,
        data=[schemas.CourseOut.model_validate(c) for c in courses],
        message=f"{len(courses)} course(s) found",
    )


@router.get("/{course_id}", response_model=schemas.APIResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single course by ID (both roles)."""
    course = _get_course_or_404(course_id, db)
    return schemas.APIResponse(
        success=True,
        data=schemas.CourseOut.model_validate(course),
        message="Course retrieved successfully",
    )


# ─── Teacher-only ─────────────────────────────────────────────────────────────
@router.post("", response_model=schemas.APIResponse,
             status_code=status.HTTP_201_CREATED)
def create_course(
    payload: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    if db.query(models.Course).filter(
            models.Course.code == payload.code).first():
        raise HTTPException(status_code=400,
                            detail=f"Course code '{payload.code}' already exists")
    course = models.Course(
        name=payload.name,
        code=payload.code,
        credits=payload.credits,
        created_by=current_user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return schemas.APIResponse(
        success=True,
        data=schemas.CourseOut.model_validate(course),
        message="Course created successfully",
    )


@router.put("/{course_id}", response_model=schemas.APIResponse)
def update_course(
    course_id: int,
    payload: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    course = _get_course_or_404(course_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    # Unique-code check if code is being changed
    if "code" in update_data and update_data["code"] != course.code:
        if db.query(models.Course).filter(
                models.Course.code == update_data["code"]).first():
            raise HTTPException(
                status_code=400,
                detail=f"Course code '{update_data['code']}' already in use",
            )

    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return schemas.APIResponse(
        success=True,
        data=schemas.CourseOut.model_validate(course),
        message="Course updated successfully",
    )


@router.delete("/{course_id}", response_model=schemas.APIResponse)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    course = _get_course_or_404(course_id, db)
    db.delete(course)
    db.commit()
    return schemas.APIResponse(
        success=True,
        data=None,
        message=f"Course '{course.name}' deleted successfully",
    )
