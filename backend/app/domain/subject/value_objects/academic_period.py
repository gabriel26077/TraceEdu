import re
from dataclasses import dataclass
from app.domain.exceptions import DomainException

@dataclass(frozen=True)
class AcademicPeriod:
    value: str

    def __post_init__(self):
        # Aceita YYYY ou YYYY.S (onde S é um ou mais dígitos)
        period_regex = r'^\d{4}(\.\d+)?$'
        if not re.match(period_regex, self.value):
            raise DomainException(f"Invalid academic period format: {self.value}. Expected YYYY or YYYY.S")
        
        year = int(self.value[:4])
        if year < 1900 or year > 2100:
            raise DomainException(f"Invalid year in academic period: {year}")

    def __str__(self):
        return self.value
