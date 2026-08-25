# Waste and Consumption Anomaly Intelligence

The admin Inventory page now includes `GET /api/inventory/waste-anomalies`.

The endpoint compares each ingredient's recent consumption with the preceding equal-length window. The default window is seven days and can be bounded from one to thirty days through the `days` query parameter. It reports recent and baseline quantities, daily averages, percentage variance, and an anomaly status when recent daily consumption exceeds 150% of baseline.

The UI presents the anomaly count and a per-ingredient comparison. The signal is advisory and does not block orders, alter stock, or automatically classify waste.

Verification:

- Waste anomaly integration test passed.
- Frontend ESLint passed.
- Vite production build passed.
