# Export Retry Safety

Order CSV export is read-only and now returns a deterministic content-derived `ETag`. A client retry can send `If-None-Match`; unchanged content receives HTTP 304 without regenerating the response body. This makes browser, gateway, and job retries safe without creating duplicate records or export state.

The export endpoint remains bounded by date parameters and continues to require Admin access.
