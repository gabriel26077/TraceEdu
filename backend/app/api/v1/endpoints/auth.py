from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database.session import get_db
from app.infrastructure.security.auth_service import AuthService
from app.application.auth.login_use_case import LoginUseCase, LoginInput, LoginOutput
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=LoginOutput)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    use_case = LoginUseCase(db, AuthService())
    result = use_case.execute(LoginInput(username=request.username, password=request.password))
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result
