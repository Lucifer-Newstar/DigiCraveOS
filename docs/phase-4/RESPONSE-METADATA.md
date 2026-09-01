# Response Metadata Standard

Backend JSON object responses now include:

```json
{ "meta": { "requestId": "..." } }
```

The request ID matches the `X-Request-Id` response header. Existing `success` and `data` fields are preserved, and array bodies are not wrapped or changed. This gives clients and operators a stable correlation field without breaking existing response consumers.
