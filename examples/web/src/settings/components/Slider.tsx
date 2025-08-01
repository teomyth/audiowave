import React from 'react';
import { Tooltip } from './Tooltip';

// Slider styles injection
const sliderStyles = `
  .ui-slider input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 2px;
    background: #444;
    outline: none;
    border-radius: 1px;
    cursor: pointer;
  }

  .ui-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00bcd4;
    cursor: pointer;
    border: 1px solid #333;
  }

  .ui-slider input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00bcd4;
    cursor: pointer;
    border: 1px solid #333;
  }
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.querySelector('#ui-slider-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'ui-slider-styles';
  styleSheet.textContent = sliderStyles;
  document.head.appendChild(styleSheet);
}

export interface SliderProps {
  /** Current value */
  value: number;
  /** Value change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Label text */
  label: string;
  /** Optional tooltip text */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  tooltip,
  disabled = false,
  className = '',
}) => {
  const id = React.useId();

  return (
    <div
      className={`ui-slider ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} // Reduce spacing
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          height: '12px', // Reduce height
        }}
      >
        <label
          htmlFor={id}
          style={{
            fontSize: '11px',
            color: disabled ? '#666' : '#00bcd4',
            fontWeight: '700',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: '14px',
            cursor: disabled ? 'not-allowed' : 'default',
            minWidth: 0,
            flex: '1 1 auto',
          }}
        >
          {label}
        </label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <span
              style={{
                marginLeft: '7px',
                color: '#00bcd4',
                cursor: 'help',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              &#9432;
            </span>
          </Tooltip>
        )}
      </div>
      <div
        style={{
          backgroundColor: disabled ? '#1a1a1a' : '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '4px',
          padding: '4px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: disabled ? '#666' : '#fff',
            marginBottom: '2px',
            fontWeight: '600',
          }}
        >
          {value}
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          style={{
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
      </div>
    </div>
  );
};
