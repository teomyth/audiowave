# @audiowave/react

## 0.3.0

### Minor Changes

- 96526ba: # Add amplitude calculation modes with enhanced RMS processing and improved UI

  ## New Features

  ### Amplitude Calculation Modes

  - **Peak Mode**: Traditional peak amplitude calculation (default, maintains backward compatibility)
  - **RMS Mode**: Root Mean Square calculation for perceptual loudness representation
  - **Adaptive Mode**: Dynamic scaling with intelligent gain adjustment for varying audio levels

  ### Enhanced RMS Processing

  - Improved silence detection with smooth noise floor transition
  - Natural baseline representation (no abrupt jumps to zero)
  - Exponential transition curve for quiet signals (1-9 range)
  - Logarithmic scaling for audible signals (10+ range)
  - Better representation of real-world acoustic environments

  ### UI/UX Improvements

  - Property-based settings panel with monospace fonts for better alignment
  - Instant tooltip display (0ms delay) for faster help access
  - Resizable split-pane layout for flexible workspace organization
  - Synchronized layout between Web and Electron versions
  - Improved accessibility with proper ARIA attributes

  ## Documentation & Developer Experience

  - Enhanced documentation for lazy-loaded audio sources usage patterns
  - Clear examples of correct vs incorrect memoization patterns
  - Quick reference templates for developers
  - Improved type safety (replaced `any` with `unknown`)

  ## Technical Improvements

  - Cleaned up debug console statements for production readiness
  - Optimized project structure and build configuration
  - Enhanced code formatting and linting compliance
  - Better error handling and user feedback

  This release significantly improves the audio visualization experience with more accurate amplitude representation, especially for quiet environments and varying audio levels. The new RMS mode provides perceptual loudness calculation that better matches human hearing, while the adaptive mode automatically adjusts to different audio dynamics.

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
