import type { AudioDataProvider } from '@audiowave/core';
import { AudioWave, type AudioWaveController, useCustomAudio } from '@audiowave/react';
// Import playground components and settings
import {
  AudioControls,
  type AudioWaveConfig,
  DEFAULT_WAVE_CONFIG,
  ErrorDisplay,
  PropertyBasedSettings,
  SplitPane,
  useWebAudio,
} from '@audiowave/web-example';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AudioSourceSelector, type AudioSourceType } from './components/AudioSourceSelector';
import { AudioWaveIcon, GitHubIcon, NPMIcon } from './components/Icons';
import { WaveformIcon } from './components/WaveformIcon';
import { useAudioControl } from './hooks/useAudioControl';

// Create Electron audio provider - cached to prevent recreation
const createElectronProvider = (): AudioDataProvider => ({
  onAudioData: (callback) => {
    return (window as any).electronAPI.onAudioData((_deviceId: string, data: Uint8Array) => {
      callback(data);
    });
  },
  onAudioError: (callback) => {
    return (window as any).electronAPI.onAudioError((_deviceId: string, error: string) => {
      callback(error);
    });
  },
});

function App() {
  // AudioWave configuration state
  const [config, setConfig] = useState<AudioWaveConfig>(DEFAULT_WAVE_CONFIG);
  const [audioSourceType, setAudioSourceType] = useState<AudioSourceType>('desktop');

  // AudioWave component ref for imperative control
  const audioWaveRef = useRef<AudioWaveController>(null);

  // Audio hooks
  // webAudio uses WebAudioSource (new architecture)
  const webAudio = useWebAudio();

  // Desktop audio: data access and device control
  // Use useMemo to prevent provider recreation (React best practice)
  const electronProvider = useMemo(() => createElectronProvider(), []);
  const desktopAudioData = useCustomAudio({
    provider: electronProvider,
    deviceId: 'default',
  });
  const desktopAudioControl = useAudioControl({ deviceId: 'default' });

  // Select the appropriate hooks based on source type
  const audioHook =
    audioSourceType === 'web'
      ? webAudio
      : {
          ...desktopAudioData,
          ...desktopAudioControl,
        };

  // Enhanced control handlers with AudioWave component control
  const handlePause = useCallback(() => {
    // Pause the AudioWave component FIRST, before changing hook status
    if (audioWaveRef.current) {
      audioWaveRef.current.pause();
    }

    // Then pause the audio hook (note: for desktop audio, this only changes UI state)
    if ('pause' in audioHook) {
      audioHook.pause();
    }
  }, [audioHook]);

  const handleResume = useCallback(() => {
    if ('resume' in audioHook) {
      audioHook.resume();
    }
    // Resume the AudioWave component as well
    if (audioWaveRef.current) {
      audioWaveRef.current.resume();
    }
  }, [audioHook]);

  const handleStop = useCallback(() => {
    audioHook.stop();
    // Clear the AudioWave component when stopping
    audioWaveRef.current?.clear();
  }, [audioHook]);

  const handleClear = useCallback(() => {
    // Clear waveform data while keeping audio active
    audioWaveRef.current?.clear();
  }, []);

  // Enhanced control handlers with AudioWave component control
  const handleStart = useCallback(
    async (config?: any) => {
      await audioHook.start(config);
      // AudioWave will automatically start when source is provided
    },
    [audioHook]
  );

  // Create placeholder component (memoized to prevent unnecessary re-renders)
  const placeholder = useMemo(() => <AudioWaveIcon size={48} />, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Error Banner */}
      {audioHook.error && (
        <ErrorDisplay error={audioHook.error} onClear={audioHook.clearError} isTopBanner={true} />
      )}

      {/* Compact Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #333',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)', // Keep in line with the overall background
          flexShrink: 0,
          marginTop: audioHook.error ? '60px' : '0',
        }}
      >
        <div style={{ textAlign: 'left', alignSelf: 'flex-start' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#00bcd4',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'flex-start', // Make sure the content is left-hand
            }}
          >
            <WaveformIcon size={20} color="#00bcd4" />
            AudioWave
          </h1>
          <p
            style={{
              margin: '4px 0 0 0',
              color: '#888',
              fontSize: '12px',
              textAlign: 'left', // Make sure the subtitle is on the left as well
            }}
          >
            Electron - High-Performance Audio Visualization
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a
            href="https://github.com/teomyth/audiowave"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#ccc',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s ease',
            }}
            title="View on GitHub"
          >
            <GitHubIcon size={40} /> {/* Further enlarge the icon size */}
          </a>
          <a
            href="https://www.npmjs.com/package/@audiowave/react"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.2s ease',
            }}
            title="View on NPM"
          >
            <NPMIcon size={44} /> {/* Further enlarge the icon size */}
          </a>
        </div>
      </div>

      {/* Main Content Area with Split Pane */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SplitPane
          left={
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '2px solid #333',
                  backgroundColor: '#222',
                  flexShrink: 0,
                }}
              >
                <h3
                  style={{
                    margin: '0',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#e0e0e0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Properties
                </h3>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <PropertyBasedSettings config={config} onChange={setConfig} />
              </div>
            </div>
          }
          right={
            <div
              style={{ height: '100%', padding: '20px', display: 'flex', flexDirection: 'column' }}
            >
              {/* Audio Source Selector */}
              <div style={{ marginBottom: '24px', width: '100%' }}>
                <AudioSourceSelector
                  current={audioSourceType}
                  onChange={setAudioSourceType}
                  disabled={audioHook.status !== 'idle'}
                />
              </div>

              {/* Waveform Display Area */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '24px', // Keeps consistent with AudioSource spacing
                  minHeight: '200px', // Make sure there is enough display space
                }}
              >
                <AudioWave
                  ref={audioWaveRef}
                  source={audioHook.status === 'idle' ? undefined : audioHook.source || undefined}
                  isPaused={audioHook.status === 'paused'}
                  width="100%"
                  height={config.size.height}
                  backgroundColor={config.colors.background}
                  barColor={config.colors.primary}
                  secondaryBarColor={config.colors.secondary}
                  barWidth={config.bars.width}
                  gap={config.bars.gap}
                  rounded={config.bars.rounded}
                  speed={config.bars.speed}
                  animateCurrentPick={config.behavior.animateCurrentPick}
                  fullscreen={config.behavior.fullscreen}
                  amplitudeMode={config.behavior.amplitudeMode}
                  gain={config.bars.gain}
                  showBorder={config.size.borderWidth > 0}
                  borderColor={config.colors.border}
                  borderWidth={config.size.borderWidth}
                  borderRadius={config.size.borderRadius}
                  placeholder={placeholder}
                  showPlaceholderBackground={true}
                />
              </div>

              {/* Audio Controls - Immediately after waveform display */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <AudioControls
                  status={audioHook.status}
                  onStart={handleStart}
                  onPause={handlePause}
                  onResume={handleResume}
                  onStop={handleStop}
                  onClear={handleClear}
                />
              </div>

              {/* Bottom fill space */}
              <div style={{ flex: 1 }} />
            </div>
          }
          defaultLeftWidth={320}
          minLeftWidth={300}
          maxLeftWidth={450}
        />
      </div>
    </div>
  );
}

export default App;
