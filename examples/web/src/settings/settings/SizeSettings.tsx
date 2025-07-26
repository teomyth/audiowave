import type React from 'react';
import { FormGroup } from '../components/FormGroup';
import { Slider } from '../components/Slider';
import type { ConfigChangeHandler, WaveSizeConfig } from '../types';

export interface SizeSettingsProps {
  /** Current size configuration */
  config: WaveSizeConfig;
  /** Configuration change handler */
  onChange: ConfigChangeHandler<WaveSizeConfig>;
  /** Disabled state */
  disabled?: boolean;
}

export const SizeSettings: React.FC<SizeSettingsProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof WaveSizeConfig, value: number) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <FormGroup title="Size & Border" disabled={disabled}>
      <Slider
        value={config.width}
        onChange={(value) => handleChange('width', value)}
        min={10}
        max={100}
        label="width"
        tooltip="Waveform container width as percentage (10-100%). Higher values = wider display, more bars visible. Ignored when fullscreen is enabled."
        disabled={disabled}
      />
      <Slider
        value={config.height}
        onChange={(value) => handleChange('height', value)}
        min={50}
        max={400}
        label="height"
        tooltip="Waveform container height in pixels (50-400px). Higher values = taller bars, more dramatic amplitude visualization. Ignored when fullscreen is enabled."
        disabled={disabled}
      />
      <Slider
        value={config.borderWidth}
        onChange={(value) => handleChange('borderWidth', value)}
        min={0}
        max={4}
        label="borderWidth"
        tooltip="Border thickness around waveform container in pixels. 0 = no border, higher values = thicker border frame."
        disabled={disabled}
      />
      <Slider
        value={config.borderRadius}
        onChange={(value) => handleChange('borderRadius', value)}
        min={0}
        max={20}
        label="borderRadius"
        tooltip="Corner roundness of container border in pixels. 0 = sharp corners, higher values = more rounded corners. Only visible when borderWidth > 0."
        disabled={disabled}
      />
    </FormGroup>
  );
};
