from enum import Enum

class OfferingType(Enum):
    IN_PERSON = "in-person"
    ONLINE = "online"
    HYBRID = "hybrid"

    def __str__(self):
        return self.value
