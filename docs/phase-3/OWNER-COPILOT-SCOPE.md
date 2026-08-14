# Phase 3 — Owner Copilot scope

## Goal

Give owners a concise, deterministic daily briefing from the operational data already captured by DigiCraveOS. This first slice is an explainable rules-based briefing; LLM and WhatsApp delivery remain later adapters.

## First slice

- Admin-only briefing endpoint with date range support.
- Summarize revenue, gross profit, margin, open shifts, low-stock ingredients, and pricing issues.
- Return prioritized actionable insights with severity and source data.
- Keep the endpoint read-only and deterministic.

## Acceptance criteria

1. Only authenticated Admin users can access the briefing.
2. Voided orders are excluded from financial totals.
3. Empty datasets return valid zero-valued summaries.
4. Every insight identifies its source domain.
5. Existing backend, ML, and frontend verification remains green.

## Deferred

LLM natural-language generation, WhatsApp delivery, approvals, automated actions, and multi-outlet benchmarking.
