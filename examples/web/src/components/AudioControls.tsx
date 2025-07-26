import type React from 'react';
import type { AudioStatus } from '../hooks/useAudio';
import { ClearIcon, PauseIcon, ResumeIcon, StopIcon } from './AudioIcons';
import { MicrophoneIcon } from './Icons';

interface AudioControlsProps {
  status: AudioStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClear?: () => void;
  disabled?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onClear,
  disabled = false,
}) => {
  const getButtonStyle = (isDisabled = false) => ({
    width: '48px',
    height: '48px',
    border: 'none',
    borderRadius: '50%',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    margin: '0 6px',
    opacity: isDisabled ? 0.3 : 1,
    boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.2)',
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, hoverColor: string) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = hoverColor;
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, originalColor: string) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = originalColor;
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const startButtonStyle = {
    ...getButtonStyle(disabled),
    backgroundColor: '#00aa00',
    color: '#fff',
  };

  const pauseButtonStyle = {
    ...getButtonStyle(disabled),
    backgroundColor: '#00bcd4',
    color: '#000',
  };

  const stopButtonStyle = (isDisabled = false) => ({
    ...getButtonStyle(isDisabled || disabled),
    backgroundColor: '#cc0000',
    color: '#fff',
  });

  const resumeButtonStyle = {
    ...getButtonStyle(disabled),
    backgroundColor: '#00aa00',
    color: '#fff',
  };

  const clearButtonStyle = {
    ...getButtonStyle(disabled),
    backgroundColor: '#00bcd4',
    color: '#000',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {status === 'idle' && (
        <>
          <button
            type="button"
            onClick={onStart}
            disabled={disabled}
            style={startButtonStyle}
            title="Start Audio"
            onMouseEnter={(e) => handleMouseEnter(e, '#00cc00')}
            onMouseLeave={(e) => handleMouseLeave(e, '#00aa00')}
          >
            <MicrophoneIcon size={24} />
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={true}
            style={stopButtonStyle(true)}
            title="Stop Audio (Disabled)"
          >
            <StopIcon size={24} />
          </button>
        </>
      )}

      {status === 'active' && (
        <>
          <button
            type="button"
            onClick={onPause}
            disabled={disabled}
            style={pauseButtonStyle}
            title="Pause Audio"
            onMouseEnter={(e) => handleMouseEnter(e, '#00acc1')}
            onMouseLeave={(e) => handleMouseLeave(e, '#00bcd4')}
          >
            <PauseIcon size={24} />
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={disabled}
            style={stopButtonStyle()}
            title="Stop Audio"
            onMouseEnter={(e) => handleMouseEnter(e, '#dd0000')}
            onMouseLeave={(e) => handleMouseLeave(e, '#cc0000')}
          >
            <StopIcon size={24} />
          </button>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              style={clearButtonStyle}
              title="Clear Waveform"
              onMouseEnter={(e) => handleMouseEnter(e, '#00acc1')}
              onMouseLeave={(e) => handleMouseLeave(e, '#00bcd4')}
            >
              <ClearIcon size={24} />
            </button>
          )}
        </>
      )}

      {status === 'paused' && (
        <>
          <button
            type="button"
            onClick={onResume}
            disabled={disabled}
            style={resumeButtonStyle}
            title="Resume Audio"
            onMouseEnter={(e) => handleMouseEnter(e, '#00cc00')}
            onMouseLeave={(e) => handleMouseLeave(e, '#00aa00')}
          >
            <ResumeIcon size={24} />
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={disabled}
            style={stopButtonStyle()}
            title="Stop Audio"
            onMouseEnter={(e) => handleMouseEnter(e, '#dd0000')}
            onMouseLeave={(e) => handleMouseLeave(e, '#cc0000')}
          >
            <StopIcon size={24} />
          </button>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              style={clearButtonStyle}
              title="Clear Waveform"
              onMouseEnter={(e) => handleMouseEnter(e, '#00acc1')}
              onMouseLeave={(e) => handleMouseLeave(e, '#00bcd4')}
            >
              <ClearIcon size={24} />
            </button>
          )}
        </>
      )}
    </div>
  );
};
