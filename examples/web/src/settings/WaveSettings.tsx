import type React from 'react';
import { useState } from 'react';
import { BarSettings } from './settings/BarSettings';
import { BehaviorSettings } from './settings/BehaviorSettings';
import { ColorSettings } from './settings/ColorSettings';
import { PropertyBasedSettings } from './settings/PropertyBasedSettings';
import { SizeSettings } from './settings/SizeSettings';
import type { AudioWaveConfig, ConfigChangeHandler } from './types';
import { DEFAULT_WAVE_CONFIG } from './types';

export interface WaveSettingsProps {
  /** Current configuration */
  config: AudioWaveConfig;
  /** Configuration change handler */
  onChange: ConfigChangeHandler<AudioWaveConfig>;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Custom title */
  title?: string;
}

/**
 * WaveSettings
 *
 * A comprehensive settings panel for configuring AudioWave properties.
 * This component provides a clean interface for adjusting size, bar properties,
 * colors, and behavior settings. It's designed to be reusable across different
 * environments (Web Demo, Electron, etc.).
 */
export const WaveSettings: React.FC<WaveSettingsProps> = ({
  config,
  onChange,
  disabled = false,
  className = '',
  title = 'AudioWave Settings',
}) => {
  const [usePropertyPanel, setUsePropertyPanel] = useState(false);
  const handleSizeChange = (sizeConfig: typeof config.size) => {
    onChange({
      ...config,
      size: sizeConfig,
    });
  };

  const handleBarChange = (barConfig: typeof config.bars) => {
    onChange({
      ...config,
      bars: barConfig,
    });
  };

  const handleColorChange = (colorConfig: typeof config.colors) => {
    onChange({
      ...config,
      colors: colorConfig,
    });
  };

  const handleBehaviorChange = (behaviorConfig: typeof config.behavior) => {
    onChange({
      ...config,
      behavior: behaviorConfig,
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_WAVE_CONFIG);
  };

  return (
    <div
      className={`wave-settings ${className}`}
      style={{
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '16px',
        margin: '0 auto',
        maxWidth: '1000px',
        backgroundColor: '#1a1a1a',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: '0',
            color: disabled ? '#666' : '#00bcd4',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setUsePropertyPanel(!usePropertyPanel)}
            disabled={disabled}
            style={{
              padding: '6px 12px',
              backgroundColor: usePropertyPanel ? '#00bcd4' : '#444',
              color: usePropertyPanel ? '#000' : '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {usePropertyPanel ? 'Grid View' : 'Property Panel'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled}
            style={{
              padding: '8px 16px',
              backgroundColor: '#444',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = '#00bcd4';
                e.currentTarget.style.borderColor = '#00bcd4';
                e.currentTarget.style.color = '#000';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = '#444';
                e.currentTarget.style.borderColor = '#555';
                e.currentTarget.style.color = '#fff';
              }
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Settings Content */}
      {usePropertyPanel ? (
        <PropertyBasedSettings config={config} onChange={onChange} disabled={disabled} />
      ) : (
        <>
          {/* Settings Groups Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // 减小最小宽度以适应小屏幕
              gap: '12px',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <SizeSettings config={config.size} onChange={handleSizeChange} disabled={disabled} />
            <BarSettings config={config.bars} onChange={handleBarChange} disabled={disabled} />
            <ColorSettings
              config={config.colors}
              onChange={handleColorChange}
              disabled={disabled}
            />
          </div>

          {/* Behavior Settings - Full Width Row */}
          <BehaviorSettings
            config={config.behavior}
            onChange={handleBehaviorChange}
            disabled={disabled}
          />
        </>
      )}
    </div>
  );
};
