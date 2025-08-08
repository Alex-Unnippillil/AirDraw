# Build Plan

## Sprint Breakdown
1. **Sprint 1**
   - Repo scaffold with TypeScript workspaces
   - Camera capture hook
   - MediaPipe hand tracking and One-Euro smoothing
   - Basic brush and pinch-to-draw
2. **Sprint 2**
   - Gesture FSM with default mappings
   - Radial palette and HUD
   - Undo/redo stack, color picker
3. **Sprint 3**
   - Layer management and export (PNG/SVG/JSON)
   - Settings persistence via IndexedDB
   - Performance profiling and optimization
4. **Sprint 4**
   - AI copilot stub and command bus
   - Macro recorder and prompt help
5. **Sprint 5**
   - Test suite (unit, integration, Playwright)
   - Telemetry and packaging (Electron shell)
   - Documentation and release candidate

## Risks & Mitigations
| Risk | Mitigation |
| --- | --- |
| Low light or skin tone variance | Auto-exposure hints, configurable detection threshold |
| Left/right hand bias | Mirror handling, user calibration step |
| CPU thermal throttling | WebWorker offloading, frame skipping |
| Background clutter | Focus mask and RDP simplification |
| Gesture false positives | HUD feedback and adjustable sensitivity |
