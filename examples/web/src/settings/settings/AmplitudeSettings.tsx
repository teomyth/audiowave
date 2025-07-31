import type React from 'react';
import { ButtonGroup } from '../components/ButtonGroup';
import type { WaveBehaviorConfig } from '../types';

interface AmplitudeSettingsProps {
  config: WaveBehaviorConfig;
  onChange: (key: keyof WaveBehaviorConfig, value: string) => void;
  disabled?: boolean;
}

const amplitudeModeOptions = [
  {
    value: 'peak',
    label: 'Peak',
    description: 'Peak amplitude - current behavior, good for general use',
  },
  {
    value: 'rms',
    label: 'RMS',
    description: 'RMS for perceptual loudness - better represents how humans hear sound',
  },
  {
    value: 'adaptive',
    label: 'Adaptive',
    description: 'Adaptive scaling - prevents loud sounds from making normal sounds invisible',
  },
];

export const AmplitudeSettings: React.FC<AmplitudeSettingsProps> = ({
  config,
  onChange: handleChange,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px',
        width: '100%',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <h4
          style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#e0e0e0',
          }}
        >
          Amplitude Calculation Mode
        </h4>
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#a0a0a0',
            lineHeight: '1.4',
          }}
        >
          Choose how audio amplitude is calculated. Changes take effect immediately.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <ButtonGroup
          value={config.amplitudeMode}
          onChange={(value) => handleChange('amplitudeMode', value)}
          options={amplitudeModeOptions}
          disabled={disabled}
        />
      </div>

      <div
        style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#1a1a1a',
          borderRadius: '6px',
          border: '1px solid #333',
        }}
      >
        <h5
          style={{
            margin: '0 0 8px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#e0e0e0',
          }}
        >
          Mode Details:
        </h5>
        <ul
          style={{
            margin: '0',
            paddingLeft: '16px',
            fontSize: '12px',
            color: '#b0b0b0',
            lineHeight: '1.5',
          }}
        >
          <li>
            <strong>Peak:</strong> Traditional method, shows maximum amplitude in each frame
          </li>
          <li>
            <strong>RMS:</strong> Shows perceived loudness, better for speech and music
          </li>
          <li>
            <strong>Adaptive:</strong> Automatically adjusts to prevent loud sounds from
            overwhelming quiet ones
          </li>
        </ul>
      </div>
    </div>
  );
};
