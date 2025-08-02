import { useCallback, useState } from 'react';
import { useAudioConfig } from '../contexts/AudioConfigContext';

export type AudioStatus = 'idle' | 'active' | 'paused';

export interface AudioControlOptions {
  /** Device ID to control (default: 'default') */
  deviceId?: string;
}

export interface AudioControlReturn {
  status: AudioStatus;
  isActive: boolean;
  error: string | null;
  deviceId: string;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for controlling desktop audio device
 */
export function useAudioControl(options: AudioControlOptions = {}): AudioControlReturn {
  const deviceId = options.deviceId || 'default';
  const { config } = useAudioConfig();
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isActive = status === 'active';

  const start = useCallback(async () => {
    const electronAPI = (window as unknown as { electronAPI?: any }).electronAPI;
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      setError(null);

      // Setup audio stream using current config from context
      await electronAPI.setupAudioStream(config, deviceId);

      // Start audio capture for specific device
      await electronAPI.startAudio(deviceId);

      setStatus('active');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to start audio:', err);
      setError(errorMessage);
      throw err;
    }
  }, [deviceId, config]);

  const pause = useCallback(() => {
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('active');
    }
  }, [status]);

  const stop = useCallback(async () => {
    const electronAPI = (window as unknown as { electronAPI?: any }).electronAPI;
    if (electronAPI) {
      try {
        await electronAPI.stopAudio(deviceId);
      } catch (err) {
        console.error('Failed to stop audio:', err);
      }
    }
    setStatus('idle');
  }, [deviceId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    isActive,
    error,
    deviceId,
    start,
    pause,
    resume,
    stop,
    clearError,
  };
}
