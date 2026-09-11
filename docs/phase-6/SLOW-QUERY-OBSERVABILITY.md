# Slow-Query Observability

The backend accepts `SLOW_QUERY_MS` with a default threshold of 500 milliseconds. The `measureQuery` utility records structured JSON warnings for measured operations that exceed the threshold, including operation label, duration, and threshold.

Admin activity aggregation is measured through this utility. The signal is diagnostic and does not change query results or fail requests.
