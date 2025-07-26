import type React from 'react';
import { MicrophoneIcon, StopIcon } from './Icons';

export interface AudioButtonProps {
  /** Whether audio is currently active */
  isActive: boolean;
  /** Click handler for the button */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * AudioButton Component
 *
 * A specialized button for controlling audio.
 * Shows different icons and styles based on audio state.
 */
export const AudioButton: React.FC<AudioButtonProps> = ({
  isActive,
  onClick,
  disabled = false,
  className = '',
}) => {
  const buttonStyle: React.CSSProperties = {
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    opacity: disabled ? 0.6 : 1,
    ...(isActive
      ? {
          backgroundColor: '#ff4444',
          color: '#fff',
        }
      : {
          backgroundColor: '#00bcd4',
          color: '#000',
        }),
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      if (isActive) {
        e.currentTarget.style.backgroundColor = '#ff6666';
      } else {
        e.currentTarget.style.backgroundColor = '#00acc1';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      if (isActive) {
        e.currentTarget.style.backgroundColor = '#ff4444';
      } else {
        e.currentTarget.style.backgroundColor = '#00bcd4';
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`audio-button ${className}`}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={isActive ? 'Stop audio' : 'Start audio'}
    >
      {isActive ? (
        <>
          <StopIcon size={20} />
          Stop Audio
        </>
      ) : (
        <>
          <MicrophoneIcon size={20} />
          Start Audio
        </>
      )}
    </button>
  );
};
