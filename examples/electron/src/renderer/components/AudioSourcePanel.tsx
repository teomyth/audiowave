import type React from 'react';
import { useAudioConfig } from '../contexts/AudioConfigContext';
import type { AudioSourceType } from './AudioSourceSelector';
import './AudioSourcePanel.css';

interface AudioSourcePanelProps {
  audioSourceType: AudioSourceType;
  onAudioSourceChange: (type: AudioSourceType) => void;
  disabled?: boolean;
  isRunning?: boolean;
}

export const AudioSourcePanel: React.FC<AudioSourcePanelProps> = ({
  audioSourceType,
  onAudioSourceChange,
  disabled = false,
  isRunning = false,
}) => {
  const { config, updateConfig, resetConfig } = useAudioConfig();

  const sampleRateOptions = [
    { value: 8000, label: '8kHz' },
    { value: 16000, label: '16kHz' },
    { value: 22050, label: '22kHz' },
    { value: 44100, label: '44kHz' },
    { value: 48000, label: '48kHz' },
  ];

  const sampleSizeOptions = [
    { value: 8, label: '8-bit' },
    { value: 16, label: '16-bit' },
    { value: 24, label: '24-bit' },
    { value: 32, label: '32-bit' },
  ];

  const channelCountOptions = [
    { value: 1, label: 'Mono' },
    { value: 2, label: 'Stereo' },
  ];

  const isDisabled = disabled || isRunning;

  return (
    <div className={`audio-source-panel ${isDisabled ? 'disabled' : ''}`}>
      {/* Compact Header with Tabs */}
      <div className="selector-header">
        <div className="header-content">
          <h3>Audio Source</h3>
          <div className="source-tabs">
            <button
              type="button"
              className={`source-tab ${audioSourceType === 'desktop' ? 'active' : ''}`}
              onClick={() => onAudioSourceChange('desktop')}
              disabled={isDisabled}
            >
              🎤 Desktop
            </button>
            <button
              type="button"
              className={`source-tab ${audioSourceType === 'web' ? 'active' : ''}`}
              onClick={() => onAudioSourceChange('web')}
              disabled={isDisabled}
            >
              🌐 Web
            </button>
          </div>
        </div>
      </div>

      {/* Compact Source Controls - Fixed Height */}
      <div className="source-controls">
        {/* Desktop Audio Controls */}
        {audioSourceType === 'desktop' && (
          <div className="desktop-controls">
            {/* Compact Configuration Row */}
            <div className="compact-config-row">
              <div className="compact-config-item">
                <label htmlFor="sample-rate">Sample Rate</label>
                <select
                  id="sample-rate"
                  value={config.sampleRate}
                  onChange={(e) => updateConfig({ sampleRate: Number(e.target.value) })}
                  disabled={isDisabled}
                >
                  {sampleRateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="compact-config-item">
                <label htmlFor="sample-size">Sample Size</label>
                <select
                  id="sample-size"
                  value={config.sampleSize}
                  onChange={(e) =>
                    updateConfig({ sampleSize: Number(e.target.value) as 8 | 16 | 24 | 32 })
                  }
                  disabled={isDisabled}
                >
                  {sampleSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="compact-config-item">
                <label htmlFor="channel-count">Channel Count</label>
                <select
                  id="channel-count"
                  value={config.channelCount}
                  onChange={(e) => updateConfig({ channelCount: Number(e.target.value) })}
                  disabled={isDisabled}
                >
                  {channelCountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={resetConfig}
                className="compact-reset-btn"
                title="Reset to default values"
                disabled={isDisabled}
              >
                ↻
              </button>
            </div>
          </div>
        )}

        {/* Web Audio Controls */}
        {audioSourceType === 'web' && (
          <div className="web-controls">
            {/* Web Audio Format Information */}
            <div
              style={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#2196f3',
                lineHeight: '1.5',
              }}
            >
              <div style={{ marginBottom: '4px' }}>
                🎵 <strong>Web Audio Format:</strong> Browser Default (typically 48kHz / 16-bit /
                Mono)
              </div>
              <div>
                ℹ️ <strong>Note:</strong> Browser controls audio format. Check console for actual
                values.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
