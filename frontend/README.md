# excalidraw-refined frontend 

## Start using
```bash
npm install
npm run dev
```

Access at `http://localhost:5173`

## Docker
```bash
docker build . -t ghcr.io/iamshobe/excalidraw-refined_frontend:latest
```

## Regenerate types from swagger
First make sure server is up - port 8080.  
Then run:
```bash
npm run generate:api
```
