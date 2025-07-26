# Web Example

🌐 **Live web demo of AudioWave components**

Interactive demonstration of real-time audio visualization in web browsers using the Web Audio API.

## Features

- **Multiple Audio Sources**:
  - Real-time microphone audio visualization
  - Audio file playback visualization
  - URL-based audio streaming visualization
- **Advanced Audio Processing**:
  - Automatic Gain Control (AGC)
  - Echo cancellation
  - Noise suppression
  - Customizable processing constraints
- **Rich Customization**:
  - Waveform appearance settings (colors, dimensions, animation)
  - Real-time configuration changes
  - Multiple visualization styles
- **Developer Features**:
  - Performance monitoring
  - Error handling and display
  - Responsive design
  - Settings persistence

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:web

# Build for production
pnpm build:web
```

## Demo URL

Visit the live demo at: http://localhost:3003

## Audio Files

### Test Audio Files
The demo includes test audio files in `public/audio/`:

- `harvard.wav` - Harvard sentences for speech testing
- Add more files directly to this directory as needed

### Adding New Audio Files

1. **Add files directly to `public/audio/`**
   ```bash
   cp your-audio-file.wav examples/web/public/audio/
   ```

2. **Update demo code to reference new files**
3. **Test in browser**: `pnpm demo:web`

**File Size Guidelines**: < 5MB per file, < 20MB total for fast web loading

## Code Examples

### Microphone Audio Visualization

```tsx
import { AudioWave, useAudioSource } from '@audiowave/react';
import { useState, useRef } from 'react';

function MicrophoneExample() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { source } = useAudioSource({ source: mediaStream });
  const audioWaveRef = useRef<AudioWaveController>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
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
      <AudioWave
        ref={audioWaveRef}
        source={source}
        height={200}
        barColor="#00bcd4"
        backgroundColor="#1a1a1a"
        gain={2.0}
      />
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}
```

### Audio File Visualization

```tsx
import { AudioWave, useAudioSource } from '@audiowave/react';
import { useState, useRef } from 'react';

function AudioFileExample() {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { source } = useAudioSource({ source: audioElement });
  const audioWaveRef = useRef<AudioWaveController>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      setAudioElement(audio);
    }
  };

  const playAudio = () => {
    audioElement?.play();
  };

  const pauseAudio = () => {
    audioElement?.pause();
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileSelect} />
      <AudioWave
        ref={audioWaveRef}
        source={source}
        height={200}
        barColor="#ff6b6b"
        speed={2}
      />
      <button onClick={playAudio}>Play</button>
      <button onClick={pauseAudio}>Pause</button>
    </div>
  );
}
```

## Browser Requirements

- Chrome 66+ (recommended)
- Firefox 60+
- Safari 14+
- Edge 79+

### Required APIs

- Web Audio API
- MediaStream API
- getUserMedia()

## License

MIT © [teomyth](https://github.com/teomyth)
