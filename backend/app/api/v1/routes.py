from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.sqlalchemy_student_repository import SQLAlchemyStudentRepository
from app.application.student.get_students_use_case import GetStudentsUseCase
from .schemas import StudentResponse, StatsResponse

router = APIRouter()

@router.get("/students", response_model=List[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    repository = SQLAlchemyStudentRepository(db)
    use_case = GetStudentsUseCase(repository)
    return use_case.execute()

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    # Para simplificar agora, vamos contar do repositório
    # Em uma arquitetura DDD real, Stats poderia ser um Domain Service
    repository = SQLAlchemyStudentRepository(db)
    students = repository.get_all()
    
    return {
        "total_students": len(students),
        "active_classes": 42, # Mockado por enquanto
        "pending_grades": 15  # Mockado por enquanto
    }

@router.get("/status")
def get_status():
    return {"status": "ok", "message": "TraceEdu API operating normally with DDD architecture!"}
