import type React from 'react';
import { FormGroup } from '../components/FormGroup';
import { Slider } from '../components/Slider';
import type { ConfigChangeHandler, WaveBarConfig } from '../types';

export interface BarSettingsProps {
  /** Current bar configuration */
  config: WaveBarConfig;
  /** Configuration change handler */
  onChange: ConfigChangeHandler<WaveBarConfig>;
  /** Disabled state */
  disabled?: boolean;
}

export const BarSettings: React.FC<BarSettingsProps> = ({ config, onChange, disabled = false }) => {
  const handleChange = (key: keyof WaveBarConfig, value: number) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <FormGroup title="Bars" disabled={disabled}>
      <Slider
        value={config.width}
        onChange={(value) => handleChange('width', value)}
        min={1}
        max={8}
        label="barWidth"
        tooltip="Width of each waveform bar in pixels. Larger values = thicker bars, fewer bars fit on screen."
        disabled={disabled}
      />
      <Slider
        value={config.gap}
        onChange={(value) => handleChange('gap', value)}
        min={0}
        max={5}
        label="gap"
        tooltip="Spacing between bars in pixels. Larger values = more space between bars, fewer bars fit on screen."
        disabled={disabled}
      />
      <Slider
        value={config.rounded}
        onChange={(value) => handleChange('rounded', value)}
        min={0}
        max={8}
        label="rounded"
        tooltip="Corner radius for bar tops in pixels. 0 = sharp corners, higher values = more rounded corners."
        disabled={disabled}
      />
      <Slider
        value={config.speed}
        onChange={(value) => handleChange('speed', value)}
        min={1}
        max={5}
        label="speed"
        tooltip="Animation update frequency. HIGHER values = SLOWER animation (longer intervals between updates). Lower values = faster, more responsive animation."
        disabled={disabled}
      />
      <Slider
        value={config.gain}
        onChange={(value) => handleChange('gain', value)}
        min={0.1}
        max={10.0}
        step={0.1}
        label="gain"
        tooltip="Visualization gain multiplier. Higher values amplify the waveform display. 1.0 = no gain, 2.0 = double amplitude."
        disabled={disabled}
      />
    </FormGroup>
  );
};
