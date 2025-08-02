# @audiowave/react

**Lightweight React components for real-time audio visualization**

## Inspiration and Key Differences

This project is inspired by [react-audio-visualizer](https://github.com/Wolfy64/react-audio-visualize) but takes a different, more focused approach:

**What makes us different:**
- **Visualization only** - No built-in playback or recording functionality
- **No control buttons** - Pure visualization components without UI controls
- **Lightweight** - Minimal bundle size with focused feature set
- **Easy integration** - Drop into existing audio applications without conflicts
- **Flexible** - Works with any audio source you provide

**Perfect for these scenarios:**
- **Existing audio apps** - Add visualization to apps that already handle audio
- **Recording software** - Visualize microphone input without audio conflicts
- **Music players** - Add waveforms to audio/video playback
- **Custom audio workflows** - Integrate with any audio source or processing pipeline
- **Lightweight projects** - Minimal bundle size when you only need visualization

## Installation

```bash
npm install @audiowave/react
```

## Quick Start

**Basic usage with microphone input:**

```tsx
import { AudioWave, useMediaAudio } from '@audiowave/react';
import { useRef, useState, useMemo, useCallback } from 'react';

export default function App() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // AudioWave handles visualization, you control the audio source
  // Note: For dynamic audio sources, memoize the options object (see Important Usage Notes)
  const handleError = useCallback((error: Error) => {
    console.error('Audio error:', error);
  }, []);

  const audioOptions = useMemo(() => ({
    source: mediaStream,
    onError: handleError,
  }), [mediaStream, handleError]);

  const { source, error } = useMediaAudio(audioOptions);
  const audioWaveRef = useRef<AudioWaveController>(null);

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
      <AudioWave ref={audioWaveRef} source={source} height={100} />

      {/* You provide the controls - AudioWave just visualizes */}
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Optional: Control visualization display */}
      <button onClick={() => audioWaveRef.current?.pause()}>Pause Waveform</button>
      <button onClick={() => audioWaveRef.current?.resume()}>Resume Waveform</button>
      <button onClick={() => audioWaveRef.current?.clear()}>Clear Waveform</button>
    </div>
  );
}
```

**Works with any audio source:**

```tsx
// With audio file
const audioElement = useRef<HTMLAudioElement>(null);
const { source } = useAudioSource({ source: audioElement.current });

// With video file
const videoElement = useRef<HTMLVideoElement>(null);
const { source } = useAudioSource({ source: videoElement.current });

// With Web Audio API nodes
const { source } = useAudioSource({ source: audioNode });

// With custom audio data (Electron, Node.js, etc.)
const { source } = useCustomAudio();
```

## API Reference

### AudioWave Component

The main visualization component - pure display, no audio control.

```tsx
<AudioWave
  // === AUDIO SOURCE ===
  source={source}            // AudioSource from useAudioSource

  // === DIMENSIONS ===
  width="100%"               // Component width (string | number)
  height={200}               // Component height in pixels

  // === VISUAL STYLING ===
  backgroundColor="transparent" // Background color
  barColor="#ffffff"         // Primary bar color
  secondaryBarColor="#5e5e5e" // Secondary/inactive bar color
  barWidth={2}               // Width of each frequency bar
  gap={1}                    // Gap between bars in pixels
  rounded={0}                // Border radius for rounded bars

  // === BORDER STYLING ===
  showBorder={false}         // Show border around visualization
  borderColor="#333333"      // Border color
  borderWidth={1}            // Border width in pixels
  borderRadius={0}           // Border radius for rounded corners

  // === AMPLITUDE CALCULATION ===
  amplitudeMode="peak"       // Amplitude calculation: 'peak' | 'rms' | 'adaptive'

  // === ANIMATION & RENDERING ===
  speed={3}                  // Animation speed (1-6, higher = slower)
  animateCurrentPick={true}  // Enable smooth bar transitions
  fullscreen={false}         // Fill entire parent container
  onlyActive={false}         // Show visualization only when active
  gain={1.0}                 // Audio gain multiplier (0.1-10.0, default: 1.0)

  // === STATE CONTROL ===
  isPaused={false}           // Pause visualization (freeze display)

  // === ADVANCED CUSTOMIZATION ===
  customRenderer={(context) => {
    // Custom rendering function for advanced visualizations
    // context: { canvas, audioData, width, height, ... }
  }}

  // === PLACEHOLDER CONTENT ===
  placeholder={<div>No audio source</div>} // Custom placeholder content
  showPlaceholderBackground={true}         // Show background in placeholder state

  // === CSS CLASSES ===
  className="my-waveform"    // CSS class for main container
  canvasClassName="my-canvas" // CSS class for canvas element

  // === CALLBACKS ===
  onStateChange={(state) => console.log('State:', state)} // State change callback
  onRenderStart={() => console.log('Rendering started')}  // Render start callback
  onRenderStop={() => console.log('Rendering stopped')}   // Render stop callback
  onError={(error) => console.error('Error:', error)}     // Error callback
/>
```

#### Essential Props

**Audio Source:**
- `source` - AudioSource from `useMediaAudio` or `useCustomAudio` hook (required for visualization)

**Dimensions:**
- `width` - Component width, supports CSS units and numbers (default: `"100%"`)
- `height` - Component height in pixels (default: `200`)

**Visual Styling:**
- `backgroundColor` - Background color (default: `"transparent"`)
- `barColor` - Primary color for active audio bars (default: `"#ffffff"`)
- `secondaryBarColor` - Color for inactive/past bars (default: `"#5e5e5e"`)
- `barWidth` - Width of each frequency bar in pixels (default: `2`)
- `gap` - Gap between bars in pixels (default: `1`)
- `rounded` - Border radius for rounded bars (default: `0`)

#### Advanced Props

**Border Styling:**
- `showBorder` - Show border around visualization area (default: `false`)
- `borderColor` - Border color (default: `"#333333"`)
- `borderWidth` - Border width in pixels (default: `1`)
- `borderRadius` - Border radius for rounded corners (default: `0`)

**Animation & Rendering:**
- `speed` - Animation speed from 1-6, higher numbers are slower (default: `3`)
- `animateCurrentPick` - Enable smooth bar transitions (default: `true`)
- `fullscreen` - Fill entire parent container (default: `false`)
- `onlyActive` - Show visualization only when audio is active (default: `false`)

**State Control:**
- `isPaused` - Pause visualization display without affecting audio (default: `false`)

**Advanced Customization:**
- `customRenderer` - Custom rendering function for advanced visualizations
- `placeholder` - Custom React component to show when no audio source
- `showPlaceholderBackground` - Whether to show background in placeholder state

**CSS Classes:**
- `className` - CSS class for the main container
- `canvasClassName` - CSS class for the canvas element

**Event Callbacks:**
- `onStateChange` - Called when visualization state changes
- `onRenderStart` - Called when rendering starts
- `onRenderStop` - Called when rendering stops
- `onError` - Called on render errors

### useMediaAudio Hook (Recommended)

Converts media sources into visualization data. This is the main hook for most use cases.

```tsx
const { source, error } = useMediaAudio({
  source: mediaStream  // MediaStream | HTMLAudioElement | HTMLVideoElement | AudioNode
});
```

> **⚠️ Important:** When using lazy-loaded audio sources (starting as `null`), you must memoize the options object to prevent flickering. See [Important Usage Notes](#important-usage-notes) for details.

**Supported Sources:**
- `MediaStream` - Microphone, recording software
- `HTMLAudioElement` - Audio files
- `HTMLVideoElement` - Video files
- `AudioNode` - Web Audio API nodes

**Returns:**
- `source` - AudioSource instance for AudioWave component
- `error` - Any processing errors (Error | null)

### useAudioSource Hook (Legacy)

> **Note:** `useAudioSource` is an alias for `useMediaAudio` maintained for backward compatibility. New projects should use `useMediaAudio`.

### Specialized Hooks

For better type safety and convenience, you can use specialized hooks:

```tsx
// For microphone or recording software
const { source, error } = useMediaStreamSource(mediaStream);

// For audio/video files
const { source, error } = useMediaElementSource(audioElement);

// For Web Audio API nodes
const { source, error } = useAudioNodeSource(audioNode);

// For custom audio data (Electron, Node.js, etc.)
const { source } = useCustomAudio({ provider: myProvider });
```

### useCustomAudio Hook

For advanced use cases where you need to provide custom audio data (Electron apps, Node.js audio processing, custom audio pipelines), use the `useCustomAudio` hook with a custom provider:

```tsx
import { useCustomAudio } from '@audiowave/react';
import { useMemo } from 'react';

function CustomAudioApp() {
  // Create audio data provider
  const audioProvider = useMemo(() => ({
    onAudioData: (callback: (data: Uint8Array) => void) => {
      // Your audio data subscription logic
      const unsubscribe = yourAudioSource.subscribe(callback);
      return unsubscribe; // Return cleanup function
    },
    onAudioError: (callback: (error: string) => void) => {
      // Optional error handling
      const unsubscribe = yourAudioSource.onError(callback);
      return unsubscribe;
    }
  }), []);

  const { source, error } = useCustomAudio({
    provider: audioProvider,
    deviceId: 'default'
  });

  return (
    <div>
      {error && <div>Error: {error}</div>}
      <AudioWave source={source} height={120} />
    </div>
  );
}
```

**Parameters:**
- `provider` - AudioDataProvider implementation (required)
- `deviceId` - Device identifier (optional, default: 'default')

**Returns:**
- `source` - AudioSource instance for AudioWave component
- `status` - Current status: 'idle' | 'active' | 'paused'
- `error` - Error message if any
- `isActive` - Boolean indicating if audio is active
- `clearError` - Function to clear error state

**Audio Data Format:**
- `Uint8Array` with values in range [0, 255]
- 128 represents silence (center value)
- Values above 128 represent positive amplitude
- Values below 128 represent negative amplitude
- Array length should match your desired visualization resolution

## Electron Integration Guide

For Electron applications, use `useCustomAudio` with a custom provider for native audio processing:

### Best Practice: Main Process Audio Processing

Process audio in the main process for optimal performance:

**Main Process (`main.js`):**

```typescript
import { AudioProcessor } from '@audiowave/core';
import { ipcMain } from 'electron';

class ElectronAudioCapture {
  private audioProcessor: AudioProcessor;

  constructor() {
    this.audioProcessor = new AudioProcessor({
      bufferSize: 1024,
      skipInitialFrames: 2,
      inputBitsPerSample: 32,  // naudiodon uses 32-bit
      inputChannels: 2,        // stereo input
    });

    this.setupAudioCapture();
  }

  private setupAudioCapture() {
    // Setup your audio capture (naudiodon, etc.)
    audioCapture.on('data', (buffer: Buffer) => {
      // Process audio in main process
      const result = this.audioProcessor.process(buffer);

      if (result) {
        // Send processed data to renderer
        mainWindow.webContents.send('audio-data', result.timeDomainData);
      }
    });
  }
}

// IPC handlers
ipcMain.handle('start-audio-capture', async () => {
  // Start audio capture logic
});

ipcMain.handle('stop-audio-capture', async () => {
  // Stop audio capture logic
});
```

**Renderer Process (`renderer.tsx`):**

```tsx
import { useCustomAudio } from '@audiowave/react';
import { useMemo } from 'react';

function ElectronAudioApp() {
  // Create provider for Electron IPC communication
  const electronProvider = useMemo(() => ({
    onAudioData: (callback: (data: Uint8Array) => void) => {
      const handleAudioData = (_event: any, audioData: Uint8Array) => {
        callback(audioData);
      };

      window.electronAPI.onAudioData(handleAudioData);

      return () => {
        window.electronAPI.removeAudioDataListener?.(handleAudioData);
      };
    },
    onAudioError: (callback: (error: string) => void) => {
      const handleError = (_event: any, error: string) => {
        callback(error);
      };

      window.electronAPI.onAudioError?.(handleError);

      return () => {
        window.electronAPI.removeAudioErrorListener?.(handleError);
      };
    }
  }), []);

  const { source, error } = useCustomAudio({
    provider: electronProvider,
    deviceId: 'default'
  });

  const startCapture = () => {
    window.electronAPI.startAudioCapture();
  };

  const stopCapture = () => {
    window.electronAPI.stopAudioCapture();
  };

  return (
    <div>
      {error && <div>Error: {error}</div>}
      <AudioWave source={source} height={120} />
      <button onClick={startCapture}>Start</button>
      <button onClick={stopCapture}>Stop</button>
    </div>
  );
}
```

**Preload Script (`preload.js`):**

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  startAudioCapture: () => ipcRenderer.invoke('start-audio-capture'),
  stopAudioCapture: () => ipcRenderer.invoke('stop-audio-capture'),
  onAudioData: (callback: (event: any, data: Uint8Array) => void) => {
    ipcRenderer.on('audio-data', callback);
  },
  onAudioError: (callback: (event: any, error: string) => void) => {
    ipcRenderer.on('audio-error', callback);
  },
  removeAudioDataListener: (callback: Function) => {
    ipcRenderer.removeListener('audio-data', callback);
  },
  removeAudioErrorListener: (callback: Function) => {
    ipcRenderer.removeListener('audio-error', callback);
  }
});
```

**Benefits of this approach:**
- Optimal performance with minimal data transfer
- UI responsiveness maintained
- Single processing instance for multiple windows

## Visualization Control

AudioWave provides simple controls for the visualization display (not the audio itself):

### Using Ref (Imperative)

```tsx
const audioWaveRef = useRef<AudioWaveController>(null);

// Basic visualization controls
audioWaveRef.current?.pause();  // Freeze display
audioWaveRef.current?.resume(); // Resume display
audioWaveRef.current?.clear();  // Clear waveform data

// State inspection methods
const isPaused = audioWaveRef.current?.isPaused(); // Check if paused
const state = audioWaveRef.current?.getState();    // Get current state: 'idle' | 'visualizing' | 'paused'
const audioData = audioWaveRef.current?.getAudioData(); // Get current audio data (Uint8Array)
```

#### AudioWaveController Methods

**Control Methods:**
- `pause()` - Pause visualization (freeze waveform display)
- `resume()` - Resume visualization from paused state
- `clear()` - Clear all waveform data and reset display

**State Methods:**
- `isPaused()` - Returns boolean indicating if visualization is paused
- `getState()` - Returns current state: `'idle'` | `'visualizing'` | `'paused'`
- `getAudioData()` - Returns current audio data as Uint8Array

### Using Props (Declarative)

```tsx
const [isPaused, setIsPaused] = useState(false);

<AudioWave
  source={source}
  isPaused={isPaused}  // Control via props
/>
```

**Important:** These controls only affect the visualization display, not your audio source.

## Amplitude Calculation Modes

AudioWave supports three different amplitude calculation methods for different visualization needs:

### Peak Mode (Default)

```tsx
<AudioWave source={source} amplitudeMode="peak" />
```

- **Best for**: General-purpose visualization, music, dynamic content
- **Behavior**: Uses peak amplitude values from frequency data
- **Characteristics**: High responsiveness, shows all audio peaks clearly
- **Backward compatible**: Default mode, maintains existing behavior

### RMS Mode (Perceptual Loudness)

```tsx
<AudioWave source={source} amplitudeMode="rms" />
```

- **Best for**: Voice analysis, broadcast audio, perceptual loudness matching
- **Behavior**: Root Mean Square calculation represents how humans perceive loudness
- **Characteristics**: Smoother visualization, better represents perceived volume
- **Quiet environments**: Enhanced with smooth noise floor transition
  - Range 1-9: Quiet signals with exponential scaling
  - Range 10+: Audible signals with logarithmic scaling
  - Natural baseline (1) represents environmental noise floor

### Adaptive Mode (Dynamic Scaling)

```tsx
<AudioWave source={source} amplitudeMode="adaptive" />
```

- **Best for**: Varying audio levels, automatic gain adjustment, mixed content
- **Behavior**: Dynamically adjusts scaling based on recent audio levels
- **Characteristics**: Automatically compensates for quiet or loud audio sources
- **Use case**: When audio levels vary significantly or are unpredictable

### Mode Switching Example

```tsx
import { useState } from 'react';
import { AudioWave, useAudioSource } from '@audiowave/react';

function AmplitudeModeDemo() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [amplitudeMode, setAmplitudeMode] = useState<'peak' | 'rms' | 'adaptive'>('peak');

  const { source } = useAudioSource({ source: mediaStream });

  return (
    <div>
      <AudioWave
        source={source}
        amplitudeMode={amplitudeMode}
        height={120}
        barWidth={2}
        gap={1}
      />

      <div>
        <label>Amplitude Mode:</label>
        <select
          value={amplitudeMode}
          onChange={(e) => setAmplitudeMode(e.target.value as any)}
        >
          <option value="peak">Peak (Default)</option>
          <option value="rms">RMS (Perceptual)</option>
          <option value="adaptive">Adaptive (Auto-scaling)</option>
        </select>
      </div>
    </div>
  );
}
```

## Best Practices

### Error Handling

```tsx
const { source, error } = useAudioSource({ source: mediaStream });

if (error) {
  return <div>Visualization error: {error.message}</div>;
}
```

### Important Usage Notes

#### Lazy Loading Audio Sources (Required for Proper Functionality)

When your audio source starts as `null` and is set later (common in user-initiated scenarios), you **must** memoize the `useAudioSource` options. Without this, the visualization will flicker and restart continuously, making it unusable:

**❌ WRONG - This will cause flickering:**

```tsx
function MyAudioApp() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // This creates a new options object on every render!
  const { source } = useMediaAudio({
    source: mediaStream,
    onError: (error) => console.error('Audio error:', error)
  });

  // ... rest of component
}
```

**✅ CORRECT - Memoize the options object:**

```tsx
function MyAudioApp() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Step 1: Memoize the onError callback
  const handleAudioError = useCallback((error: Error) => {
    console.error('Audio error:', error);
  }, []);

  // Step 2: Memoize the entire options object
  const audioSourceOptions = useMemo(() => ({
    source: mediaStream,
    onError: handleAudioError,
  }), [mediaStream, handleAudioError]);

  // Step 3: Use the memoized options
  const { source } = useMediaAudio(audioSourceOptions);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream); // This triggers re-render with new source
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <AudioWave source={source} />
    </div>
  );
}
```

**Why is this required?**
- Each render creates a new options object `{ source: mediaStream, onError: ... }`
- `useMediaAudio` sees this as a "change" and reinitializes the audio processing
- This causes the visualization to flicker and restart repeatedly, making it unusable
- This is not a performance issue - it's a functional requirement for proper operation

**Quick Reference - Copy this pattern:**

```tsx
// Always use this pattern for lazy-loaded audio sources
const handleError = useCallback((error: Error) => {
  console.error('Audio error:', error);
}, []);

const options = useMemo(() => ({
  source: yourAudioSource, // MediaStream | HTMLAudioElement | etc.
  onError: handleError,
}), [yourAudioSource, handleError]);

const { source } = useMediaAudio(options);
```

### Performance Optimization

#### Memoizing Component Props

```tsx
// Memoize AudioWave props for better performance
const audioWaveProps = useMemo(() => ({
  source,
  height: 200,
  barWidth: 2,
  gap: 1,
  backgroundColor: 'transparent',
  barColor: '#ffffff'
}), [source]);

return <AudioWave {...audioWaveProps} />;
```

### Responsive Design

```tsx
<AudioWave
  source={source}
  width="100%"
  height={window.innerWidth < 768 ? 80 : 120}
  style={{ maxWidth: '100%' }}
/>
```

## TypeScript Support

Full TypeScript support with comprehensive types:

```tsx
import type {
  AudioWaveProps,
  AudioWaveController,
  AudioSource,
  UseAudioSourceOptions
} from '@audiowave/react';
```

## Browser Support

- Chrome 66+ (March 2018)
- Firefox 60+ (May 2018)
- Safari 14+ (September 2020)
- Edge 79+ (January 2020)

Requires Web Audio API and MediaStream API support.

## License

MIT © [teomyth](https://github.com/teomyth)
