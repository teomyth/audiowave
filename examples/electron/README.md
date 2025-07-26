# Electron Example

🖥️ **Desktop audio visualization with Electron**

Demonstrates high-performance native audio capture and real-time visualization in an Electron desktop application.

## Features

- **Dual Audio Sources**:
  - Desktop Audio: Native audio capture via Electron main process
  - Web Audio: Browser-based audio using Web Audio API
- **High Performance**:
  - SharedArrayBuffer data transfer for desktop audio
  - Real-time waveform visualization
  - Cross-platform desktop support (Windows, macOS, Linux)
- **Professional Interface**:
  - Audio device selection and control
  - Customizable waveform settings
  - Real-time configuration changes
  - Error handling and status display

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev:electron

# Build for production
pnpm build:electron
```

## Code Examples

### Desktop Audio (Recommended)

```tsx
// renderer/App.tsx
import { AudioWave, type AudioWaveController } from '@audiowave/react';
import { useIPCAudio } from '@audiowave/electron';
import { useElectronAudioControl } from './hooks/useElectronAudioControl';
import { useRef } from 'react';

export default function App() {
  // Data access hook (visualization only)
  const { source, status, error } = useIPCAudio({ deviceId: 'default' });

  // Device control hook (application layer)
  const { start, stop, isActive } = useElectronAudioControl({ deviceId: 'default' });

  const audioWaveRef = useRef<AudioWaveController>(null);

  return (
    <div>
      <AudioWave
        ref={audioWaveRef}
        source={source}
        height={200}
        barColor="#00bcd4"
        gain={2.0}
      />

      {/* Device control (handled by application) */}
      <button onClick={isActive ? stop : start}>
        {isActive ? 'Stop Desktop Audio' : 'Start Desktop Audio'}
      </button>

      {/* Visualization control (handled by AudioWave) */}
      <button onClick={() => audioWaveRef.current?.pause()}>
        Pause Visualization
      </button>

      {/* Status display */}
      <div>Status: {status}</div>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Web Audio (Alternative)

```tsx
import { AudioWave, useAudioSource } from '@audiowave/react';
import { useState } from 'react';

export default function WebAudioExample() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const { source } = useAudioSource({ source: mediaStream });

  const startMicrophone = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);
  };

  const stopMicrophone = () => {
    mediaStream?.getTracks().forEach(track => track.stop());
    setMediaStream(null);
  };

  return (
    <div>
      <AudioWave source={source} height={200} />
      <button onClick={mediaStream ? stopMicrophone : startMicrophone}>
        {mediaStream ? 'Stop Web Audio' : 'Start Web Audio'}
      </button>
    </div>
  );
}
```

## Platform Support

- **Windows**: DirectSound, WASAPI
- **macOS**: Core Audio
- **Linux**: ALSA, PulseAudio

## Requirements

- Electron 20+
- Node.js 16+
- Platform-specific audio drivers

## License

MIT © [teomyth](https://github.com/teomyth)
