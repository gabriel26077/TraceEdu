from enum import Enum

class Shift(Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    NIGHT = "night"

    def __str__(self):
        return self.value
