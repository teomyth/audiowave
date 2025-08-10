---
"@audiowave/react": patch
---

Improve guidance and default expectations for stopping microphone capture when using MediaStream sources.

- Ensure integrations stop `MediaStreamTrack`s on stop so the browser mic indicator turns off
- No public API changes; example app updated accordingly

