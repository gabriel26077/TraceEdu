from sqlalchemy.orm import Session
from app.infrastructure.database.models import UserModel, AccountModel, SchoolMemberModel
from fastapi import HTTPException, status

class DeleteUserUseCase:
    def __init__(self, db: Session):
        self.db = db

    def execute(self, user_id: str, current_user_id: str) -> None:
        # 1. Prevent self-deletion
        if user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own account from the platform administration."
            )

        # 2. Check existence
        user = self.db.query(UserModel).filter_by(uid=user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 3. Delete dependencies first
        # Delete Account
        self.db.query(AccountModel).filter_by(user_id=user_id).delete()
        
        # Delete Memberships
        self.db.query(SchoolMemberModel).filter_by(user_id=user_id).delete()
        
        # Finally delete User
        self.db.delete(user)
        self.db.commit()
