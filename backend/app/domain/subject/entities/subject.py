from dataclasses import dataclass
from typing import Optional
from app.domain.subject.value_objects import SubjectLevel, OfferingType
from app.domain.exceptions import DomainException

@dataclass
class Subject:
    uid: str
    name: str
    level: SubjectLevel
    academic_units: int
    offering_type: OfferingType
    description: Optional[str] = None

    def __post_init__(self):
        if not self.name or not self.name.strip():
            raise DomainException("Subject name cannot be empty")
        if self.academic_units < 1:
            raise DomainException("Academic units must be at least 1")

    def update_description(self, description: str):
        self.description = description

    def rename(self, new_name: str):
        if not new_name or not new_name.strip():
            raise DomainException("Subject name cannot be empty")
        self.name = new_name
