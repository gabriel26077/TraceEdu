from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class User:
    uid: str
    name: str
    email: Optional[str] = None
    cpf: Optional[str] = None
    birthdate: Optional[str] = None
    roles: List[str] = field(default_factory=list)
    status: str = "active"

    def is_admin(self) -> bool:
        return "admin" in self.roles or "platform_admin" in self.roles
