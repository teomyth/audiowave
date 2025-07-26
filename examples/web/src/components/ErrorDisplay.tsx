import type React from 'react';

export interface ErrorDisplayProps {
  /** Error message to display */
  error: string;
  /** Optional callback to clear the error */
  onClear?: () => void;
  /** Custom className */
  className?: string;
  /** Whether to show as a top banner (fixed position) */
  isTopBanner?: boolean;
}

/**
 * ErrorDisplay Component
 *
 * A simple, reusable component for displaying error messages
 * with optional clear functionality. Can be displayed as a top banner
 * or inline error message.
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClear,
  className = '',
  isTopBanner = false,
}) => {
  const baseStyle = {
    backgroundColor: '#ff4444',
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
  };

  const bannerStyle = {
    ...baseStyle,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    borderRadius: '0',
    margin: '0',
    boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
  };

  const inlineStyle = {
    ...baseStyle,
    borderRadius: '6px',
    margin: '16px 0',
    boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
  };

  return (
    <div
      className={`error-display ${className}`}
      style={isTopBanner ? bannerStyle : inlineStyle}
      role="alert"
      aria-live="polite"
    >
      <span>{error}</span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '0 4px',
            marginLeft: '12px',
            borderRadius: '2px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Clear error"
          title="Clear error"
        >
          ×
        </button>
      )}
    </div>
  );
};
