# Validation and Authentication Error Codes

The global error handler normalizes common HTTP failures to stable codes: 400 becomes `VALIDATION_ERROR`, 401 becomes `AUTHENTICATION_ERROR`, and 403 becomes `AUTHORIZATION_ERROR`. Controllers may provide a more specific code, which is preserved.

This keeps frontend behavior independent of message wording while maintaining existing status codes and request correlation.
