from sqlalchemy.orm import Session
from app.infrastructure.database.models import (
    UserModel, 
    AccountModel, 
    SchoolMemberModel, 
    EnrollmentModel, 
    ClassGroupModel, 
    SubjectOfferingModel
)
from fastapi import HTTPException, status

class PurgeUserUseCase:
    def __init__(self, db: Session):
        self.db = db

    def execute(self, user_id: str, current_user_id: str) -> None:
        # 1. Prevent self-deletion
        if user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account."
            )

        # 2. Check existence
        user = self.db.query(UserModel).filter_by(uid=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        try:
            # 3. Clean up Class Groups (Student lists)
            # Fetch groups where the user might be present (can be optimized but this is safe)
            all_groups = self.db.query(ClassGroupModel).all()
            for group in all_groups:
                if group.student_ids and user_id in group.student_ids:
                    group.student_ids = [s_id for s_id in group.student_ids if s_id != user_id]
            
            # 4. Clean up Subject Offerings (Teacher lists)
            all_offerings = self.db.query(SubjectOfferingModel).all()
            for offering in all_offerings:
                if offering.teacher_ids and user_id in offering.teacher_ids:
                    offering.teacher_ids = [t_id for t_id in offering.teacher_ids if t_id != user_id]

            # 5. Delete Enrollments (Grades are inside)
            self.db.query(EnrollmentModel).filter_by(student_id=user_id).delete()
            
            # 6. Delete Account
            self.db.query(AccountModel).filter_by(user_id=user_id).delete()
            
            # 7. Delete Memberships
            self.db.query(SchoolMemberModel).filter_by(user_id=user_id).delete()
            
            # 8. Finally delete User profile
            self.db.delete(user)
            
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            # Log the error for better debugging next time
            print(f"CRITICAL ERROR in PurgeUserUseCase: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error purging user data: {str(e)}")
