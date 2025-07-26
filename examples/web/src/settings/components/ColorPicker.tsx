import React from 'react';
import { Tooltip } from './Tooltip';

export interface ColorPickerProps {
  /** Current color value */
  value: string;
  /** Color change handler */
  onChange: (color: string) => void;
  /** Label text */
  label: string;
  /** Optional tooltip text */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  tooltip,
  disabled = false,
  className = '',
}) => {
  const colorId = React.useId();
  const textId = React.useId();

  const handleColorChange = (newColor: string) => {
    if (!disabled) {
      onChange(newColor);
    }
  };

  return (
    <div
      className={`ui-color-picker ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px', // 减少间距
        minWidth: '60px',
        flex: '1 1 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          height: '12px', // 减少高度
          minWidth: 0,
        }}
      >
        <label
          htmlFor={colorId}
          style={{
            fontSize: '11px',
            color: disabled ? '#666' : '#00bcd4',
            fontWeight: '700',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: '14px',
            cursor: disabled ? 'not-allowed' : 'default',
            minWidth: 0, // 允许收缩
            flex: '1 1 auto', // 弹性布局
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
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <input
          id={colorId}
          type="color"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            height: '18px',
            border: 'none',
            borderRadius: '3px',
            backgroundColor: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <input
          id={textId}
          type="text"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '2px 4px',
            fontSize: '10px',
            backgroundColor: disabled ? '#1a1a1a' : '#333',
            color: disabled ? '#666' : '#fff',
            border: '1px solid #555',
            borderRadius: '2px',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  );
};
