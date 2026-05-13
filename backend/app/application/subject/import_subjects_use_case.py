import uuid
from typing import List
from app.domain.subject.repositories.global_subject_repository import GlobalSubjectRepository
from app.domain.subject.repositories.subject_repository import SubjectRepository
from app.domain.subject.entities.subject import Subject

class ImportSubjectsUseCase:
    def __init__(self, global_repo: GlobalSubjectRepository, subject_repo: SubjectRepository):
        self.global_repo = global_repo
        self.subject_repo = subject_repo

    def execute(self, school_id: str, global_subject_ids: List[str]) -> List[Subject]:
        imported_subjects = []
        for gs_id in global_subject_ids:
            gs = self.global_repo.get_by_id(gs_id)
            if not gs:
                continue
            
            # Create a new school-specific subject based on the global template
            new_subject = Subject(
                uid=str(uuid.uuid4()),
                school_id=school_id,
                name=gs.name,
                level=gs.level,
                grade=gs.grade,
                academic_units=gs.academic_units,
                offering_type="regular", 
                description=gs.description,
                template_id=gs.uid
            )
            
            self.subject_repo.save(new_subject)
            imported_subjects.append(new_subject)
            
        return imported_subjects
