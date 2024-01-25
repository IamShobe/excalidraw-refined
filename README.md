# excalidraw-refined

## Usage
After cloning to local build and run using docker-compose:
```bash
docker-compose -f docker-compose-dev.yaml up
```

From latest released versions:
```bash
docker-compose up
```

### Using PSQL
Create new database and user:
```bash
CREATE DATABASE "excalidraw-refined";
CREATE USER "excalidraw-refined" WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE "excalidraw-refined" TO "excalidraw-refined";
```

Then on the `excalidraw-refined` database run:
```bash
GRANT ALL ON SCHEMA "public" TO "excalidraw-refined";
```

Use env var:
```bash
export DB_URL=postgresql://excalidraw-refined:password@localhost:5432/excalidraw-refined
```

### Using k8s
Creating namespace:
```bash
export NAMESPACE=excalidraw-refined
kubectl create namespace $NAMESPACE
```

Applying secret to k8s:
```bash
kubectl create secret generic -n $NAMESPACE excalidraw-refined-db "--from-literal=DB_URL=<db_url>"
```

Applying application:
```bash
helm install excalidraw-refined ./chart/excalidraw-refined/ -f chart/local-values.yaml -n $NAMESPACE
```

Upgrading:
```bash
helm upgrade excalidraw-refined ./chart/excalidraw-refined/ -f chart/local-values.yaml -n $NAMESPACE
```

## Releasing versions
Use:
```bash
GITHUB_TOKEN=$(gh auth token) npx release-it
```
