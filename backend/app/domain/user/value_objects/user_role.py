from enum import Enum

class UserRole(Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    CLERK = "clerk"

    def __str__(self):
        return self.value
