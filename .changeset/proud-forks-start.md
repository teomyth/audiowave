---
"@audiowave/electron": minor
"@audiowave/react": minor
---

Add configurable skip initial frames and performance optimizations

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
