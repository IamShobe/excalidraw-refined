# excalidraw server

## Usage

Define DB connection string in environment variable `DB_URL`:
for sqlite:
```bash
export DB_URL=sqlite:///./sql_app.db
```

Run alembic migrations:
```bash
alembic upgrade head
```

Run server:
```bash
```