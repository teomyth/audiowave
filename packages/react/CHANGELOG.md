# @audiowave/react

## 0.2.1

### Patch Changes

- 3c79218: Improve documentation for lazy-loaded audio sources usage patterns

  - Add "Important Usage Notes" section explaining required memoization for dynamic audio sources
  - Clarify that memoization is a functional requirement, not just performance optimization
  - Provide clear examples of correct vs incorrect usage patterns
  - Add quick reference template for developers
  - Update web example to use React package's useAudioSource with proper memoization

  This change improves the developer experience by clearly documenting when and why memoization is required when using useAudioSource with dynamic audio sources (sources that start as null and are set later). Without proper memoization, the audio visualization will flicker and restart continuously, making it unusable.

## 0.2.0

### Minor Changes

- 35430f7: # Initial Development Release - AudioWave v0.1.0

  This is the initial development release of AudioWave, a modern React audio visualization library with Electron support.

  ## New Features

  ### @audiowave/react

  - Real-time audio visualization with canvas rendering
  - Support for microphone and audio file sources
  - Customizable waveform appearance and colors
  - TypeScript support with full type definitions
  - Responsive design and performance optimizations

  ### @audiowave/electron

  - IPC audio bridge for Electron applications
  - Native audio device access through PortAudio
  - Cross-platform support (Windows, macOS, Linux)
  - Type-safe APIs with comprehensive TypeScript support

  ## Package Structure

  - `@audiowave/react`: Core React components and hooks
  - `@audiowave/electron`: Electron-specific audio sources and IPC communication

  ## Examples Included

  - Interactive web demo showcasing all features
  - Full-featured Electron desktop application

  ## Development Status

  This is an initial development release. The API is still evolving and may change in future versions.
