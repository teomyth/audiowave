---
"@audiowave/react": patch
---

Remove default placeholder icon from AudioWave and only render a placeholder when the `placeholder` prop is explicitly provided.

- Visual change only: the waveform area no longer shows a default SVG icon when there is no source
- No API changes; existing `placeholder` prop continues to work as before
- Examples were updated accordingly (not part of the published package)

