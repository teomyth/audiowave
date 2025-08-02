# @audiowave/core

Core audio processing utilities and types for AudioWave.

## Features

- **One-Step Processing**: Direct Buffer to visualization data conversion
- **Multi-Format Support**: 8, 16, 24, 32-bit audio with multi-channel support
- **Type Safety**: Comprehensive TypeScript type definitions
- **Platform Agnostic**: Works with any audio data source (Electron, Node.js, Web)
- **Zero Dependencies**: Lightweight with no external dependencies
- **Performance Optimized**: 67% fewer processing steps than traditional approaches

## Installation

```bash
npm install @audiowave/core
```

## Usage

### Audio Processing with Multi-Format Support

```typescript
import { AudioProcessor } from '@audiowave/core';

// Create configuration with audio format specification
const processor = new AudioProcessor({
  bufferSize: 1024,
  skipInitialFrames: 2,        // Skip first 2 frames to avoid initialization noise
  inputBitsPerSample: 16,      // 8, 16, 24, or 32-bit audio
  inputChannels: 2,            // Stereo input (will be mixed to mono for visualization)
});

// Process Buffer data (from Electron, Node.js audio capture)
const audioPacket = processor.process(audioBuffer);
if (audioPacket) {
  // timeDomainData is ready for visualization (Uint8Array)
  console.log('Processed audio data:', audioPacket.timeDomainData);
}

// Process Float32Array data (from Web Audio API)
const webAudioPacket = processor.process(float32AudioData);

// Reset when starting new stream
processor.reset();
```

### Stateless Audio Processing

```typescript
import { process } from '@audiowave/core';

// For simple processing without skip frames
const config = {
  bufferSize: 1024,
  inputBitsPerSample: 32,  // Specify input format
  inputChannels: 1,        // Mono input
};

const audioPacket = process(rawAudioData, config);
```

### Direct Buffer Conversion

```typescript
import { convertBufferToWaveData } from '@audiowave/core';

// Convert audio buffer directly to visualization data
const waveData = convertBufferToWaveData(
  audioBuffer,    // Buffer from audio source
  16,            // 16-bit audio
  2,             // Stereo
  1024           // Target visualization size
);

// waveData is Uint8Array ready for visualization
console.log('Wave data:', waveData); // [128, 145, 112, ...]
```

### Custom Audio Data Provider

```typescript
import type { AudioDataProvider } from '@audiowave/core';

const myProvider: AudioDataProvider = {
  setupStream: async (config) => {
    // Your setup logic
  },
  onData: (callback) => {
    // Your data subscription logic
    return () => { /* cleanup */ };
  },
  onError: (callback) => {
    // Optional error handling
    return () => { /* cleanup */ };
  }
};
```

### Utility Functions

```typescript
import { 
  isPowerOfTwo, 
  getNearestPowerOfTwo, 
  isValidAudioBuffer,
  validateAudioConfig 
} from '@audiowave/core';

// Check if buffer size is optimal for FFT
console.log(isPowerOfTwo(1024)); // true

// Get nearest power of 2
console.log(getNearestPowerOfTwo(1000)); // 1024

// Validate buffer format
console.log(isValidAudioBuffer(buffer)); // true/false

// Validate configuration
console.log(validateAudioConfig(config)); // true/false
```

## API Reference

### Types

- `AudioConfig` - Configuration for audio processing
- `AudioDataProvider` - Interface for audio data sources
- `AudioDataPacket` - Processed audio data
- `AudioDataInput` - Raw audio data input types
- `AudioDeviceInfo` - Audio device information

### Classes

- `AudioProcessor` - Stateful audio processor with skip frames support
  - `process(rawData)` - Process audio with skip frames
  - `reset()` - Reset frame counter
  - `updateConfig(config)` - Update configuration

### Functions

- `process()` - Stateless audio processing
- `convertBufferToWaveData()` - Direct Buffer to visualization data conversion
- `validateAudioConfig()` - Configuration validation

### Constants

- `DEFAULT_AUDIO_CONFIG` - Default configuration values
- `COMMON_BUFFER_SIZES` - Common buffer sizes array
- `AUDIO_CONSTANTS` - Audio processing constants

## License

MIT
