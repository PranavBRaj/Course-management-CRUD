"""
routers/auth.py – Registration & Login
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=schemas.APIResponse,
             status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    try:
        if db.query(models.User).filter(
                models.User.username == payload.username).first():
            raise HTTPException(status_code=400,
                                detail="Username already taken")
        if db.query(models.User).filter(
                models.User.email == payload.email).first():
            raise HTTPException(status_code=400,
                            detail="Email already registered")

        user = models.User(
            username=payload.username,
            email=payload.email,
            password=hash_password(payload.password),
            role=payload.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return schemas.APIResponse(
            success=True,
            data=schemas.UserOut.model_validate(user),
            message="User registered successfully",
        )

    except HTTPException:
        # re-raise HTTPExceptions (validation/duplicate checks)
        raise
    except Exception as exc:
        # Rollback in case of DB error and provide a helpful message
        try:
            db.rollback()
        except Exception:
            pass
        # Log the error to stdout for server logs and return 500
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/login", response_model=schemas.APIResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.username == payload.username
    ).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401,
                            detail="Invalid username or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return schemas.APIResponse(
        success=True,
        data=schemas.Token(
            access_token=token,
            user=schemas.UserOut.model_validate(user),
        ),
        message="Login successful",
    )
