from dataclasses import dataclass
from typing import Optional

@dataclass
class Subject:
    uid: str
    school_id: str
    name: str
    level: str
    grade: str  # e.g., "1", "2", "I", "II"
    academic_units: int
    assessments_per_unit: int = 3
    offering_type: str
    description: Optional[str] = None
    template_id: Optional[str] = None
