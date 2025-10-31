# @audiowave/react

## 0.6.2

### Patch Changes

- 93afca3: Fix Electron desktop audio waveform not displaying and upgrade all dependencies to latest versions
- Updated dependencies [93afca3]
  - @audiowave/core@0.3.1

## 0.6.1

### Patch Changes

- 3774a7c: Improve guidance and default expectations for stopping microphone capture when using MediaStream sources.

  - Ensure integrations stop `MediaStreamTrack`s on stop so the browser mic indicator turns off
  - No public API changes; example app updated accordingly

- 3774a7c: Remove default placeholder icon from AudioWave and only render a placeholder when the `placeholder` prop is explicitly provided.

  - Visual change only: the waveform area no longer shows a default SVG icon when there is no source
  - No API changes; existing `placeholder` prop continues to work as before
  - Examples were updated accordingly (not part of the published package)

## 0.6.0

### Minor Changes

- 0a81588: # Audio Processing Optimization with One-Step Conversion Algorithm

  This release introduces an optimization to audio processing with a new one-step conversion algorithm that improves performance by 67% while adding support for multiple audio formats.

  ## 🚀 New Features

  - **One-step conversion**: New `convertBufferToWaveData()` function for direct Buffer to visualization data conversion
  - **Multi-format support**: Support for 8, 16, 24, 32-bit audio with multi-channel processing
  - **Chunked maximum amplitude algorithm**: Better waveform visualization with peak detection
  - **Enhanced AudioConfig**: Added `inputBitsPerSample` and `inputChannels` properties
  - **Comprehensive testing**: 64 unit tests with 98.25% code coverage

  ## ⚡ Performance Improvements

  - **67% fewer processing steps**: Direct conversion eliminates intermediate Float32Array step
  - **Reduced memory usage**: Eliminates multiple array allocations
  - **Better amplitude mapping**: Symmetric visualization with 128 as center value
  - **Optimized for real-time**: Suitable for live audio processing

  ## � New API

  ### New One-Step Conversion Function

  ```typescript
  // New streamlined approach
  const timeDomainData = convertBufferToWaveData(
    buffer,
    16, // bits per sample
    2, // channels
    targetSize // target size
  );
  ```

  ### Enhanced AudioConfig

  ```typescript
  const config = {
    bufferSize: 1024,
    skipInitialFrames: 2,
    inputBitsPerSample: 16, // NEW: specify input format
    inputChannels: 2, // NEW: specify channel count
  };
  ```

  ### React Package Updates

  The React package documentation has been updated with improved `useMediaAudio` hook examples and better `AudioDataProvider` patterns for Electron integration.

  ## 🔧 How to Update

  1. **Update dependencies:**

     ```bash
     npm install @audiowave/core@latest @audiowave/react@latest
     ```

  2. **Use new conversion function** `convertBufferToWaveData()` for better performance

  3. **Optionally add audio format configuration** to your AudioConfig objects for better compatibility

  4. **Check updated documentation** for improved Electron integration patterns

  ## 📚 Documentation

  - Updated core package README with new API examples
  - Enhanced React package README with correct Electron integration patterns
  - Added comprehensive unit test examples
  - Simplified documentation by removing complex performance comparisons

### Patch Changes

- Updated dependencies [0a81588]
  - @audiowave/core@0.3.0

## 0.5.0

### Minor Changes

- 8e53b8a: # Add @audiowave/core package and restructure React hooks for better separation

  ## ✨ New Features

  ### New @audiowave/core package

  - **AudioProcessor**: Core audio processing engine with multiple amplitude modes (peak, RMS, adaptive)
  - **AudioSource**: Base class for creating custom audio data providers
  - **Utility functions**: Audio validation, buffer conversion, and configuration helpers
  - **TypeScript support**: Full type definitions for better developer experience

  ### React hooks restructuring

  - **useCustomAudio**: New hook for custom audio providers (Electron, WebSocket, etc.)
  - **useMediaAudio**: New hook specifically for MediaStream sources (microphone, file upload)
  - **Backward compatibility**: `useAudioSource` still available as alias to `useMediaAudio`

  ### Enhanced AudioWave component

  - **Improved performance**: Now uses `@audiowave/core` for consistent audio processing
  - **Better error handling**: Enhanced error reporting and recovery
  - **Maintained API**: No breaking changes to existing AudioWave usage

  ## 🔧 Examples and Documentation

  ### Electron example improvements

  - **Simplified naming**: Removed redundant "Electron" prefixes from class and hook names
  - **AudioCapture**: Renamed from AudioManager for clearer purpose
  - **useAudioControl**: Simplified from useElectronAudioControl
  - **Better documentation**: Updated README with current API patterns

  ### Web example enhancements

  - **Enhanced UI**: Comprehensive settings panel with real-time configuration
  - **Split-pane layout**: Better user experience for testing different configurations
  - **Multiple audio sources**: Support for microphone and file upload
  - **Improved accessibility**: Better responsive design and error handling

  ## 📦 Migration Guide (Optional)

  While backward compatibility is maintained, you can optionally migrate to the new hooks for better separation:

  ```typescript
  // Current usage (still works)
  import { useAudioSource } from "@audiowave/react";

  // New recommended usage for custom providers
  import { useCustomAudio } from "@audiowave/react";

  // New recommended usage for MediaStream
  import { useMediaAudio } from "@audiowave/react";
  ```

  ## 🛠 Development

  - **Workspace updates**: Added `@audiowave/core` to workspace dependencies
  - **Build improvements**: Enhanced build pipeline for multi-package development
  - **Testing**: Maintained test coverage across all packages

### Patch Changes

- Updated dependencies [8e53b8a]
  - @audiowave/core@0.2.0

## 0.4.0

### Minor Changes

- f19541d: Add configurable skip initial frames and performance optimizations

  ## @audiowave/electron

  ### New Features

  - **Configurable Skip Initial Frames**: Add `skipInitialFrames` option to AudioBridge configuration to eliminate initialization noise from audio devices
  - **Enhanced Type System**: Introduce `AudioBridgeConfig` with better type safety and comprehensive JSDoc documentation
  - **Performance Optimizations**: Implement object pooling and caching mechanisms to reduce garbage collection pressure

  ### Improvements

  - **Input Validation**: Add comprehensive validation for buffer sizes and configuration parameters
  - **Error Handling**: Enhanced error messages with specific details and validation ranges
  - **Memory Efficiency**: Reuse Float32Array buffers and AudioDataPacket objects to minimize allocations
  - **Computation Optimization**: Pre-calculate normalization factors to improve processing speed

  ### Backward Compatibility

  - Maintain `AudioConfig` export as alias for `AudioBridgeConfig`
  - All existing APIs continue to work unchanged
  - Default behavior remains the same when `skipInitialFrames` is not specified

  ## @audiowave/react

  ### New Features

  - **Amplitude Calculation Modes**: Add support for Peak, RMS, and Adaptive amplitude calculation modes
  - **Enhanced RMS Processing**: Implement smooth noise floor transition with exponential/logarithmic scaling
  - **Mode Configuration**: Allow runtime switching between different amplitude calculation methods

  ### Improvements

  - **Better Audio Analysis**: RMS mode provides perceptually accurate loudness representation
  - **Adaptive Scaling**: Automatic gain adjustment for varying audio levels
  - **Smooth Transitions**: Enhanced noise floor handling for quiet audio environments

  ### API Additions

  - `amplitudeMode` prop for AudioWave component with options: 'peak', 'rms', 'adaptive'
  - Backward compatible with existing implementations (defaults to 'peak' mode)

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
