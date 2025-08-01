# @audiowave/electron

## 0.3.1

### Patch Changes

- 1049b29: # Deprecate @audiowave/electron package

  ## ⚠️ DEPRECATION NOTICE

  The `@audiowave/electron` package is now **deprecated** and will no longer receive updates.

  ## 🔄 Migration Path

  **Please migrate to the new approach:**
  - **Use `@audiowave/react` with `useCustomAudio`** instead of `useIPCAudio`
  - **Create custom providers** for Electron IPC communication
  - **Follow the updated Electron example** for implementation guidance

  ## 📦 What to use instead
  - **For Electron apps**: `@audiowave/react` with `useCustomAudio` and custom provider
  - **For web apps**: `@audiowave/react` with `useMediaAudio`
  - **For custom integrations**: Implement providers using `@audiowave/core`

  ## 📚 Migration Resources
  - See the [Electron example](../../examples/electron) for new implementation
  - Check [@audiowave/react documentation](../react/README.md) for `useCustomAudio`
  - Review [@audiowave/core documentation](../core/README.md) for custom providers

  ## 🗓 Timeline
  - **Current**: Package marked as deprecated
  - **Future**: Package will be unpublished after sufficient migration period
  - **Recommendation**: Migrate immediately to avoid future issues

## 0.3.0

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

### Patch Changes

- Updated dependencies [f19541d]
  - @audiowave/react@0.4.0

## 0.2.2

### Patch Changes

- Updated dependencies [96526ba]
  - @audiowave/react@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [3c79218]
  - @audiowave/react@0.2.1

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

### Patch Changes

- Updated dependencies [35430f7]
  - @audiowave/react@0.2.0
