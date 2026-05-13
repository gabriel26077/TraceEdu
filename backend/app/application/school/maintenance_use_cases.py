from app.domain.school.repositories.school_repository import SchoolRepository
from sqlalchemy.orm import Session
from fastapi import HTTPException

class ArchiveSchoolUseCase:
    def __init__(self, repository: SchoolRepository, db: Session):
        self.repository = repository
        self.db = db

    def execute(self, school_id: str) -> None:
        school = self.repository.get_by_id(school_id)
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        
        from dataclasses import replace
        updated_school = replace(school, status="archived")
        self.repository.save(updated_school)
        self.db.commit()

class ActivateSchoolUseCase:
    def __init__(self, repository: SchoolRepository, db: Session):
        self.repository = repository
        self.db = db

    def execute(self, school_id: str) -> None:
        school = self.repository.get_by_id(school_id)
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        
        from dataclasses import replace
        updated_school = replace(school, status="active")
        self.repository.save(updated_school)
        self.db.commit()

class DeleteSchoolUseCase:
    def __init__(self, repository: SchoolRepository, db: Session):
        self.repository = repository
        self.db = db

    def execute(self, school_id: str) -> None:
        school = self.repository.get_by_id(school_id)
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        
        if school.status != "archived":
            raise HTTPException(status_code=400, detail="Only archived schools can be hard deleted")
        
        # Hard delete from DB: Need to clean up all institutional data first
        from app.infrastructure.database.models import (
            SchoolModel, SchoolMemberModel, SubjectModel, 
            ClassGroupModel, SubjectOfferingModel, EnrollmentModel
        )
        
        # Order matters to avoid FK violations
        self.db.query(EnrollmentModel).filter_by(school_id=school_id).delete()
        self.db.query(SubjectOfferingModel).filter_by(school_id=school_id).delete()
        self.db.query(ClassGroupModel).filter_by(school_id=school_id).delete()
        self.db.query(SubjectModel).filter_by(school_id=school_id).delete()
        self.db.query(SchoolMemberModel).filter_by(school_id=school_id).delete()
        
        # Finally delete the school
        self.db.query(SchoolModel).filter_by(uid=school_id).delete()
        self.db.commit()
