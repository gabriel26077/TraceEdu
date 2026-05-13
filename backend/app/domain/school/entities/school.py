from dataclasses import dataclass, field
from typing import List, Optional

@dataclass(frozen=True)
class Representative:
    user_id: str
    description: str
    contact: str

@dataclass
class School:
    uid: str
    name: str
    coordination_email: str
    coordination_phone: Optional[str] = None
    representatives: List[Representative] = field(default_factory=list)
    settings: dict = field(default_factory=lambda: {"passing_grade": 6.0})
    status: str = "active"

    def add_representative(self, representative: Representative):
        self.representatives.append(representative)
