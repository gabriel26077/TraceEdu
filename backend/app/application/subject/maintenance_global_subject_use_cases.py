from app.domain.subject.repositories.global_subject_repository import GlobalSubjectRepository

class UpdateGlobalSubjectUseCase:
    def __init__(self, repository: GlobalSubjectRepository):
        self.repository = repository

    def execute(self, uid: str, name: str, level: str, grade: str, academic_units: int, category: str = None, description: str = None):
        subject = self.repository.get_by_id(uid)
        if not subject:
            raise Exception("Global subject not found")
            
        subject.name = name
        subject.level = level
        subject.grade = grade
        subject.academic_units = academic_units
        subject.category = category
        subject.description = description
        
        self.repository.save(subject)
        return subject

class DeleteGlobalSubjectUseCase:
    def __init__(self, repository: GlobalSubjectRepository):
        self.repository = repository

    def execute(self, uid: str):
        self.repository.delete(uid)
