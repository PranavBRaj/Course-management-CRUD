"""
models.py – SQLAlchemy ORM models
"""

from datetime import datetime
import enum

from sqlalchemy import (
    Column, Integer, String, Enum, DateTime, ForeignKey, UniqueConstraint, func
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    student = "student"
    teacher = "teacher"


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username   = Column(String(50),  nullable=False, unique=True, index=True)
    email      = Column(String(100), nullable=False, unique=True, index=True)
    password   = Column(String(255), nullable=False)
    role       = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.student)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(),
                        onupdate=func.now())

    courses = relationship("Course", back_populates="creator",
                           cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="student",
                               cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name       = Column(String(150), nullable=False)
    code       = Column(String(20),  nullable=False, unique=True, index=True)
    credits    = Column(Integer,     nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                        nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(),
                        onupdate=func.now())

    creator     = relationship("User", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course",
                               cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("course_id", "student_id", name="uq_enrollment"),
    )

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id  = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"),
                        nullable=False)
    student_id = Column(Integer, ForeignKey("users.id",   ondelete="CASCADE"),
                        nullable=False)
    enrolled_at = Column(DateTime, nullable=False, server_default=func.now())

    course  = relationship("Course", back_populates="enrollments")
    student = relationship("User",   back_populates="enrollments")
