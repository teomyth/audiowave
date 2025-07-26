import React from 'react';
import { Tooltip } from './Tooltip';

export interface ToggleProps {
  /** Current checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label: string;
  /** Optional tooltip text */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  tooltip,
  disabled = false,
  className = '',
  size = 'medium',
}) => {
  const id = React.useId();

  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '11px' },
    medium: { padding: '10px 16px', fontSize: '12px' },
    large: { padding: '12px 20px', fontSize: '14px' },
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`ui-toggle ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      <button
        id={id}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          ...sizeStyles[size],
          backgroundColor: checked ? '#00bcd4' : '#2a2a2a',
          color: checked ? '#000' : '#ccc',
          border: checked ? '1px solid #00bcd4' : '1px solid #444',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          boxShadow: checked ? '0 1px 2px rgba(0,188,212,0.3)' : 'none',
          opacity: disabled ? 0.5 : 1,
        }}
        aria-pressed={checked}
        aria-describedby={tooltip ? `${id}-tooltip` : undefined}
      >
        {label}
      </button>
      {tooltip && (
        <Tooltip content={tooltip} id={`${id}-tooltip`}>
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
  );
};
