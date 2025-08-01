# @audiowave/electron

## ⚠️ **DEPRECATED PACKAGE**

**This package is deprecated and no longer maintained.** Please migrate to the new approach using `@audiowave/react` with `useCustomAudio`.

### 🔄 **Migration Guide**

**Old approach** (deprecated):
```typescript
import { useIPCAudio } from '@audiowave/electron';
const { source } = useIPCAudio({ deviceId: 'default' });
```

**New approach** (recommended):
```typescript
import { useCustomAudio } from '@audiowave/react';

// Create a custom provider for Electron IPC
const electronProvider = useMemo(() => createElectronProvider(), []);
const { source } = useCustomAudio({
  provider: electronProvider,
  deviceId: 'default',
});
```

### 📦 **What to use instead**

- **For Electron apps**: Use `@audiowave/react` with `useCustomAudio` and a custom provider
- **For web apps**: Use `@audiowave/react` with `useMediaAudio`
- **For custom integrations**: Implement your own provider using `@audiowave/core`

### 📚 **Migration Resources**

- See the [Electron example](../../examples/electron) for the new implementation
- Check the [@audiowave/react documentation](../react/README.md) for `useCustomAudio`
- Review [@audiowave/core documentation](../core/README.md) for custom providers

---

## 🖥️ **Legacy Documentation** (for reference only)

This package enabled **main process audio capture** in Electron applications. Use this when you want to capture system/desktop audio through the main process and transmit it to the renderer process via IPC.

## When to Use This Package

**Choose based on audio source, not runtime environment:**

- ✅ **Use `@audiowave/electron`** when:
  - Capturing desktop/system audio through main process
  - Need access to system-level audio devices
  - Want to capture audio from other applications

- ✅ **Use `@audiowave/react`** when:
  - Capturing microphone through browser APIs
  - Playing audio files in renderer process
  - Using Web Audio API sources

**Note**: Both packages can be used together in the same Electron app for different audio sources.

## Installation

```bash
npm install @audiowave/electron
```

## Architecture Overview

AudioBridge serves as a **pure data bridge** between Node.js audio capture and renderer process visualization:

- **Node.js Layer**: Handles audio device control (start/stop/pause/resume)
- **AudioBridge**: Processes and transmits audio data via IPC
- **Renderer Layer**: Renders waveforms and provides visualization controls

## Quick Start

### Main Process Setup

```typescript
// main/index.ts
import { AudioBridge } from '@audiowave/electron';
import { ipcMain } from 'electron';

// Create bridge for specific device
const audioBridge = new AudioBridge('default');

// Create audio buffer for IPC communication
const audioConfig = {
  bufferSize: 1024,   // Buffer size for data transmission
  skipInitialFrames: 2, // Skip first 2 frames to avoid initialization noise (optional)
};
const buffer = audioBridge.createAudioBuffer(audioConfig);

// Listen for processed audio data
audioBridge.on('data', (deviceId: string, audioPacket) => {
  // Forward to renderer process
  mainWindow.webContents.send('audio:data', deviceId, audioPacket.timeDomainData);
});

// Process raw audio data (called by your audio capture implementation)
// rawAudioData comes from your Node.js audio capture
audioBridge.processAudioData(rawAudioData);
```

### Renderer Process Usage

```tsx
// renderer/App.tsx
import { AudioWave, type AudioWaveController } from '@audiowave/react';
import { useIPCAudio } from '@audiowave/electron';
import { useRef } from 'react';

export default function App() {
  const { source, status, error } = useIPCAudio();
  const audioWaveRef = useRef<AudioWaveController>(null);

  // Device control should be implemented in your application
  const handleStartDevice = async () => {
    // Your device control logic here
    await window.electronAPI.audio.start('default');
  };

  const handleStopDevice = async () => {
    // Your device control logic here
    await window.electronAPI.audio.stop('default');
  };

  return (
    <div>
      <AudioWave ref={audioWaveRef} source={source} height={100} />

      {/* Device control (implemented by your application) */}
      <button onClick={handleStartDevice}>Start Device</button>
      <button onClick={handleStopDevice}>Stop Device</button>

      {/* Waveform visualization controls (provided by AudioWave) */}
      <button onClick={() => audioWaveRef.current?.pause()}>
        Pause Waveform
      </button>
      <button onClick={() => audioWaveRef.current?.resume()}>
        Resume Waveform
      </button>
      <button onClick={() => audioWaveRef.current?.clear()}>
        Clear Waveform
      </button>

      {/* Status display */}
      <div>Status: {status}</div>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Main Process API

### AudioBridge

**Pure audio data bridge** - handles only audio data processing and transmission, not device control.

```typescript
import { AudioBridge, type AudioConfig } from '@audiowave/electron';

// Create bridge for specific device
const bridge = new AudioBridge('default'); // or specific deviceId

// Create audio buffer for IPC communication
const buffer = bridge.createAudioBuffer({
  bufferSize: 1024,
});

// Process raw audio data from your audio capture implementation
// This method converts raw audio data to visualization-ready format
bridge.processAudioData(rawAudioBuffer);

// Listen for processed data
bridge.on('data', (deviceId: string, audioPacket) => {
  // Forward processed data to renderer via IPC
  webContents.send('audio:data', deviceId, audioPacket.timeDomainData);
});

// Cleanup resources
bridge.destroy();
```

**Note**: AudioBridge does NOT provide device control methods like `startRecording()` or `getDevices()`. These should be implemented in your application layer.

#### Constructor

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `deviceId` | `string` | `'default'` | Device identifier for this bridge instance |

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createAudioBuffer` | `config: AudioConfig` | `ArrayBuffer` | Create shared buffer for IPC |
| `processAudioData` | `rawData: Buffer \| Float32Array` | `AudioDataPacket \| null` | Process raw audio data |
| `destroy` | - | `void` | Cleanup resources |

#### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `'data'` | `deviceId: string, audioPacket: AudioDataPacket` | Processed audio data ready |
| `'error'` | `deviceId: string, error: string` | Audio processing error |

### Audio Configuration

```typescript
interface AudioConfig {
  bufferSize: number;        // Buffer size in samples (512, 1024, 2048, etc.)
  skipInitialFrames?: number; // Number of initial frames to skip (default: 0)
}

interface AudioDataPacket {
  timeDomainData: Uint8Array;  // Processed audio data for visualization
  timestamp: number;           // Timestamp when data was processed
  bufferSize: number;          // Buffer size used
}

interface AudioDeviceInfo {
  id: string;                  // Device identifier
  name: string;                // Human-readable device name
}
```

#### Skip Initial Frames Configuration

The `skipInitialFrames` option helps eliminate initialization noise:

```typescript
// Example configurations
const configs = {
  // No skipping (default)
  basic: { bufferSize: 1024 },

  // Skip 2 frames (recommended for most devices)
  standard: {
    bufferSize: 1024,
    skipInitialFrames: 2
  },

  // Skip more frames for problematic devices
  conservative: {
    bufferSize: 1024,
    skipInitialFrames: 5
  }
};
```

**Why skip initial frames?**
- **Hardware initialization**: Audio devices need time to stabilize
- **Driver buffers**: May contain garbage data in first few frames
- **Visual quality**: Prevents false spikes at visualization start
- **Typical values**: 0-5 frames (2 is usually sufficient)

## Renderer Process API

### useIPCAudio

**Data-only hook** for audio visualization via IPC - provides access to audio data stream without device control.

```tsx
const {
  source,          // AudioSource | null - Audio data source for AudioWave
  status,          // 'idle' | 'active' | 'paused' - Audio data stream status
  isActive,        // boolean - Whether audio data is being received
  error,           // string | null - Error message if any
  deviceId,        // string - Device identifier
  clearError       // () => void - Clear error state
} = useIPCAudio({
  deviceId: 'default'  // Optional: specific device ID
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deviceId` | `string` | `'default'` | Audio input device identifier |

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `source` | `AudioSource \| null` | Audio data source for AudioWave component |
| `status` | `'idle' \| 'active' \| 'paused'` | Current audio data stream status |
| `isActive` | `boolean` | Whether audio data is being received |
| `error` | `string \| null` | Error message if any |
| `deviceId` | `string` | Device identifier |
| `clearError` | `() => void` | Function to clear error state |

**Status Values:**
- `'idle'` - No audio data stream active
- `'active'` - Audio data is being received and processed
- `'paused'` - Audio stream exists but data processing is paused

**Important**: This hook only provides data access. Device control (start/stop/pause/resume) should be implemented in your application layer using IPC calls to your main process audio management.

### RemoteAudioDataSource

Low-level audio source for custom implementations - **data access only**.

```typescript
import { RemoteAudioDataSource } from '@audiowave/electron';

// Create data API interface
const dataAPI = {
  setupAudioStream: async (config) => {
    // Setup IPC communication for audio data
    return new ArrayBuffer(config.bufferSize);
  },
  onAudioData: (callback) => {
    // Listen for audio data from main process
    return window.electronAPI.onAudioData(callback);
  },
  onError: (callback) => {
    // Listen for errors from main process
    return window.electronAPI.onAudioError(callback);
  }
};

const audioSource = new RemoteAudioDataSource(dataAPI, {
  bufferSize: 1024,  // Buffer size for data transmission
  fftSize: 2048,     // FFT size for audio analysis (inherited from AudioSourceConfig)
});

// Setup data stream (not device control)
await audioSource.setupStream();

// Get current audio data
const data = audioSource.getAudioData();

// Note: Device control (start/stop) should be handled separately
// await window.electronAPI.audio.start('default');
```

#### RemoteAudioDataSource Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bufferSize` | `number` | `1024` | Buffer size for data transmission |
| `fftSize` | `number` | `2048` | FFT size for audio analysis (inherited from AudioSourceConfig) |
| `onDataReceived` | `(data: Uint8Array) => void` | `undefined` | Callback for received audio data |
| `onConnectionChange` | `(connected: boolean) => void` | `undefined` | Callback for connection state changes |
| `onError` | `(error: string) => void` | `undefined` | Callback for errors |

## Preload Script

Required preload script for secure IPC communication:

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Audio data reception (handled by AudioBridge)
  onAudioData: (callback: (deviceId: string, data: Uint8Array) => void) => {
    return ipcRenderer.on('audio:data', (_, deviceId, data) => callback(deviceId, data));
  },
  onAudioError: (callback: (deviceId: string, error: string) => void) => {
    return ipcRenderer.on('audio:error', (_, deviceId, error) => callback(deviceId, error));
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('audio:data');
    ipcRenderer.removeAllListeners('audio:error');
  },

  // Device control (implement in your application)
  audio: {
    start: (deviceId: string) => ipcRenderer.invoke('audio:start', deviceId),
    stop: (deviceId: string) => ipcRenderer.invoke('audio:stop', deviceId),
    pause: (deviceId: string) => ipcRenderer.invoke('audio:pause', deviceId),
    resume: (deviceId: string) => ipcRenderer.invoke('audio:resume', deviceId),
    getDevices: () => ipcRenderer.invoke('system:info')
  }
});
```

## Best Practices

### 1. Separation of Concerns

```tsx
// ✅ Good: Separate data access and device control
const { source, error } = useIPCAudio({ deviceId: 'default' });

const handleStartDevice = async () => {
  try {
    await window.electronAPI.audio.start('default');
  } catch (err) {
    console.error('Failed to start device:', err);
  }
};

// ❌ Bad: Don't expect device control from useRemoteAudio
// const { startRecording } = useRemoteAudio(); // This doesn't exist
```

### 2. Error Handling

```tsx
const { source, error, clearError } = useIPCAudio();

if (error) {
  return (
    <div>
      Audio Data Error: {error}
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}
```

### 3. Device Management

```tsx
// Implement device control in your application layer
const [devices, setDevices] = useState([]);
const [activeDevice, setActiveDevice] = useState('default');

useEffect(() => {
  // Get available devices
  window.electronAPI.audio.getDevices().then(info => {
    setDevices(info.audioDevices);
  });
}, []);

const handleDeviceChange = async (deviceId: string) => {
  try {
    await window.electronAPI.audio.stop(activeDevice);
    await window.electronAPI.audio.start(deviceId);
    setActiveDevice(deviceId);
  } catch (err) {
    console.error('Failed to change device:', err);
  }
};
```

### 4. Performance Optimization

```tsx
// Use appropriate buffer sizes for your use case
const audioConfig = {
  bufferSize: 1024,   // Smaller = lower latency, higher CPU
};
```

### 5. Cleanup

```tsx
useEffect(() => {
  return () => {
    // Clean up device resources in your application
    window.electronAPI.audio.stop(deviceId);
  };
}, [deviceId]);
```

## Architecture Notes

### Responsibility Boundaries

- **AudioBridge**: Pure data processing and transmission
  - Converts raw audio data to visualization format
  - Applies basic processing and normalization
  - Emits processed data via events
  - Does NOT control audio devices

- **Application Layer**: Device and system control
  - Start/stop/pause/resume audio devices
  - Device enumeration and selection
  - Permission handling
  - System integration

- **Renderer Layer**: Visualization and UI
  - Receives processed audio data
  - Renders waveforms
  - Provides visualization controls (pause/resume/clear waveform)

### Data Flow

```
Node.js Audio Capture → AudioBridge → IPC → Renderer → AudioWave Component
     ↑                      ↓
Device Control         Data Processing
(Your App)            (AudioBridge)
```

## Security Considerations

- Always use preload scripts for IPC communication
- Validate audio configuration parameters in main process
- Handle microphone permissions in your application layer
- Sanitize device information before display

## Platform Support

AudioBridge works with any Node.js audio capture implementation:
- **Windows**: DirectSound, WASAPI, node-portaudio
- **macOS**: Core Audio, node-portaudio
- **Linux**: ALSA, PulseAudio, node-portaudio

## License

MIT © [teomyth](https://github.com/teomyth)
