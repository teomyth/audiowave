import type { AudioSource } from '@audiowave/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Note: Window.electronAPI types should be defined by the demo application
// This library should not define global types

export type AudioStatus = 'idle' | 'active' | 'paused';

/**
 * Options for useIPCAudio hook
 */
export interface UseIPCAudioOptions {
  /** Device ID to use for audio capture (default: 'default') */
  deviceId?: string;
}

/**
 * Data-only interface for audio hooks
 * This interface focuses only on data transmission, not device control
 */
export interface AudioReturn {
  status: AudioStatus;
  isActive: boolean;
  source: AudioSource | null;  // Changed from audioSource to source
  error: string | null;
  deviceId: string;
  clearError: () => void;
}

/**
 * IPC Audio Data Hook
 *
 * This hook provides ONLY data transmission functionality via IPC.
 * Device control (start/stop/pause/resume) should be handled by the application layer.
 *
 * The application should:
 * 1. Call electronAPI.setupAudioStream() to setup data transmission
 * 2. Call electronAPI.start() to start device
 * 3. Use this hook to access the audio data
 */
export function useIPCAudio(options: UseIPCAudioOptions = {}): AudioReturn {
  const deviceId = options.deviceId || 'default';
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const audioSourceRef = useRef<AudioSource | null>(null);

  const isActive = status === 'active';

  // Check if Electron API is available
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (typeof window !== 'undefined' && electronAPI) {
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
      setError('Electron API not available');
    }
  }, []);

  // Setup audio data stream when available
  useEffect(() => {
    if (!isAvailable) return;

    const electronAPI = (window as any).electronAPI;
    let isSubscribed = true;

    const setupAudioStream = async () => {
      try {
        // Setup audio stream for data transmission
        await electronAPI.setupAudioStream({
          deviceId,
          bufferSize: 1024,
          fftSize: 2048,
        });

        if (isSubscribed) {
          setStatus('active');
        }
      } catch (err) {
        if (isSubscribed) {
          setError(`Failed to setup audio stream: ${err}`);
          setStatus('idle');
        }
      }
    };

    setupAudioStream();

    return () => {
      isSubscribed = false;
    };
  }, [deviceId, isAvailable]);

  // Listen for audio data
  useEffect(() => {
    if (!isAvailable) return;

    const electronAPI = (window as any).electronAPI;
    let currentAudioData: Uint8Array | null = null;

    // Create a simple audio source that provides the data
    const audioSource: AudioSource = {
      getAudioData: () => {
        return currentAudioData;
      },
      isActive: () => status === 'active',
    };

    audioSourceRef.current = audioSource;

    // Listen for audio data from main process
    const unsubscribeData = electronAPI.onAudioData?.((receivedDeviceId: string, data: Uint8Array) => {
      if (receivedDeviceId === deviceId) {
        // Update the current audio data
        currentAudioData = data;
      }
    });

    // Listen for errors from main process
    const unsubscribeError = electronAPI.onAudioError?.((receivedDeviceId: string, errorMessage: string) => {
      if (receivedDeviceId === deviceId) {
        setError(errorMessage);
        setStatus('idle');
      }
    });

    return () => {
      unsubscribeData?.();
      unsubscribeError?.();
    };
  }, [deviceId, isAvailable, status]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    isActive,
    source: audioSourceRef.current,  // Changed from audioSource to source
    error,
    deviceId,
    clearError,
  };
}

// Backward compatibility exports
export const useRemoteAudio = useIPCAudio;
export const useNativeAudio = useIPCAudio;
export type UseRemoteAudioOptions = UseIPCAudioOptions;
export type UseNativeAudioOptions = UseIPCAudioOptions;
