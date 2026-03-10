

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, field_validator



class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str



class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("student", "teacher"):
            raise ValueError("role must be 'student' or 'teacher'")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut



class CourseCreate(BaseModel):
    name: str
    code: str
    credits: int

    @field_validator("credits")
    @classmethod
    def credits_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("credits must be a positive integer")
        return v

    @field_validator("code")
    @classmethod
    def code_uppercase(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("course name cannot be blank")
        return v.strip()


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    credits: Optional[int] = None

    @field_validator("credits", mode="before")
    @classmethod
    def credits_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("credits must be a positive integer")
        return v

    @field_validator("code", mode="before")
    @classmethod
    def code_uppercase(cls, v):
        if v is not None:
            return v.strip().upper()
        return v


class CourseOut(BaseModel):
    id: int
    name: str
    code: str
    credits: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}



class EnrolledStudentOut(BaseModel):
    """A student as shown inside a course's enrollment list."""
    enrollment_id: int
    student_id: int
    username: str
    email: str
    enrolled_at: datetime

    model_config = {"from_attributes": True}


class EnrolledCourseOut(BaseModel):
    """A course as shown inside a student's enrollment list."""
    enrollment_id: int
    course_id: int
    name: str
    code: str
    credits: int
    enrolled_at: datetime

    model_config = {"from_attributes": True}


class EnrollRequest(BaseModel):
    username: str          
