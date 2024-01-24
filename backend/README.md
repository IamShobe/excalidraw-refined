# excalidraw server

## Usage
App is written with PSQL dialect in mind.  
Define DB connection string in environment variable `DB_URL`:
for psql:
```bash
export DB_URL=postgresql://excalidraw-refined:excalidraw-refined@localhost:15432/excalidraw-refined
```

To create DB only you can use:
```bash
docker-compose up db
```

Run alembic migrations:
```bash
alembic upgrade head
```

Run server:
```bash
uvicorn server.main:app
```

## Docker
```bash
docker build . -t ghcr.io/iamshobe/excalidraw-refined_backend:latest
```
