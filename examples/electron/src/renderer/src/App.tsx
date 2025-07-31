import { useIPCAudio } from '@audiowave/electron/renderer';
import { AudioWave, type AudioWaveController } from '@audiowave/react';
// Import playground components and settings
import {
  AudioControls,
  type AudioWaveConfig,
  DEFAULT_WAVE_CONFIG,
  ErrorDisplay,
  useWebAudio,
  WaveSettings,
} from '@audiowave/web-example';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioSourceSelector, type AudioSourceType } from './components/AudioSourceSelector';
import { WaveformIcon } from './components/WaveformIcon';
import { useElectronAudioControl } from './hooks/useElectronAudioControl';

function App() {
  const [config, setConfig] = useState<AudioWaveConfig>(DEFAULT_WAVE_CONFIG);
  const [audioSourceType, setAudioSourceType] = useState<AudioSourceType>('desktop');

  // Setup scroll behavior: let html handle scrolling
  useEffect(() => {
    // HTML handles scrolling with auto show/hide scrollbars
    document.documentElement.style.overflow = 'auto'; // HTML handles scrolling
    document.documentElement.style.overflowY = 'auto'; // Show only when needed
    document.documentElement.style.overflowX = 'hidden'; // Disable horizontal scroll
    document.documentElement.style.height = '100%'; // Fill viewport

    // Body doesn't handle scrolling, let content expand naturally
    document.body.style.overflow = 'visible'; // Body doesn't scroll
    document.body.style.height = 'auto'; // Auto height
    document.body.style.minHeight = '100vh'; // Minimum height is viewport height
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    console.log('HTML 滚动方案已应用');
  }, []);

  const controllerRef = useRef<AudioWaveController>(null);

  // Audio hooks
  // webAudio uses WebAudioSource (new architecture)
  const webAudio = useWebAudio();

  // For desktop audio, we need two separate hooks:
  // 1. Data access hook (simplified)
  const desktopAudioData = useIPCAudio();
  // 2. Device control hook (demo level)
  const desktopAudioControl = useElectronAudioControl();

  // Select the appropriate hooks based on source type
  const audioHook =
    audioSourceType === 'web'
      ? webAudio
      : {
          ...desktopAudioData,
          ...desktopAudioControl,
        };

  // Remove debug tests for production

  // Enhanced control handlers with AudioWave component control
  const handlePause = useCallback(() => {
    // Pause the AudioWave component FIRST, before changing hook status
    if (controllerRef.current) {
      controllerRef.current.pause();
    }

    // Then pause the audio hook
    audioHook.pause();
  }, [audioHook]);

  const handleResume = useCallback(() => {
    audioHook.resume();
    // Resume the AudioWave component as well
    if (controllerRef.current) {
      controllerRef.current.resume();
    }
  }, [audioHook]);

  const handleStop = useCallback(() => {
    audioHook.stop();
    // Clear the AudioWave component when stopping
    controllerRef.current?.clear();
  }, [audioHook]);

  const handleClear = useCallback(() => {
    // Clear waveform data while keeping audio active
    controllerRef.current?.clear();
  }, []);

  // Handle config changes
  const handleConfigChange = useCallback((newConfig: Partial<AudioWaveConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <>
      {/* Override WaveSettings width restrictions */}
      <style>
        {`
          .electron-wave-settings .wave-settings {
            max-width: none !important;
            margin: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
        `}
      </style>
      <div
        style={{
          padding: '20px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxSizing: 'border-box',
          width: '100%',
          // 完全移除高度限制，让内容自然撑开
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            borderBottom: '1px solid #333',
            paddingBottom: '20px',
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
              <WaveformIcon size={20} color="#00bcd4" />
              AudioWave
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '14px' }}>
              Electron Playground - High-Performance Audio Visualization
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a
              href="https://github.com/teomyth/audiowave"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.2s ease',
              }}
              title="View on GitHub"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@audiowave/react"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.2s ease',
              }}
              title="View on NPM"
            >
              NPM
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Audio Visualization */}
          <div
            style={{
              margin: '0 0 20px 0',
              width: '100%',
            }}
          >
            <AudioWave
              ref={controllerRef}
              source={audioHook.status === 'idle' ? undefined : audioHook.source || undefined}
              isPaused={audioHook.status === 'paused'}
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
              amplitudeMode={config.behavior.amplitudeMode}
              gain={config.bars.gain}
              showBorder={config.size.borderWidth > 0}
              borderColor={config.colors.border}
              borderWidth={config.size.borderWidth}
              borderRadius={config.size.borderRadius}
              placeholder={<WaveformIcon size={48} color="#666" />}
              showPlaceholderBackground={true}
            />
          </div>

          {/* Audio Source Selection */}
          <AudioSourceSelector
            current={audioSourceType}
            onChange={setAudioSourceType}
            disabled={audioHook.status !== 'idle'}
          />

          {/* Audio Controls - Reuse playground component */}
          <div style={{ marginBottom: '20px' }}>
            <AudioControls
              status={audioHook.status}
              onStart={audioHook.start}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onClear={handleClear}
            />
          </div>

          {/* Error Display */}
          {audioHook.error && (
            <div style={{ marginBottom: '20px' }}>
              <ErrorDisplay error={audioHook.error} onClear={audioHook.clearError} />
            </div>
          )}

          {/* Settings Panel */}
          <div style={{ width: '100%' }}>
            <WaveSettings
              config={config}
              onChange={handleConfigChange}
              className="electron-wave-settings"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
