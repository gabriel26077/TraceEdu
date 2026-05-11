from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.database.session import get_db
from app.infrastructure.persistence.postgresql.user_repository import SQLAlchemyUserRepository
from app.application.user.register_user_use_case import RegisterUserUseCase, RegisterUserInput
from app.application.user.list_users_use_case import ListUsersUseCase
from .schemas import UserCreate, UserResponse

router = APIRouter()

@router.post("/users", response_model=UserResponse, status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemyUserRepository(db)
        use_case = RegisterUserUseCase(repository)
        
        use_case_input = RegisterUserInput(
            name=user_data.name,
            roles=user_data.roles,
            email=user_data.email,
            cpf=user_data.cpf
        )
        
        return use_case.execute(use_case_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    try:
        repository = SQLAlchemyUserRepository(db)
        use_case = ListUsersUseCase(repository)
        return use_case.execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_status():
    return {"status": "ok", "message": "TraceEdu API operating normally with Hexagonal Architecture!"}
