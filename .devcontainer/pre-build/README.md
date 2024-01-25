# Prebuild devcontainer

Use from root dir:

```bash
npx devcontainer build --workspace-folder .devcontainer/pre-build/ --image-name ghcr.io/iamshobe/excalidraw-refined_dev:latest
```

Login to registry:

```bash
gh auth token | docker login ghcr.io -u IamShobe --password-stdin
```

Push to registry:

```bash
docker push ghcr.io/iamshobe/excalidraw-refined_dev:latest
```
