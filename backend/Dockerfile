# Use an official lightweight Python image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install poetry
RUN pip install --no-cache-dir poetry

# Copy poetry files (the * ensures it doesn't fail if the lock doesn't exist yet)
COPY pyproject.toml poetry.lock* ./

# Configure poetry to not create a virtualenv inside the container
RUN poetry config virtualenvs.create false

# Install dependencies (without the current project itself, just dependencies)
RUN poetry install --no-interaction --no-ansi --no-root

# Copy the remaining code
COPY . .

# Expose the port the application will run on
EXPOSE 8000

# Command to start the application via entrypoint
CMD ["./entrypoint.sh"]
