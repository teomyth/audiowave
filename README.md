# AudioWave

🎵 **Real-time audio visualization for React applications**

A lightweight, performant React component library for audio waveform visualization with support for both web browsers and Electron applications.

## ✨ Features

- **Real-time visualization** - Live audio waveform rendering at 60fps
- **Cross-platform** - Web Audio API + Electron native audio
- **TypeScript first** - Full type safety and IntelliSense
- **Zero dependencies** - Lightweight and fast
- **Customizable** - Flexible styling and configuration
- **Pure components** - No built-in controls, maximum flexibility

## 📦 Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@audiowave/react`](./packages/react) | Core React components | ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@audiowave/react) |
| [`@audiowave/electron`](./packages/electron) | Electron audio support | ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@audiowave/electron) |

## 🚀 Quick Start

```bash
npm install @audiowave/react
```

```tsx
import { useState, useRef } from 'react';
import { AudioWave, useAudioSource } from '@audiowave/react';
import type { AudioWaveController } from '@audiowave/react';

export default function App() {
  // Your recording software manages the MediaStream
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Use useAudioSource for pure visualization
  const { source, error } = useAudioSource({ source: mediaStream });
  const audioWaveRef = useRef<AudioWaveController>(null);
  const [isPaused, setIsPaused] = useState(false);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaStream?.getTracks().forEach(track => track.stop());
    setMediaStream(null);
    setIsRecording(false);
  };

  return (
    <div>
      {error && <div>Error: {error.message}</div>}
      <AudioWave
        ref={audioWaveRef}
        source={source}
        height={100}
        barWidth={2}
        gap={1}
        isPaused={isPaused}
      />

      {/* Audio source control */}
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Waveform visualization control */}
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button onClick={() => audioWaveRef.current?.clear()}>
        Clear Waveform
      </button>
    </div>
  );
}
```

## 📖 API Reference

### AudioWave Component

The main visualization component for rendering audio waveforms.

```tsx
<AudioWave
  source={source}
  height={100}
  width={400}
  barWidth={2}
  gap={1}
  color="#00ff00"
  backgroundColor="#000000"
  isPaused={false}
  className="my-waveform"
  style={{ border: '1px solid #ccc' }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `AudioSource \| null` | `null` | Audio data source from `useAudioSource` |
| `height` | `number` | `100` | Height of the waveform in pixels |
| `width` | `number` | `400` | Width of the waveform in pixels |
| `barWidth` | `number` | `2` | Width of each frequency bar |
| `gap` | `number` | `1` | Gap between frequency bars |
| `color` | `string` | `"#00ff00"` | Color of the waveform bars |
| `backgroundColor` | `string` | `"transparent"` | Background color of the canvas |
| `isPaused` | `boolean` | `false` | Whether to freeze the waveform animation |
| `className` | `string` | `undefined` | CSS class name for the canvas element |
| `style` | `CSSProperties` | `undefined` | Inline styles for the canvas element |

#### Ref Methods

```tsx
const audioWaveRef = useRef<AudioWaveController>(null);

// Clear the waveform display
audioWaveRef.current?.clear();
```

### useAudioSource Hook

Creates an audio source from various input types.

```tsx
const { source, error } = useAudioSource({
  source: mediaStream
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | `MediaStream \| HTMLAudioElement \| HTMLVideoElement \| null` | `null` | Audio input source |
| `fftSize` | `number` | `2048` | FFT size for frequency analysis (256-32768, power of 2) |
| `smoothingTimeConstant` | `number` | `0.8` | Smoothing factor for frequency data (0-1) |
| `minDecibels` | `number` | `-90` | Minimum decibel value for frequency analysis |
| `maxDecibels` | `number` | `-10` | Maximum decibel value for frequency analysis |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `source` | `AudioSource \| null` | Audio source for AudioWave component |
| `error` | `Error \| null` | Error object if audio processing fails |

### Electron Integration

Electron applications have **two audio source options**:

#### Option 1: Main Process Audio (System/Desktop Audio)

Use `@audiowave/electron` for capturing system audio through the main process:

```tsx
import { AudioWave } from '@audiowave/react';
import { useIPCAudio } from '@audiowave/electron';

function DesktopAudioApp() {
  const { source, status, error } = useIPCAudio({ deviceId: 'default' });
  // Device control handled by your application layer
  return <AudioWave source={source} height={100} />;
}
```

#### Option 2: Web Audio (Microphone/Files)

Use `@audiowave/react` for browser-based audio sources:

```tsx
import { AudioWave, useAudioSource } from '@audiowave/react';

function WebAudioApp() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const { source } = useAudioSource({ source: mediaStream });
  return <AudioWave source={source} height={100} />;
}
```

#### Complete Electron Example (Main Process Audio)

```tsx
import { AudioWave } from '@audiowave/react';
import { useIPCAudio } from '@audiowave/electron';

function ElectronAudioApp() {
  // Data-only hook for visualization
  const { source, status, error, clearError } = useIPCAudio({
    deviceId: 'default'
  });

  // Device control should be implemented in your application layer
  const handleStartDevice = async () => {
    await window.electronAPI.audio.start('default');
  };

  const handleStopDevice = async () => {
    await window.electronAPI.audio.stop('default');
  };

  return (
    <div>
      {error && (
        <div>
          Error: {error}
          <button onClick={clearError}>Clear</button>
        </div>
      )}
      <AudioWave source={source} height={100} />

      {/* Device control (implemented in your application) */}
      <button onClick={handleStartDevice}>Start Device</button>
      <button onClick={handleStopDevice}>Stop Device</button>

      <div>Status: {status}</div>
    </div>
  );
}
```

#### useIPCAudio Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deviceId` | `string` | `'default'` | Audio input device identifier |

#### useIPCAudio Returns

| Property | Type | Description |
|----------|------|-------------|
| `source` | `AudioSource \| null` | Audio data source for AudioWave component |
| `status` | `'idle' \| 'active' \| 'paused'` | Current audio data stream status |
| `isActive` | `boolean` | Whether audio data is being received |
| `error` | `string \| null` | Error message if any |
| `deviceId` | `string` | Device identifier |
| `clearError` | `() => void` | Function to clear error state |

**Important**: Device control (start/stop/pause/resume) should be implemented in your application layer using IPC calls to your main process audio management.

## 📖 Documentation

- [React Package](./packages/react/README.md) - Core components and hooks
- [Electron Package](./packages/electron/README.md) - Electron integration
- [Web Example](./examples/web) - Live web demo
- [Electron Example](./examples/electron) - Desktop app example

## 🛠 Development

```bash
# Install dependencies
pnpm install

# Start web demo
pnpm demo:web

# Start Electron demo
pnpm demo:electron

# Build all packages
pnpm build
```

## License

MIT © [teomyth](https://github.com/teomyth/audiowave)
