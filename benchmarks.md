# Benchmarks

Triva includes a benchmark suite for routing, middleware, caching, throttling, logging, HTTP, and HTTPS workflows.

## Run the Full Suite

```bash
npm run benchmark
```

## Run Individual Benchmarks

```bash
npm run benchmark:cache
npm run benchmark:routing
npm run benchmark:middleware
npm run benchmark:throttle
npm run benchmark:logging
npm run benchmark:http
npm run benchmark:https
npm run benchmark:rps
```

## What Gets Measured

- cache adapter throughput and latency
- route matching and parameter extraction
- middleware chain overhead
- throttling policy performance
- request logging cost
- end-to-end request handling

## Reading the Output

Each benchmark reports:

- average duration
- percentile latency (`P50`, `P95`, `P99`)
- throughput
- memory delta where relevant

## Recommended Workflow

1. Record a baseline on your current branch.
2. Make the framework or adapter change.
3. Re-run the same benchmark command.
4. Compare the new output for regressions or wins.

## Useful Tips

- Run benchmarks on a quiet machine when possible.
- Use the same Node.js version when comparing runs.
- Re-run a suite several times before treating small changes as meaningful.

## Related Docs

- [Core API](https://docs.trivajs.com/core/api)
- [Database Adapters](https://docs.trivajs.com/database/adapters)
- [Production Deployment](https://docs.trivajs.com/deployment/production)
