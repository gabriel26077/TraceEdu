from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.user.entities.user import User
from app.domain.user.repositories.user_repository import UserRepository
from app.infrastructure.database.models import UserModel

class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, user: User) -> None:
        model = self.session.query(UserModel).filter_by(uid=user.uid).first()
        if not model:
            model = UserModel(uid=user.uid)
        
        model.name = user.name
        model.email = str(user.email) if user.email else None
        model.cpf = str(user.cpf) if user.cpf else None
        model.birthdate = user.birthdate
        model.global_roles = [str(r) for r in user.roles]
        model.status = user.status
        
        self.session.add(model)
        self.session.flush()

    def get_by_id(self, uid: str) -> Optional[User]:
        model = self.session.query(UserModel).filter_by(uid=uid).first()
        return self._to_entity(model) if model else None

    def get_by_cpf(self, cpf: str) -> Optional[User]:
        model = self.session.query(UserModel).filter_by(cpf=cpf).first()
        return self._to_entity(model) if model else None

    def get_by_email(self, email: str) -> Optional[User]:
        model = self.session.query(UserModel).filter_by(email=email).first()
        return self._to_entity(model) if model else None

    def list_by_school(self, school_id: str) -> List[User]:
        from app.infrastructure.database.models import SchoolMemberModel
        results = self.session.query(UserModel, SchoolMemberModel).join(
            SchoolMemberModel, UserModel.uid == SchoolMemberModel.user_id
        ).filter(SchoolMemberModel.school_id == school_id).all()
        
        users = []
        for user_model, member_model in results:
            user = self._to_entity(user_model)
            # Roles in school context
            from app.domain.user.value_objects.user_role import UserRole
            user.roles = [UserRole(r) for r in (member_model.roles or [])]
            users.append(user)
        return users

    def _to_entity(self, model: UserModel) -> User:
        from app.domain.user.value_objects.cpf import CPF
        from app.domain.user.value_objects.email import Email
        from app.domain.user.value_objects.user_role import UserRole
        
        return User(
            uid=model.uid,
            name=model.name,
            email=Email(model.email) if model.email else None,
            cpf=CPF(model.cpf) if model.cpf else None,
            birthdate=str(model.birthdate) if model.birthdate else None,
            roles=[UserRole(r) for r in (model.global_roles or [])],
            status=model.status
        )
