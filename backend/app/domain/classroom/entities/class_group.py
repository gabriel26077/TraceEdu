from dataclasses import dataclass, field
from typing import List

@dataclass
class ClassGroup:
    uid: str
    school_id: str
    name: str
    shift: str
    student_ids: List[str] = field(default_factory=list)
    base_subject_offering_ids: List[str] = field(default_factory=list)
