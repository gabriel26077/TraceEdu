import re
from dataclasses import dataclass
from app.domain.exceptions import DomainException

@dataclass(frozen=True)
class CPF:
    value: str

    def __post_init__(self):
        # Remove caracteres não numéricos
        numbers = re.sub(r'\D', '', self.value)
        
        if len(numbers) != 11:
            raise DomainException("Invalid CPF length")
            
        if numbers == numbers[0] * 11:
            raise DomainException("Invalid CPF: sequential digits are not allowed")
            
        if not self._validate_checksum(numbers):
            raise DomainException("Invalid CPF checksum")
            
        # Sobrescreve o valor apenas com números (imutabilidade via object.__setattr__ pois é frozen)
        object.__setattr__(self, 'value', numbers)

    def _validate_checksum(self, numbers: str) -> bool:
        # Validação do primeiro dígito
        sum_1 = sum(int(numbers[i]) * (10 - i) for i in range(9))
        digit_1 = (sum_1 * 10 % 11) % 10
        
        # Validação do segundo dígito
        sum_2 = sum(int(numbers[i]) * (11 - i) for i in range(10))
        digit_2 = (sum_2 * 10 % 11) % 10
        
        return int(numbers[9]) == digit_1 and int(numbers[10]) == digit_2

    def __str__(self):
        return f"{self.value[:3]}.{self.value[3:6]}.{self.value[6:9]}-{self.value[9:]}"
