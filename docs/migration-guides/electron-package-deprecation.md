# @audiowave/electron Package Deprecation & Migration Guide

## ⚠️ Important Notice

The `@audiowave/electron` package has been **deprecated** and is no longer maintained. This guide will help you migrate to the new recommended approach using `@audiowave/react` with `useCustomAudio`.

## 🔄 Migration Overview

### Old Approach (Deprecated)
```typescript
import { useIPCAudio } from '@audiowave/electron';

const { source, status, error } = useIPCAudio({ deviceId: 'default' });
```

### New Approach (Recommended)
```typescript
import { useCustomAudio } from '@audiowave/react';

// Create a custom provider for Electron IPC
const electronProvider = useMemo(() => createElectronProvider(), []);
const { source } = useCustomAudio({
  provider: electronProvider,
  deviceId: 'default',
});
```

## 📦 What to Use Instead

| Use Case | Old Package | New Solution |
|----------|-------------|--------------|
| **Electron Apps** | `@audiowave/electron` | `@audiowave/react` + custom provider |
| **Web Apps** | N/A | `@audiowave/react` + `useMediaAudio` |
| **Custom Integrations** | N/A | `@audiowave/core` + custom provider |

## 🚀 Step-by-Step Migration

### Step 1: Install New Dependencies

```bash
# Remove old package
npm uninstall @audiowave/electron

# Install new packages
npm install @audiowave/react @audiowave/core
```

### Step 2: Create Custom Electron Provider

Create a new file `src/providers/electronProvider.ts`:

```typescript
import { AudioSource } from '@audiowave/core';

export interface ElectronAudioAPI {
  onAudioData: (callback: (deviceId: string, data: Uint8Array) => void) => void;
  onAudioError: (callback: (deviceId: string, error: string) => void) => void;
  removeAllListeners: () => void;
  setupAudioStream: (config: any) => Promise<ArrayBuffer>;
}

export class ElectronAudioProvider extends AudioSource {
  private electronAPI: ElectronAudioAPI;
  private deviceId: string;

  constructor(electronAPI: ElectronAudioAPI, deviceId: string = 'default') {
    super();
    this.electronAPI = electronAPI;
    this.deviceId = deviceId;
    this.setupListeners();
  }

  private setupListeners() {
    this.electronAPI.onAudioData((deviceId, data) => {
      if (deviceId === this.deviceId) {
        this.updateAudioData(data);
      }
    });

    this.electronAPI.onAudioError((deviceId, error) => {
      if (deviceId === this.deviceId) {
        this.emit('error', error);
      }
    });
  }

  async setupStream() {
    const config = { bufferSize: 1024 };
    return this.electronAPI.setupAudioStream(config);
  }

  destroy() {
    this.electronAPI.removeAllListeners();
    super.destroy();
  }
}

export function createElectronProvider(deviceId?: string) {
  const electronAPI = (window as any).electronAPI;
  if (!electronAPI) {
    throw new Error('Electron API not available');
  }
  return new ElectronAudioProvider(electronAPI, deviceId);
}
```

### Step 3: Update Your Components

**Before (using @audiowave/electron):**
```tsx
import { AudioWave } from '@audiowave/react';
import { useIPCAudio } from '@audiowave/electron';

export default function App() {
  const { source, status, error } = useIPCAudio({ deviceId: 'default' });

  return (
    <div>
      <AudioWave source={source} height={200} />
      <div>Status: {status}</div>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

**After (using @audiowave/react):**
```tsx
import { AudioWave } from '@audiowave/react';
import { useCustomAudio } from '@audiowave/react';
import { createElectronProvider } from './providers/electronProvider';
import { useMemo } from 'react';

export default function App() {
  const electronProvider = useMemo(() => createElectronProvider('default'), []);
  const { source } = useCustomAudio({
    provider: electronProvider,
    deviceId: 'default',
  });

  return (
    <div>
      <AudioWave source={source} height={200} />
    </div>
  );
}
```

### Step 4: Update Main Process (if needed)

The main process audio capture logic remains largely the same, but you may want to use the new `@audiowave/core` package for audio processing:

```typescript
// main/audioCapture.ts
import { AudioProcessor } from '@audiowave/core';

export class AudioCapture extends EventEmitter {
  private audioProcessor: AudioProcessor | null = null;

  constructor() {
    super();
    this.audioProcessor = new AudioProcessor({
      bufferSize: 1024,
      skipInitialFrames: 2,
    });
  }

  private processAudioData(data: Buffer): void {
    const audioPacket = this.audioProcessor?.process(data);
    if (audioPacket) {
      this.emit('data', 'default', audioPacket.timeDomainData);
    }
  }
}
```

## 🔧 API Mapping

### Hooks Migration

| Old Hook | New Hook | Notes |
|----------|----------|-------|
| `useIPCAudio` | `useCustomAudio` | Requires custom provider |

### Component Migration

| Old Import | New Import | Changes |
|------------|------------|---------|
| `AudioWave` from `@audiowave/electron` | `AudioWave` from `@audiowave/react` | No API changes |

### Types Migration

| Old Type | New Type | Package |
|----------|----------|---------|
| `AudioConfig` | `AudioConfig` | `@audiowave/core` |
| `AudioDataPacket` | `AudioDataPacket` | `@audiowave/core` |

## 📚 Additional Resources

- [Complete Electron Example](../../examples/electron) - Updated implementation
- [@audiowave/react Documentation](../../packages/react/README.md)
- [@audiowave/core Documentation](../../packages/core/README.md)

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Electron API not available`
**Solution**: Ensure your preload script properly exposes the electron API

**Issue**: `Audio data not received`
**Solution**: Check that your main process is properly emitting audio data events

**Issue**: `TypeScript errors`
**Solution**: Update your types to use the new packages

## 🗓 Timeline

- **Current**: `@audiowave/electron` marked as deprecated
- **Recommendation**: Migrate immediately to avoid future issues
- **Future**: Package may be unpublished after sufficient migration period

## 💬 Support

If you encounter issues during migration:

1. Check the [updated Electron example](../../examples/electron)
2. Review the [API documentation](../../packages/react/README.md)
3. Open an issue on [GitHub](https://github.com/teomyth/audiowave/issues)

---

*This migration guide will help ensure a smooth transition to the new AudioWave architecture.*
