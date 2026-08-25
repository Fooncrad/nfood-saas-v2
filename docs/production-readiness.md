# Production Readiness Notes

## Load testing plan

The production database must never be used for load tests. Create an isolated staging database with the same schema and representative non-sensitive fixtures. Run a staged test at 50, 100, 250, and 500 concurrent order attempts using an idempotency key per simulated order. Measure p50/p95/p99 latency, error rate, database connection saturation, duplicate-order rate, queue lag, and memory/CPU. A run is acceptable only when duplicate orders remain zero, error rate is below the agreed service objective, and p95 remains within the operational target. Any payment gateway or SMS call must be stubbed in staging; no real charges or messages may be generated.

The test should cover public checkout, authenticated POS creation, order status transitions, split-payment payload validation, and refund authorization. Results should be stored with commit, schema version, environment, seed version, and timestamp.

## Local Printer Gateway contract

Web clients must not open arbitrary LAN sockets directly. A separately installed Local Printer Gateway owns discovery and transport to LAN, USB, and Bluetooth printers. The web application communicates with it over an explicitly configured HTTPS or loopback Gateway URL and an authentication token stored as a secret. The gateway validates origin, authenticates every request, restricts printer identifiers to the restaurant account, and returns a request ID, printer status, latency, and error code.

Supported operations are `health`, `discover`, `print`, and `test-print`. Payloads contain a template identifier, paper width (`58mm` or `80mm`), language, order type, and sanitized ESC/POS instructions. The gateway must reject raw unsanitized commands, unknown printer IDs, oversized payloads, and requests from untrusted origins. USB and Bluetooth discovery remain an installation-level capability and are not available inside the hosted WebDev runtime.

## Current boundary

The hosted application already stores printer routing, templates, health metadata, logs, and gateway settings. Actual LAN/USB/Bluetooth transport requires deployment of the external gateway described above; it is intentionally not emulated in production code.
