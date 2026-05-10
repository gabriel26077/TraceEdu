from dataclasses import dataclass
from typing import Optional

@dataclass
class Student:
    id: Optional[int]
    name: str
    grade: str
    status: str

    def update_status(self, new_status: str):
        # Aqui você colocaria regras de negócio
        # Ex: Não pode mudar de "Aprovado" para "Em Recuperação" sem motivo
        self.status = new_status
