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
    padding: '10px 16px',
    border: isActive ? '2px solid #00bcd4' : '2px solid #444',
    borderRadius: '8px',
    backgroundColor: isActive ? 'rgba(0, 188, 212, 0.15)' : '#2a2a2a',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    fontWeight: '500',
    color: isActive ? '#00bcd4' : isDisabled ? '#666' : '#e0e0e0',
    opacity: isDisabled ? 0.5 : 1,
    minWidth: '140px',
    boxShadow: isActive ? '0 0 0 1px rgba(0, 188, 212, 0.3)' : 'none',
    ':hover':
      !isDisabled && !isActive
        ? {
            backgroundColor: '#333',
            borderColor: '#555',
          }
        : {},
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '18px',
        backgroundColor: '#1e1e1e',
        borderRadius: '10px',
        border: '1px solid #333',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Label */}
      <div>
        <div
          style={{
            fontSize: '13px',
            color: '#e0e0e0',
            fontWeight: '500',
            textAlign: 'left',
            marginBottom: '4px',
          }}
        >
          Audio Source
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#888',
            textAlign: 'left',
          }}
        >
          Choose your audio input method
        </div>
      </div>

      {/* Source buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => onChange('desktop')}
          disabled={disabled}
          style={getTagStyle(current === 'desktop', disabled)}
          title="Desktop Audio - System audio capture with low latency"
        >
          <ElectronAudioIcon size={16} />
          Desktop Audio
        </button>

        <button
          type="button"
          onClick={() => onChange('web')}
          disabled={disabled}
          style={getTagStyle(current === 'web', disabled)}
          title="Web Audio API - Browser-based audio interface"
        >
          <WebAudioIcon size={16} />
          Web Audio
        </button>
      </div>
    </div>
  );
};
