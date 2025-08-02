import React, { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

export interface AudioCaptureConfig {
  sampleRate: number;
  sampleSize: 8 | 16 | 24 | 32;
  channelCount: number;
}

export interface AudioConfigContextType {
  config: AudioCaptureConfig;
  updateConfig: (updates: Partial<AudioCaptureConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_AUDIO_CONFIG: AudioCaptureConfig = {
  sampleRate: 48000, // 48kHz sample rate - high quality
  sampleSize: 16, // 16-bit sample size
  channelCount: 1, // Mono audio
};

const AudioConfigContext = createContext<AudioConfigContextType | undefined>(undefined);

export interface AudioConfigProviderProps {
  children: ReactNode;
  initialConfig?: Partial<AudioCaptureConfig>;
}

export const AudioConfigProvider: React.FC<AudioConfigProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<AudioCaptureConfig>({
    ...DEFAULT_AUDIO_CONFIG,
    ...initialConfig,
  });

  const updateConfig = useCallback((updates: Partial<AudioCaptureConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_AUDIO_CONFIG, ...initialConfig });
  }, [initialConfig]);

  const value: AudioConfigContextType = {
    config,
    updateConfig,
    resetConfig,
  };

  return <AudioConfigContext.Provider value={value}>{children}</AudioConfigContext.Provider>;
};

export const useAudioConfig = (): AudioConfigContextType => {
  const context = useContext(AudioConfigContext);
  if (!context) {
    throw new Error('useAudioConfig must be used within an AudioConfigProvider');
  }
  return context;
};

// Export default config for other components that might need it
export { DEFAULT_AUDIO_CONFIG };
