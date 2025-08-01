---
"@audiowave/core": major
"@audiowave/react": major
---

# Major refactor: Add @audiowave/core package and restructure React hooks

## 🚨 BREAKING CHANGES

### New @audiowave/core package

- **WHAT**: Introduced a new `@audiowave/core` package containing shared audio processing logic
- **WHY**: Better separation of concerns and code reusability across different environments
- **HOW**: Install the new dependency: `npm install @audiowave/core`

### React hooks restructuring

- **WHAT**: Split `useAudioSource` into `useCustomAudio` and `useMediaAudio` for better separation
- **WHY**: Clearer API boundaries and improved developer experience
- **HOW**: Update your imports:

  ```typescript
  // Before
  import { useAudioSource } from '@audiowave/react';

  // After - for custom audio providers
  import { useCustomAudio } from '@audiowave/react';

  // After - for MediaStream sources
  import { useMediaAudio } from '@audiowave/react';
  ```

### AudioWave component updates

- **WHAT**: AudioWave component now uses `@audiowave/core` for audio processing
- **WHY**: Consistent audio processing across all environments
- **HOW**: No API changes required, but ensure `@audiowave/core` is installed

## ✨ New Features

- **AudioProcessor**: New core audio processing engine with multiple amplitude modes (peak, RMS, adaptive)
- **AudioSource**: Base class for creating custom audio data providers
- **Improved TypeScript support**: Better type definitions and IntelliSense
- **Enhanced performance**: Optimized audio processing pipeline

## 📦 Migration Guide

1. Install the new core package:

   ```bash
   npm install @audiowave/core
   ```

2. Update your React hook imports:

   ```typescript
   // For custom audio providers (Electron, WebSocket, etc.)
   import { useCustomAudio } from '@audiowave/react';

   // For MediaStream sources (microphone, file upload)
   import { useMediaAudio } from '@audiowave/react';
   ```

3. No changes needed for AudioWave component usage - the API remains the same

## 🔧 Examples Updated

- **Electron example**: Simplified naming conventions (removed redundant "Electron" prefixes)
- **Web example**: Enhanced UI with comprehensive settings panel
- **Documentation**: Updated with new API patterns and best practices
