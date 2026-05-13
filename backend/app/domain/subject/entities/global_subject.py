from dataclasses import dataclass
from typing import Optional

@dataclass
class GlobalSubject:
    uid: str
    name: str
    level: str  # e.g., "fundamental_1", "fundamental_2", "ensino_medio"
    grade: str  # e.g., "1", "2", "I", "II"
    academic_units: int = 3
    description: Optional[str] = None
    category: Optional[str] = None # e.g., "Mathematics", "Language"
