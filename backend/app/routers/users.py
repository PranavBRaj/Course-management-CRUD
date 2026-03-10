"""
routers/users.py
- Teacher: search students by username (autocomplete)
- Student: list their own enrolled courses
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/students", response_model=schemas.APIResponse)
def search_students(
    q: Optional[str] = Query(None, description="Search by username"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    """Return students whose username contains the search query (teacher only)."""
    query = db.query(models.User).filter(
        models.User.role == models.RoleEnum.student
    )
    if q and q.strip():
        query = query.filter(models.User.username.ilike(f"%{q.strip()}%"))
    students = query.order_by(models.User.username).limit(20).all()
    return schemas.APIResponse(
        success=True,
        data=[schemas.UserOut.model_validate(s) for s in students],
        message=f"{len(students)} student(s) found",
    )


@router.get("/me/courses", response_model=schemas.APIResponse)
def my_enrolled_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all courses the logged-in student is enrolled in."""
    rows = (
        db.query(models.Enrollment, models.Course)
        .join(models.Course, models.Enrollment.course_id == models.Course.id)
        .filter(models.Enrollment.student_id == current_user.id)
        .order_by(models.Enrollment.enrolled_at.desc())
        .all()
    )
    data = [
        schemas.EnrolledCourseOut(
            enrollment_id=enrollment.id,
            course_id=course.id,
            name=course.name,
            code=course.code,
            credits=course.credits,
            enrolled_at=enrollment.enrolled_at,
        )
        for enrollment, course in rows
    ]
    return schemas.APIResponse(success=True, data=data,
                               message=f"Enrolled in {len(data)} course(s)")
