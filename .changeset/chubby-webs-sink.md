---
"@audiowave/react": patch
---

Improve documentation for lazy-loaded audio sources usage patterns

- Add "Important Usage Notes" section explaining required memoization for dynamic audio sources
- Clarify that memoization is a functional requirement, not just performance optimization
- Provide clear examples of correct vs incorrect usage patterns
- Add quick reference template for developers
- Update web example to use React package's useAudioSource with proper memoization

This change improves the developer experience by clearly documenting when and why memoization is required when using useAudioSource with dynamic audio sources (sources that start as null and are set later). Without proper memoization, the audio visualization will flicker and restart continuously, making it unusable.
