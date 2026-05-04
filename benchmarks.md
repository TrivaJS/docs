# Benchmarks

The Triva repository ships a benchmark suite in `benchmark/` for routing, middleware, throttle checks, cache operations, HTTP throughput, and logging overhead.

## Run the Full Suite

```bash
npm run benchmark
```

## Run Individual Benchmarks

```bash
node benchmark/bench-routing.js
node benchmark/bench-middleware.js
node benchmark/bench-cache.js
node benchmark/bench-throttle.js
node benchmark/bench-http.js
node benchmark/bench-logging.js
```

## What the Suite Measures

- Route matching and parameter extraction
- Middleware-chain overhead
- Cache `get`, `set`, `delete`, `keys`, and TTL behavior
- End-to-end request throughput
- Throttle policy cost
- Logging and retention overhead

## Read Results Carefully

Benchmark output is only meaningful when you note:

- Node.js version
- machine and CPU
- adapter choice
- concurrency level
- whether you benchmarked HTTP or HTTPS

Use the benchmark suite to compare changes in your own environment, not as a universal claim across machines.

## Related Docs

- [Configuration](/core/configuration)
- [Database Adapters](/database/adapters)
- [Production](/deployment/production)
