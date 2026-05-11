import re
from dataclasses import dataclass
from app.domain.exceptions import DomainException

@dataclass(frozen=True)
class Email:
    value: str

    def __post_init__(self):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, self.value):
            raise DomainException(f"Invalid email format: {self.value}")

    def __str__(self):
        return self.value
