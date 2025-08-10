import { AudioWave, type AudioWaveController } from '@audiowave/react';
import { useCallback, useRef, useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { ErrorDisplay } from './components/ErrorDisplay';
import { GitHubIcon, NPMIcon } from './components/Icons';
import { SplitPane } from './components/SplitPane';
import { WaveformIcon } from './components/WaveformIcon';
import { useAudio } from './hooks/useAudio';
import type { AudioWaveConfig } from './settings';
import { DEFAULT_WAVE_CONFIG } from './settings';
import { PropertyBasedSettings } from './settings/settings/PropertyBasedSettings';
import { type AudioProcessingOptions, DEFAULT_AUDIO_PROCESSING } from './types/audio';
import './App.css';

function App() {
  // AudioWave configuration state
  const [config, setConfig] = useState<AudioWaveConfig>(DEFAULT_WAVE_CONFIG);

  // Audio processing options state
  const [audioProcessing, setAudioProcessing] =
    useState<AudioProcessingOptions>(DEFAULT_AUDIO_PROCESSING);

  // AudioWave component ref for imperative control
  const audioWaveRef = useRef<AudioWaveController>(null);

  // Audio hook with multi-source support
  const {
    status,
    source,
    error,
    sourceType,
    start,
    pause,
    resume,
    stop,
    clearError,
    setSourceType,
  } = useAudio();

  // Enhanced control handlers with AudioWave component control
  const handleStart = useCallback(
    async (config?: any) => {
      await start({
        ...config,
        audioProcessing,
      });
      // AudioWave will automatically start when source is provided
    },
    [start, audioProcessing]
  );

  const handlePause = useCallback(() => {
    pause();
    // Pause the AudioWave component as well
    audioWaveRef.current?.pause();
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
    // Resume the AudioWave component as well
    audioWaveRef.current?.resume();
  }, [resume]);

  const handleStop = useCallback(() => {
    stop();
    // Clear the AudioWave component when stopping
    audioWaveRef.current?.clear();
  }, [stop]);

  // const handleClear = useCallback(() => {
  //   // Clear waveform data while keeping audio active
  //   audioWaveRef.current?.clear();
  // }, []);

  // AudioWave state change handler
  const handleAudioWaveStateChange = useCallback((_state: string) => {
    // Handle state changes if needed
  }, []);

  // Check if we can start based on audio source selection
  const canStart = useCallback(() => {
    switch (sourceType) {
      case 'microphone':
        return true;
      case 'audioFile':
        // This would need to check if a file is selected
        // For now, return true as a placeholder
        return true;
      case 'audioUrl':
        // This would need to check if a URL is entered
        // For now, return true as a placeholder
        return true;
      default:
        return false;
    }
  }, [sourceType]);

  // Placeholder removed - no default icon needed

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Error Banner */}
      {error && <ErrorDisplay error={error} onClear={clearError} isTopBanner={true} />}

      {/* Compact Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #333',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)', // Consistent with overall background
          flexShrink: 0,
          marginTop: error ? '60px' : '0',
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
              justifyContent: 'flex-start', // Ensure content aligns left
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
              textAlign: 'left', // Ensure subtitle also aligns left
            }}
          >
            Real-time Audio Visualization
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
            <GitHubIcon size={40} /> {/* Further increase icon size */}
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
            <NPMIcon size={44} /> {/* Further increase icon size */}
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
              <div style={{ marginBottom: '20px', width: '100%' }}>
                <AudioSourceSelector
                  sourceType={sourceType}
                  onSourceTypeChange={setSourceType}
                  onStart={handleStart}
                  isActive={status === 'active'}
                  error={error}
                  audioProcessing={audioProcessing}
                  onAudioProcessingChange={setAudioProcessing}
                />
              </div>

              {/* Waveform Display Area */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '16px', // Reduce bottom margin
                  minHeight: '200px', // Ensure sufficient display space
                }}
              >
                <AudioWave
                  ref={audioWaveRef}
                  source={source || undefined}
                  isPaused={status === 'paused'}
                  onStateChange={handleAudioWaveStateChange}
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
                  showPlaceholderBackground={true}
                />
              </div>

              {/* Audio Controls - Right after waveform display */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <AudioControls
                  status={status}
                  onStart={handleStart}
                  onPause={handlePause}
                  onResume={handleResume}
                  onStop={handleStop}
                  onClear={() => audioWaveRef.current?.clear()}
                  disabled={!canStart() && status === 'idle'}
                />
              </div>

              {/* Bottom padding space */}
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
