import type React from 'react';
import { useRef, useState } from 'react';
import type { AudioSourceConfig, AudioSourceType } from '../hooks/useAudio';
import { Toggle } from '../settings/components/Toggle';
import type { AudioProcessingOptions } from '../types/audioProcessing';
import './AudioSourceSelector.css';

interface AudioSourceSelectorProps {
  sourceType: AudioSourceType;
  onSourceTypeChange: (type: AudioSourceType) => void;
  onStart: (config?: AudioSourceConfig) => Promise<void>;
  isActive: boolean;
  error: string | null;
  audioProcessing: AudioProcessingOptions;
  onAudioProcessingChange: (options: AudioProcessingOptions) => void;
}

// Local audio files available in the demo
const LOCAL_AUDIO_FILES = [
  {
    name: 'Harvard Sentences',
    url: '/audio/harvard.wav',
    description: 'Classic speech sample for audio testing',
    type: 'speech' as const,
  },
];

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  sourceType,
  onSourceTypeChange,
  onStart,
  isActive,
  // error,
  audioProcessing,
  onAudioProcessingChange,
}) => {
  const [audioUrl, setAudioUrl] = useState(LOCAL_AUDIO_FILES[0]?.url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string>(
    LOCAL_AUDIO_FILES[0]?.url || ''
  );
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceTypeChange = (type: AudioSourceType) => {
    onSourceTypeChange(type);
    // Clear previous selections
    setSelectedFile(null);
    setAudioUrl('');
    setSelectedLocalFile('');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Auto-start when a file is selected
      if (!isActive) {
        const config: AudioSourceConfig = {
          sourceType,
          file: file,
          url: undefined,
        };
        await onStart(config);
      }
    }
  };

  const handleLocalFileSelect = async (url: string) => {
    setSelectedLocalFile(url);
    setAudioUrl(url);

    // Auto-start when a demo file is selected
    if (!isActive) {
      const config: AudioSourceConfig = {
        sourceType,
        file: undefined,
        url: url,
      };
      await onStart(config);
    }
  };

  // const handleStart = async () => {
  //   const config: AudioSourceConfig = {
  //     sourceType,
  //     file: selectedFile || undefined,
  //     url: audioUrl || undefined,
  //   };

  //   await onStart(config);
  // };

  // const canStart = () => {
  //   switch (sourceType) {
  //     case 'microphone':
  //       return true;
  //     case 'audioFile':
  //       return selectedFile !== null;
  //     case 'audioUrl':
  //       return audioUrl.trim() !== '';
  //     default:
  //       return false;
  //   }
  // };

  return (
    <div className="audio-source-selector">
      {/* Compact Header with Source Selection */}
      <div className="selector-header">
        <div className="header-content">
          <h3>Audio Source</h3>
          <div className="source-tabs">
            <button
              type="button"
              className={`source-tab ${sourceType === 'microphone' ? 'active' : ''}`}
              onClick={() => !isActive && handleSourceTypeChange('microphone')}
              disabled={isActive}
            >
              🎤 Mic
            </button>
            <button
              type="button"
              className={`source-tab ${sourceType === 'audioFile' ? 'active' : ''}`}
              onClick={() => !isActive && handleSourceTypeChange('audioFile')}
              disabled={isActive}
            >
              📁 File
            </button>
            <button
              type="button"
              className={`source-tab ${sourceType === 'audioUrl' ? 'active' : ''}`}
              onClick={() => !isActive && handleSourceTypeChange('audioUrl')}
              disabled={isActive}
            >
              🌐 URL
            </button>
          </div>
        </div>
      </div>

      {/* Compact Source-specific Controls */}
      <div className="source-controls">
        {sourceType === 'microphone' && (
          <>
            <div className="compact-info">
              <span className="info-icon">ℹ️</span>
              <span>Browser will request microphone permission</span>
            </div>

            {/* Audio Processing Options */}
            <div className="audio-processing-options" style={{ marginTop: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '12px',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Toggle
                  checked={audioProcessing.echoCancellation}
                  onChange={(checked) =>
                    onAudioProcessingChange({
                      ...audioProcessing,
                      echoCancellation: checked,
                    })
                  }
                  label="Echo Cancellation"
                  tooltip="Removes echo and feedback from microphone input"
                  disabled={isActive}
                  size="small"
                />

                <Toggle
                  checked={audioProcessing.autoGainControl}
                  onChange={(checked) =>
                    onAudioProcessingChange({
                      ...audioProcessing,
                      autoGainControl: checked,
                    })
                  }
                  label="Auto Gain Control"
                  tooltip="Automatically adjusts microphone gain level"
                  disabled={isActive}
                  size="small"
                />

                <Toggle
                  checked={audioProcessing.noiseSuppression}
                  onChange={(checked) =>
                    onAudioProcessingChange({
                      ...audioProcessing,
                      noiseSuppression: checked,
                    })
                  }
                  label="Noise Suppression"
                  tooltip="Reduces background noise from microphone input"
                  disabled={isActive}
                  size="small"
                />
              </div>
            </div>
          </>
        )}

        {sourceType === 'audioFile' && (
          <div className="compact-control">
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              disabled={isActive}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="compact-file-button"
              onClick={() => {
                audioFileInputRef.current?.click();
              }}
              disabled={isActive}
            >
              {selectedFile ? (
                <>
                  <span className="file-icon">🎵</span>
                  <span className="file-info">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </>
              ) : (
                <>
                  <span className="upload-icon">📁</span>
                  <span>Choose Audio File</span>
                </>
              )}
            </button>
          </div>
        )}

        {sourceType === 'audioUrl' && (
          <div className="compact-control">
            <div className="url-options">
              <div className="demo-files">
                <span className="label">Demo Files:</span>
                {LOCAL_AUDIO_FILES.map((file) => (
                  <button
                    type="button"
                    key={file.url}
                    className={`demo-file-button ${selectedLocalFile === file.url ? 'selected' : ''}`}
                    onClick={() => !isActive && handleLocalFileSelect(file.url)}
                    disabled={isActive}
                    title={file.description}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              <div className="custom-url">
                <input
                  type="url"
                  placeholder="Or enter custom URL..."
                  value={selectedLocalFile ? '' : audioUrl}
                  onChange={(e) => {
                    setAudioUrl(e.target.value);
                    setSelectedLocalFile('');
                  }}
                  disabled={isActive}
                  className="compact-url-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
