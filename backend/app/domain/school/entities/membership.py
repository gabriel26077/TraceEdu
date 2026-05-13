from dataclasses import dataclass, field
from typing import List

@dataclass
class SchoolMember:
    uid: str
    school_id: str
    user_id: str
    roles: List[str] = field(default_factory=list)
    status: str = "active"

    def is_admin(self) -> bool:
        return "admin" in self.roles
        
    def is_teacher(self) -> bool:
        return "teacher" in self.roles
        
    def is_student(self) -> bool:
        return "student" in self.roles
