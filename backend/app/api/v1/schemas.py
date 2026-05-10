from pydantic import BaseModel
from typing import Optional

class StudentResponse(BaseModel):
    id: int
    name: str
    grade: str
    status: str

    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_students: int
    active_classes: int
    pending_grades: int
