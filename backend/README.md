# TraceEdu - Backend

Purist Domain-Driven Design (DDD) with Hexagonal Architecture (Ports and Adapters) for academic management.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- [Poetry](https://python-poetry.org/)
- Docker & Docker Compose (for PostgreSQL)

### Installation
```bash
poetry install
```

## 🧪 Testing

We follow a strict testing hierarchy to ensure domain integrity and persistence reliability.

### 1. Unit Tests (Domain)
Tests the core business logic without any external dependencies. These are extremely fast.
```bash
# Run all domain unit tests
PYTHONPATH=. poetry run pytest tests/unit
```

### 2. Integration Tests (Persistence)
Tests the mapping between Domain Entities and the Database. By default, it uses an in-memory SQLite for speed.
```bash
# Run persistence integration tests
PYTHONPATH=. poetry run pytest tests/integration
```

### 3. All Tests
```bash
PYTHONPATH=. poetry run pytest
```

## 🏗️ Architecture

- **`app/domain`**: The "Heart" of the system. Entities, Value Objects, and Repository Interfaces (Ports).
- **`app/application`**: Use Cases and orchestration.
- **`app/infrastructure`**: Concrete implementations of repositories (Adapters), database models, and external services.
- **`app/api`**: Web adapters (FastAPI routes and schemas).

## 🗄️ Database
We use PostgreSQL in production. To manage migrations:
```bash
# Create a new migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head
```
