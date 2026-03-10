"""
routers/enrollments.py
Teacher-only: enroll/remove students from a course
Both roles: list enrolled students / list my courses
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/courses/{course_id}/enrollments",
                   tags=["Enrollments"])


def _get_course_or_404(course_id: int, db: Session) -> models.Course:
    c = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return c


# ── GET enrolled students (teacher sees this per course) ──────────────────────
@router.get("", response_model=schemas.APIResponse)
def list_enrolled_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    _get_course_or_404(course_id, db)

    rows = (
        db.query(models.Enrollment, models.User)
        .join(models.User, models.Enrollment.student_id == models.User.id)
        .filter(models.Enrollment.course_id == course_id)
        .order_by(models.Enrollment.enrolled_at)
        .all()
    )

    data = [
        schemas.EnrolledStudentOut(
            enrollment_id=enrollment.id,
            student_id=user.id,
            username=user.username,
            email=user.email,
            enrolled_at=enrollment.enrolled_at,
        )
        for enrollment, user in rows
    ]
    return schemas.APIResponse(success=True, data=data,
                               message=f"{len(data)} student(s) enrolled")


# ── POST enroll a student by username (teacher only) ─────────────────────────
@router.post("", response_model=schemas.APIResponse,
             status_code=status.HTTP_201_CREATED)
def enroll_student(
    course_id: int,
    payload: schemas.EnrollRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    _get_course_or_404(course_id, db)

    student = (
        db.query(models.User)
        .filter(
            models.User.username == payload.username,
            models.User.role == models.RoleEnum.student,
        )
        .first()
    )
    if not student:
        raise HTTPException(
            status_code=404,
            detail=f"No student with username '{payload.username}' found",
        )

    already = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.course_id == course_id,
            models.Enrollment.student_id == student.id,
        )
        .first()
    )
    if already:
        raise HTTPException(
            status_code=400,
            detail=f"'{payload.username}' is already enrolled in this course",
        )

    enrollment = models.Enrollment(course_id=course_id, student_id=student.id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return schemas.APIResponse(
        success=True,
        data=schemas.EnrolledStudentOut(
            enrollment_id=enrollment.id,
            student_id=student.id,
            username=student.username,
            email=student.email,
            enrolled_at=enrollment.enrolled_at,
        ),
        message=f"'{student.username}' enrolled successfully",
    )


# ── DELETE remove a student from a course (teacher only) ─────────────────────
@router.delete("/{enrollment_id}", response_model=schemas.APIResponse)
def remove_enrollment(
    course_id: int,
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_teacher),
):
    _get_course_or_404(course_id, db)

    enrollment = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.id == enrollment_id,
            models.Enrollment.course_id == course_id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    db.delete(enrollment)
    db.commit()
    return schemas.APIResponse(success=True, data=None,
                               message="Student removed from course")
