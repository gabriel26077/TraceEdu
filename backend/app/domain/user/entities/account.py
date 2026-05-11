from dataclasses import dataclass
from typing import Optional
from app.domain.exceptions import DomainException

@dataclass
class Account:
    uid: str
    user_id: str
    username: str
    password_hash: str
    status: str = "active"

    def __post_init__(self):
        if not self.username or not self.username.strip():
            raise DomainException("Username cannot be empty")
        if not self.password_hash:
            raise DomainException("Password hash cannot be empty")

    def deactivate(self):
        self.status = "inactive"

    def activate(self):
        self.status = "active"

    def change_password(self, new_password_hash: str):
        if not new_password_hash:
            raise DomainException("New password hash cannot be empty")
        self.password_hash = new_password_hash
