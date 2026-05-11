from dataclasses import dataclass
from app.domain.exceptions import DomainException

@dataclass(frozen=True)
class AcademicGrade:
    value: float

    def __post_init__(self):
        if not (0.0 <= self.value <= 10.0):
            raise DomainException("Grade must be between 0 and 10")

    def __str__(self):
        return f"{self.value:.1f}"
