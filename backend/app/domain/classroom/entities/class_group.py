from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class ClassGroup:
    uid: str
    school_id: str
    name: str
    shift: str # morning, afternoon, night
    period: str # e.g., 2026
    is_regular: bool = False
    level: Optional[str] = None # fundamental_1, fundamental_2, ensino_medio
    grade: Optional[str] = None # 1-9, I-IV
    notes: Optional[str] = None
    student_ids: List[str] = field(default_factory=list)
    offering_ids: List[str] = field(default_factory=list)
    required_subject_ids: List[str] = field(default_factory=list)
