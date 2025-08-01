import React, { useRef, useState } from 'react';

interface NumberSpinnerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const NumberSpinner: React.FC<NumberSpinnerProps> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const clampValue = (val: number): number => {
    return Math.max(min, Math.min(max, val));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseFloat(newValue);
    if (!Number.isNaN(numValue)) {
      const clampedValue = clampValue(numValue);
      onChange(clampedValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (Number.isNaN(numValue)) {
      setInputValue(formatValue(value));
    } else {
      const clampedValue = clampValue(numValue);
      setInputValue(formatValue(clampedValue));
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
  };

  const formatValue = React.useCallback(
    (val: number): string => {
      // Display as integer if value or step is integer
      if (step >= 1 && val % 1 === 0) {
        return val.toString();
      }
      // Otherwise keep appropriate decimal places
      return val.toFixed(step < 1 ? 1 : 0);
    },
    [step]
  );

  const handleIncrement = () => {
    const newValue = clampValue(value + step);
    onChange(newValue);
    setInputValue(formatValue(newValue));
  };

  const handleDecrement = () => {
    const newValue = clampValue(value - step);
    onChange(newValue);
    setInputValue(formatValue(newValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  React.useEffect(() => {
    setInputValue(formatValue(value));
  }, [value, formatValue]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '4px 24px 4px 8px', // Leave space on right for buttons
          fontSize: '12px',
          border: '1px solid #444',
          borderRadius: '3px',
          backgroundColor: '#2a2a2a',
          color: '#e0e0e0',
          outline: 'none',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
        }}
      />

      {/* Up/down arrow buttons */}
      <div
        style={{
          position: 'absolute',
          right: '2px',
          top: '2px',
          bottom: '2px',
          display: 'flex',
          flexDirection: 'column',
          width: '18px',
        }}
      >
        {/* Up arrow */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#888',
            cursor: disabled || value >= max ? 'not-allowed' : 'pointer',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px 2px 0 0',
            opacity: disabled || value >= max ? 0.3 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && value < max) {
              e.currentTarget.style.backgroundColor = '#444';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ▲
        </button>

        {/* Down arrow */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#888',
            cursor: disabled || value <= min ? 'not-allowed' : 'pointer',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0 0 2px 2px',
            opacity: disabled || value <= min ? 0.3 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && value > min) {
              e.currentTarget.style.backgroundColor = '#444';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ▼
        </button>
      </div>
    </div>
  );
};
