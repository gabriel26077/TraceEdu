from dataclasses import dataclass
from typing import Optional

@dataclass
class Subject:
    uid: str
    school_id: str
    name: str
    level: str
    academic_units: int
    offering_type: str
    description: Optional[str] = None
