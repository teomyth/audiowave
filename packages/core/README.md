# @audiowave/core

Core audio processing utilities and types for AudioWave.

## Features

- **Pure Functions**: Simple, testable audio processing functions
- **Type Safety**: Comprehensive TypeScript type definitions
- **Platform Agnostic**: Works with any audio data source
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install @audiowave/core
```

## Usage

### Audio Processing with Skip Frames

```typescript
import { AudioProcessor, createAudioConfig } from '@audiowave/core';

// Create configuration
const config = createAudioConfig({
  bufferSize: 1024,
  skipInitialFrames: 2  // Skip first 2 frames
});

// Create processor (maintains frame count state)
const processor = new AudioProcessor(config);

// Process audio data
const audioPacket = processor.process(rawAudioData);
if (audioPacket) {
  console.log('Processed audio data:', audioPacket.timeDomainData);
}

// Reset when starting new stream
processor.reset();
```

### Stateless Audio Processing

```typescript
import { processAudioDataStateless, createAudioConfig } from '@audiowave/core';

// For simple processing without skip frames
const config = createAudioConfig({ bufferSize: 1024 });
const audioPacket = process(rawAudioData, config);
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
- `convertBufferToFloat32Array()` - Buffer conversion utility
- `resampleAudioData()` - Audio resampling
- `convertToTimeDomainData()` - Convert to visualization format
- `validateAudioConfig()` - Configuration validation

### Constants

- `DEFAULT_AUDIO_CONFIG` - Default configuration values
- `COMMON_BUFFER_SIZES` - Common buffer sizes array
- `AUDIO_CONSTANTS` - Audio processing constants

## License

MIT
