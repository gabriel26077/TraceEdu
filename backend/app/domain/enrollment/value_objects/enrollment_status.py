from enum import Enum

class EnrollmentStatus(Enum):
    ENROLLED = "enrolled"
    APPROVED = "approved"
    FAILED = "failed"
    DROPPED = "dropped"

    def __str__(self):
        return self.value
