from dataclasses import dataclass, field
from datetime import date
from typing import Optional, List
from app.domain.user.value_objects import CPF, Email, UserRole
from app.domain.exceptions import DomainException

@dataclass
class User:
    uid: str
    name: str
    roles: List[UserRole] = field(default_factory=list)
    email: Optional[Email] = None
    birthdate: Optional[date] = None
    cpf: Optional[CPF] = None

    def __post_init__(self):
        if not self.name or not self.name.strip():
            raise DomainException("Name cannot be empty")
            
        if not self.roles:
            raise DomainException("User must have at least one role")

    def add_role(self, role: UserRole):
        if role not in self.roles:
            self.roles.append(role)

    def remove_role(self, role: UserRole):
        if len(self.roles) <= 1:
            raise DomainException("User must have at least one role")
        if role in self.roles:
            self.roles.remove(role)
