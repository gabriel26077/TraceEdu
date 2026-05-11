import pytest
from app.domain.user.value_objects import CPF
from app.domain.exceptions import DomainException

def test_cpf_should_be_created_with_valid_number():
    # Usando um CPF válido gerado para testes
    valid_cpf = "12345678909"
    cpf = CPF(valid_cpf)
    assert str(cpf) == "123.456.789-09"

def test_cpf_should_be_created_even_with_mask():
    cpf = CPF("123.456.789-09")
    assert cpf.value == "12345678909"

def test_cpf_should_raise_error_with_invalid_length():
    with pytest.raises(DomainException) as excinfo:
        CPF("123456789")
    assert "Invalid CPF length" in str(excinfo.value)

def test_cpf_should_raise_error_with_invalid_digits():
    with pytest.raises(DomainException) as excinfo:
        CPF("12345678900") # Dígitos errados
    assert "Invalid CPF checksum" in str(excinfo.value)

def test_cpf_should_raise_error_with_sequential_digits():
    with pytest.raises(DomainException) as excinfo:
        CPF("11111111111")
    assert "Invalid CPF" in str(excinfo.value)

def test_cpf_equality():
    assert CPF("12345678909") == CPF("123.456.789-09")
