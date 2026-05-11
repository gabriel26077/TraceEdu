from enum import Enum

class SubjectLevel(Enum):
    ELEMENTARY_1 = "Elementary 1"
    ELEMENTARY_2 = "Elementary 2"
    HIGH_SCHOOL = "High School"

    def __str__(self):
        return self.value
