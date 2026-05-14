from dataclasses import dataclass
from typing import Optional

@dataclass
class Grade:
    uid: str
    offering_id: str
    student_id: str
    unit: int # 1, 2, 3...
    assessment_number: int # 1, 2, 3... (AV1, AV2, ...)
    value: float
    observations: Optional[str] = None
