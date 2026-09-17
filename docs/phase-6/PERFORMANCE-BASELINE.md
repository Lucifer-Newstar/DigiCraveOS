# Phase 6 Performance Baseline

Measured locally on 2026-09-22 with the repository verification environment:

| Surface | Result |
|---|---:|
| Backend Jest suite | 42 suites / 101 tests in 21.6 seconds |
| ML pytest suite | 7 tests in 0.72 seconds |
| Frontend production build | 6.5 seconds |
| Health smoke with transient retries | 2.3 seconds |

These values are a comparison baseline, not production SLOs. Repeat them after dependency, database, or build-pipeline changes and investigate material regressions.
