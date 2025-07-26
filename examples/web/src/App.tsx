import { AudioWave, type AudioWaveController } from '@audiowave/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import { ErrorDisplay } from './components/ErrorDisplay';
import { DEFAULT_AUDIO_PROCESSING, type AudioProcessingOptions } from './types/audioProcessing';
import { AudioWaveIcon, GitHubIcon, NPMIcon } from './components/Icons';
import { WaveformIcon } from './components/WaveformIcon';
import { useAudio } from './hooks/useAudio';
import type { AudioWaveConfig } from './settings';
import { DEFAULT_WAVE_CONFIG, WaveSettings } from './settings';
import './App.css';

function App() {
  // AudioWave configuration state
  const [config, setConfig] = useState<AudioWaveConfig>(DEFAULT_WAVE_CONFIG);

  // Audio processing options state
  const [audioProcessing, setAudioProcessing] = useState<AudioProcessingOptions>(DEFAULT_AUDIO_PROCESSING);

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

  // Create placeholder component (memoized to prevent unnecessary re-renders)
  const placeholder = useMemo(() => <AudioWaveIcon size={48} />, []);

  return (
    <>
      {/* Top Error Banner */}
      {error && <ErrorDisplay error={error} onClear={clearError} isTopBanner={true} />}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          marginTop: error ? '60px' : '0', // Add top margin when error banner is shown
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#00bcd4',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <WaveformIcon size={24} color="#00bcd4" />
            AudioWave
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '14px' }}>
            High-performance real-time audio visualization
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            <GitHubIcon size={32} />
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
            <NPMIcon size={40} />
          </a>
        </div>
      </div>

      {/* Audio Source Selector - Top Priority */}
      <AudioSourceSelector
        sourceType={sourceType}
        onSourceTypeChange={setSourceType}
        onStart={handleStart}
        isActive={status === 'active'}
        error={error}
        audioProcessing={audioProcessing}
        onAudioProcessingChange={setAudioProcessing}
      />

      {/* Waveform Display Area - Second Priority */}
      <div
        style={{
          margin: '0 0 20px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AudioWave
          ref={audioWaveRef}
          source={source || undefined}
          isPaused={status === 'paused'}
          onStateChange={handleAudioWaveStateChange}
          width={`${config.size.width}%`}
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
          gain={config.bars.gain}
          showBorder={config.size.borderWidth > 0}
          borderColor={config.colors.border}
          borderWidth={config.size.borderWidth}
          borderRadius={config.size.borderRadius}
          placeholder={placeholder}
          showPlaceholderBackground={true}
        />
      </div>

      {/* Audio Controls with Beautiful SVG Icons */}
      <div style={{ marginBottom: '20px' }}>
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

      {/* Wave Settings */}
      <WaveSettings config={config} onChange={setConfig} title="AudioWave Settings" />
    </>
  );
}

export default App;
