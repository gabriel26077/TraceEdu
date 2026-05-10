from typing import List
from app.domain.student.entity import Student
from app.domain.student.repository_interface import IStudentRepository

class GetStudentsUseCase:
    def __init__(self, repository: IStudentRepository):
        self.repository = repository

    def execute(self) -> List[Student]:
        # Aqui você poderia adicionar lógica de negócio complexa se necessário
        return self.repository.get_all()
