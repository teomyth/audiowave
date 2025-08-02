import type React from 'react';
import { useAudioConfig } from '../contexts/AudioConfigContext';
import './AudioConfigPanel.css';

interface AudioConfigPanelProps {
  disabled?: boolean;
  isRunning?: boolean;
}

export const AudioConfigPanel: React.FC<AudioConfigPanelProps> = ({
  disabled = false,
  isRunning = false,
}) => {
  const { config, updateConfig, resetConfig } = useAudioConfig();

  const sampleRateOptions = [
    { value: 8000, label: '8kHz' },
    { value: 16000, label: '16kHz' },
    { value: 22050, label: '22.05kHz' },
    { value: 44100, label: '44.1kHz' },
    { value: 48000, label: '48kHz' },
  ];

  const channelCountOptions = [
    { value: 1, label: 'Mono' },
    { value: 2, label: 'Stereo' },
  ];

  const sampleSizeOptions = [
    { value: 8, label: '8-bit' },
    { value: 16, label: '16-bit' },
    { value: 24, label: '24-bit' },
    { value: 32, label: '32-bit' },
  ];

  const isDisabled = disabled || isRunning;

  return (
    <div className={`audio-source-config ${isDisabled ? 'disabled' : ''}`}>
      {/* Status indicator when running */}
      {isRunning && (
        <div className="config-status">
          <span className="status-indicator">●</span>
          Audio settings cannot be changed while recording
        </div>
      )}

      {/* Horizontal layout for the 3 main parameters */}
      <div className="config-row">
        <div className="config-item">
          <label htmlFor="config-sample-rate">Sample Rate</label>
          <select
            id="config-sample-rate"
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

        <div className="config-item">
          <label htmlFor="config-sample-size">Sample Size</label>
          <select
            id="config-sample-size"
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

        <div className="config-item">
          <label htmlFor="config-channel-count">Channel Count</label>
          <select
            id="config-channel-count"
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
          className="reset-btn"
          title="Reset to default values"
          disabled={isDisabled}
        >
          ↻
        </button>
      </div>
    </div>
  );
};
