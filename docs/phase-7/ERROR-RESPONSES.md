# Structured API Errors

Backend errors now return a stable JSON envelope containing HTTP `status`, machine-readable `code`, human-readable `message`, request correlation ID, and an ISO `timestamp`. Development responses retain the existing stack field; production responses keep it empty.

Known callers should branch on `code`, while `requestId` should be included in support and incident reports. Unknown server failures use `INTERNAL_ERROR`.
