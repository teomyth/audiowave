# @audiowave/core

## 0.2.0

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
