# Performance Plan

## Budgets
- Camera-to-stroke latency: ≤30 ms
- Gesture recognition accuracy: ≥98%
- 60 FPS with 1080p camera and two layers
- Memory ≤400 MB, cold start ≤2 s

## Telemetry
- Measure frame processing time, brush latency, FPS
- Collect gesture false positives per minute
- All telemetry stored locally unless opted into upload

## Profiling Steps
1. Use Chrome DevTools performance tab to profile canvas and WebGL calls
2. Benchmark One-Euro filter and gesture FSM in WebWorker
3. Stress test with synthetic input to ensure 60 FPS under load
4. Use Playwright trace viewer for end-to-end latency measurement
