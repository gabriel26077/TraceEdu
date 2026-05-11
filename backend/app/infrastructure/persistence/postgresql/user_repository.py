from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.user.entities.user import User
from app.domain.user.value_objects import CPF, Email, UserRole
from app.domain.user.repositories.user_repository import UserRepository
from app.infrastructure.database.models import UserModel

class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, user: User) -> None:
        # Check if exists
        model = self.session.query(UserModel).filter_by(uid=user.uid).first()
        
        roles_values = [role.value for role in user.roles]
        
        if model:
            # Update
            model.name = user.name
            model.email = str(user.email) if user.email else None
            model.birthdate = user.birthdate
            model.cpf = user.cpf.value if user.cpf else None
            model.roles = roles_values
        else:
            # Create new
            model = UserModel(
                uid=user.uid,
                name=user.name,
                email=str(user.email) if user.email else None,
                birthdate=user.birthdate,
                cpf=user.cpf.value if user.cpf else None,
                roles=roles_values
            )
            self.session.add(model)
        
        self.session.commit()

    def get_by_id(self, uid: str) -> Optional[User]:
        model = self.session.query(UserModel).filter_by(uid=uid).first()
        if not model:
            return None
        
        return self._to_domain(model)

    def get_all(self) -> List[User]:
        models = self.session.query(UserModel).all()
        return [self._to_domain(model) for model in models]

    def delete(self, uid: str) -> None:
        model = self.session.query(UserModel).filter_by(uid=uid).first()
        if model:
            self.session.delete(model)
            self.session.commit()

    def _to_domain(self, model: UserModel) -> User:
        return User(
            uid=model.uid,
            name=model.name,
            roles=[UserRole(role) for role in model.roles],
            email=Email(model.email) if model.email else None,
            birthdate=model.birthdate,
            cpf=CPF(model.cpf) if model.cpf else None
        )
