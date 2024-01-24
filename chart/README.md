# excalidraw-refined chart

## Apply
```bash
helm install excalidraw-refined ./excalidraw-refined -f local-values.yaml -n <namespace>
```

It expects a secret named `excalidraw-refined-db` with key `DB_URL` to be present in the namespace.  
The value must be a valid postgresql connection string.  
