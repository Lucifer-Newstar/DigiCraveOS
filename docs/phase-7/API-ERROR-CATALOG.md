# API Error Catalog

| Code | Meaning | Typical response |
|---|---|---|
| `REQUEST_ERROR` | Client or route-level failure without a specialized code | Correct the request and retain the request ID |
| `VALIDATION_ERROR` | Input failed field validation | Correct the reported input |
| `AUTHENTICATION_ERROR` | Session or token is missing or invalid | Re-authenticate |
| `AUTHORIZATION_ERROR` | User lacks the required role | Request the appropriate permission |
| `INTERNAL_ERROR` | Unexpected server failure | Escalate with request ID and timestamp |

Error messages are redacted for common credential fields before they are returned to callers.
