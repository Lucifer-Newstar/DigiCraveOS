# Frontend Error Boundary

The POS frontend now wraps the application in a React error boundary. Rendering exceptions are logged with component stack details and replaced by a recoverable reload screen. Development builds show the exception message; production builds do not expose it to users.

The boundary does not replace API error handling or authentication redirects; it protects the shell from uncaught rendering failures.
