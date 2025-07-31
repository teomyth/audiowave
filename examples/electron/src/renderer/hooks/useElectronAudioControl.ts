import { useCallback, useState } from 'react';

export type AudioStatus = 'idle' | 'active' | 'paused';

export interface ElectronAudioControlOptions {
  /** Device ID to control (default: 'default') */
  deviceId?: string;
}

export interface ElectronAudioControlReturn {
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
 * Hook for controlling Electron audio device
 * This handles the device control that was removed from useNativeAudio
 */
export function useElectronAudioControl(
  options: ElectronAudioControlOptions = {}
): ElectronAudioControlReturn {
  const deviceId = options.deviceId || 'default';
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isActive = status === 'active';

  const start = useCallback(async () => {
    const electronAPI = (window as { electronAPI?: any }).electronAPI;
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      setError(null);

      // Create audio buffer with simplified configuration
      const config = {
        sampleRate: 44100,
        bufferSize: 1024,
        channels: 1,
      };

      // Setup audio stream for specific device
      await electronAPI.setupAudioStream(config, deviceId);

      // Start audio capture for specific device
      await electronAPI.startAudio(deviceId);

      setStatus('active');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to start Electron audio:', err);
      setError(errorMessage);
      throw err;
    }
  }, [deviceId]);

  const pause = useCallback(() => {
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('active');
    }
  }, [status]);

  const stop = useCallback(async () => {
    const electronAPI = (window as { electronAPI?: any }).electronAPI;
    if (electronAPI) {
      try {
        await electronAPI.stopAudio(deviceId);
      } catch (err) {
        console.error('Failed to stop Electron audio:', err);
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
