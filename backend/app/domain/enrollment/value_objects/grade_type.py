from enum import Enum

class GradeType(Enum):
    REGULAR = "regular"
    RECOVERY = "recovery"

    def __str__(self):
        return self.value
