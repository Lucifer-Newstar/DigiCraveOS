# Phase 6 Security and Dependency Refresh

The health integration regression suite now checks both an allowed frontend origin and an untrusted origin, while retaining security-header assertions for public probes.

The frontend production dependency audit was refreshed on 2026-09-22 with `npm audit --omit=dev`: 0 info, low, moderate, high, or critical vulnerabilities across 170 production dependencies. No force remediation was used.
