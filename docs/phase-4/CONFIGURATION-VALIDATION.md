# Phase 4 Configuration Validation

The backend configuration module now normalizes `PORT` to a number and exposes `validateConfig()`.

Validation rejects invalid ports and missing database URIs. Production startup also requires a JWT secret of at least 32 characters. Invalid production configuration fails before the database connection or listener starts.

Tests cover valid test configuration, weak production secrets, and invalid ports.
