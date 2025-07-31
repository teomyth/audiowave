import type React from 'react';
import { type PropertyGroup, PropertyPanel } from '../components/PropertyPanel';
import type { AudioWaveConfig, ConfigChangeHandler } from '../types';

interface PropertyBasedSettingsProps {
  config: AudioWaveConfig;
  onChange: ConfigChangeHandler;
  disabled?: boolean;
}

export const PropertyBasedSettings: React.FC<PropertyBasedSettingsProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handlePropertyChange = (key: string, value: any) => {
    // Parse the key to determine which config section to update
    const [section, property] = key.split('.');

    switch (section) {
      case 'behavior':
        onChange({
          ...config,
          behavior: {
            ...config.behavior,
            [property]: value,
          },
        });
        break;
      case 'bars':
        onChange({
          ...config,
          bars: {
            ...config.bars,
            [property]: value,
          },
        });
        break;
      case 'colors':
        onChange({
          ...config,
          colors: {
            ...config.colors,
            [property]: value,
          },
        });
        break;
      case 'size':
        onChange({
          ...config,
          size: {
            ...config.size,
            [property]: value,
          },
        });
        break;
      default:
      // Silently ignore unknown config sections
    }
  };

  const propertyGroups: PropertyGroup[] = [
    {
      title: 'Audio Processing',
      items: [
        {
          key: 'behavior.amplitudeMode',
          name: 'amplitudeMode',
          type: 'select',
          value: config.behavior.amplitudeMode,
          options: [
            { value: 'peak', label: 'Peak', description: 'Traditional peak amplitude' },
            { value: 'rms', label: 'RMS', description: 'Perceptual loudness calculation' },
            {
              value: 'adaptive',
              label: 'Adaptive',
              description: 'Dynamic scaling for better visibility',
            },
          ],
          description:
            'Amplitude calculation mode: peak (traditional), rms (perceptual loudness), or adaptive (dynamic scaling)',
        },
      ],
    },
    {
      title: 'Visualization',
      items: [
        {
          key: 'behavior.fullscreen',
          name: 'fullscreen',
          type: 'boolean',
          value: config.behavior.fullscreen,
          description:
            'Enable fullscreen mode - expands waveform to fill entire container width and height',
        },
        {
          key: 'behavior.animateCurrentPick',
          name: 'animateCurrentPick',
          type: 'boolean',
          value: config.behavior.animateCurrentPick,
          description:
            'Animate the currently playing frequency - highlights the most recent audio data with visual emphasis',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          key: 'bars.gain',
          name: 'gain',
          type: 'number',
          value: config.bars.gain,
          min: 0.1,
          max: 10.0,
          step: 0.1,
          description:
            'Visualization gain multiplier for waveform amplitude (0.1-10.0) - amplifies the visual representation',
        },
        {
          key: 'bars.width',
          name: 'width',
          type: 'number',
          value: config.bars.width,
          min: 1,
          max: 8,
          step: 1,
          description:
            'Width of individual frequency bars in pixels (1-8) - controls bar thickness',
        },
        {
          key: 'bars.rounded',
          name: 'rounded',
          type: 'number',
          value: config.bars.rounded,
          min: 0,
          max: 10,
          step: 1,
          description:
            'Corner radius for rounded bar tops (0-10) - 0 for square bars, higher values for more rounded',
        },
        {
          key: 'bars.gap',
          name: 'gap',
          type: 'number',
          value: config.bars.gap,
          min: 0,
          max: 5,
          step: 1,
          description:
            'Space between frequency bars (0-5) - controls spacing between individual bars',
        },
        {
          key: 'bars.speed',
          name: 'speed',
          type: 'number',
          value: config.bars.speed,
          min: 1,
          max: 5,
          step: 1,
          description: 'Animation speed multiplier (1-5) - controls how fast the waveform updates',
        },
      ],
    },
    {
      title: 'Colors',
      items: [
        {
          key: 'colors.background',
          name: 'background',
          type: 'color',
          value: config.colors.background,
          description:
            'Background color of the wave container - the base color behind the waveform',
        },
        {
          key: 'colors.primary',
          name: 'primary',
          type: 'color',
          value: config.colors.primary,
          description: 'Primary color for frequency bars - the main color of the waveform bars',
        },
        {
          key: 'colors.secondary',
          name: 'secondary',
          type: 'color',
          value: config.colors.secondary,
          description: 'Secondary color for bar gradients - used for visual effects and gradients',
        },
        {
          key: 'colors.border',
          name: 'border',
          type: 'color',
          value: config.colors.border,
          description: 'Border color - color of the container border if borderWidth > 0',
        },
      ],
    },
    {
      title: 'Size',
      items: [
        {
          key: 'size.width',
          name: 'width',
          type: 'number',
          value: config.size.width,
          min: 100,
          max: 2000,
          description: 'Width in pixels (100-2000) - overall width of the waveform container',
        },
        {
          key: 'size.height',
          name: 'height',
          type: 'number',
          value: config.size.height,
          min: 50,
          max: 400,
          description: 'Height in pixels (50-400) - overall height of the waveform container',
        },
        {
          key: 'size.borderWidth',
          name: 'borderWidth',
          type: 'number',
          value: config.size.borderWidth,
          min: 0,
          max: 4,
          step: 1,
          description:
            'Border width in pixels (0-4) - thickness of the container border, 0 for no border',
        },
        {
          key: 'size.borderRadius',
          name: 'borderRadius',
          type: 'number',
          value: config.size.borderRadius,
          min: 0,
          max: 20,
          step: 1,
          description:
            'Border radius in pixels (0-20) - corner rounding of the container, 0 for square corners',
        },
      ],
    },
  ];

  return (
    <div>
      <PropertyPanel groups={propertyGroups} onChange={handlePropertyChange} disabled={disabled} />
    </div>
  );
};
