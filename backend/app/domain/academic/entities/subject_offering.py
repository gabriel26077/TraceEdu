from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class SubjectOffering:
    uid: str
    school_id: str
    subject_id: str
    period: str
    class_group_id: Optional[str] = None
    teacher_ids: List[str] = field(default_factory=list)
    student_ids: List[str] = field(default_factory=list)
