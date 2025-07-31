import type React from 'react';
import { Toggle } from '../components/Toggle';
import type { ConfigChangeHandler, WaveBehaviorConfig } from '../types';
import { AmplitudeSettings } from './AmplitudeSettings';

export interface BehaviorSettingsProps {
  /** Current behavior configuration */
  config: WaveBehaviorConfig;
  /** Configuration change handler */
  onChange: ConfigChangeHandler<WaveBehaviorConfig>;
  /** Disabled state */
  disabled?: boolean;
}

export const BehaviorSettings: React.FC<BehaviorSettingsProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof WaveBehaviorConfig, value: string | boolean) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '16px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <Toggle
          checked={config.fullscreen}
          onChange={(value) => handleChange('fullscreen', value)}
          label="fullscreen"
          tooltip="Expand waveform to fill entire container width and height. When enabled, ignores width/height settings and uses 100% of available space."
          disabled={disabled}
        />
        <Toggle
          checked={config.animateCurrentPick}
          onChange={(value) => handleChange('animateCurrentPick', value)}
          label="animateCurrentPick"
          tooltip="Highlight the most recent audio data with visual emphasis. Creates a moving indicator showing the current playback position in real-time."
          disabled={disabled}
        />
      </div>

      <AmplitudeSettings config={config} onChange={handleChange} disabled={disabled} />
    </div>
  );
};
