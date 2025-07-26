import type React from 'react';
import { ElectronAudioIcon, WebAudioIcon } from './Icons';

export type AudioSourceType = 'web' | 'desktop';

interface AudioSourceSelectorProps {
  current: AudioSourceType;
  onChange: (source: AudioSourceType) => void;
  disabled: boolean;
}

/**
 * Audio Source Selector Component
 *
 * Allows users to switch between Web Audio and Desktop Audio sources.
 * Uses distinct colors to indicate the active/inactive states.
 * Layout: horizontal with label on the left side of the selection buttons.
 */
export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  current,
  onChange,
  disabled,
}) => {
  const getTagStyle = (isActive: boolean, isDisabled = false) => ({
    padding: '4px 12px',
    border: isActive ? '1px solid #00bcd4' : '1px solid #444',
    borderRadius: '16px',
    backgroundColor: isActive ? 'rgba(0, 188, 212, 0.1)' : 'transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'color 0.2s ease, border-color 0.2s ease', // Only color transitions, no hover effects
    fontSize: '12px',
    fontWeight: '500',
    color: isActive ? '#00bcd4' : isDisabled ? '#666' : '#aaa',
    opacity: isDisabled ? 0.5 : 1,
    margin: '0 4px',
    transform: 'none', // Ensure no transform effects
    boxShadow: 'none', // Ensure no shadow effects
  });

  return (
    <div
      style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: '12px',
          color: '#888',
          whiteSpace: 'nowrap',
        }}
      >
        Audio Source:
      </div>

      {/* Source buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => onChange('desktop')}
          disabled={disabled}
          style={getTagStyle(current === 'desktop', disabled)}
          title="Desktop Audio - Uses system audio capture via Electron, low latency and high performance"
        >
          <ElectronAudioIcon size={14} />
          Desktop Audio
        </button>

        <button
          type="button"
          onClick={() => onChange('web')}
          disabled={disabled}
          style={getTagStyle(current === 'web', disabled)}
          title="Web Audio API - Uses browser standard audio interface, good compatibility, suitable for general audio needs"
        >
          <WebAudioIcon size={14} />
          Web Audio
        </button>
      </div>
    </div>
  );
};
