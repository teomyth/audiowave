import type React from 'react';
import { ColorPicker } from '../components/ColorPicker';
import { FormGroup } from '../components/FormGroup';
import type { ConfigChangeHandler, WaveColorConfig } from '../types';

export interface ColorSettingsProps {
  /** Current color configuration */
  config: WaveColorConfig;
  /** Configuration change handler */
  onChange: ConfigChangeHandler<WaveColorConfig>;
  /** Disabled state */
  disabled?: boolean;
}

export const ColorSettings: React.FC<ColorSettingsProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handleChange = (key: keyof WaveColorConfig, value: string) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <FormGroup title="Colors" disabled={disabled} columns={2}>
      <ColorPicker
        value={config.background}
        onChange={(value) => handleChange('background', value)}
        label="backgroundColor"
        tooltip="Canvas background color. Use 'transparent' to show through to parent container. Dark colors work best for audio visualization."
        disabled={disabled}
      />
      <ColorPicker
        value={config.primary}
        onChange={(value) => handleChange('primary', value)}
        label="barColor"
        tooltip="Main color for waveform bars. This is the primary visual element - choose a color that contrasts well with the background."
        disabled={disabled}
      />
      <ColorPicker
        value={config.secondary}
        onChange={(value) => handleChange('secondary', value)}
        label="secondaryBarColor"
        tooltip="Secondary color for visual effects and gradients. Currently used for bar highlighting and special animations when enabled."
        disabled={disabled}
      />
      <ColorPicker
        value={config.border}
        onChange={(value) => handleChange('border', value)}
        label="borderColor"
        tooltip="Container border color. Only visible when borderWidth > 0. Should contrast with both background and surrounding page content."
        disabled={disabled}
      />
    </FormGroup>
  );
};
