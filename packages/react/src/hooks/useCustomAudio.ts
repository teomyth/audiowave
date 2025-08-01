import type { AudioDataProvider } from '@audiowave/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioSource } from '../types';

export type AudioStatus = 'idle' | 'active' | 'paused';

/**
 * Options for useCustomAudio hook
 */
export interface UseCustomAudioOptions {
  /** Audio data provider implementation */
  provider: AudioDataProvider;
  /** Device ID to use for audio capture (default: 'default') */
  deviceId?: string;
}

/**
 * Data-only interface for audio hooks - exactly like original useIPCAudio
 */
export interface CustomAudioReturn {
  status: AudioStatus;
  isActive: boolean;
  source: AudioSource | null;
  error: string | null;
  deviceId: string;
  clearError: () => void;
}

/**
 * Custom Audio Data Hook
 *
 * Provides audio data access through Provider pattern.
 * Device control should be handled separately by the application.
 */
export function useCustomAudio(options: UseCustomAudioOptions): CustomAudioReturn {
  const { provider, deviceId = 'default' } = options;
  const [status, setStatus] = useState<AudioStatus>('active'); // Start as active
  const [error, setError] = useState<string | null>(null);
  const audioSourceRef = useRef<AudioSource | null>(null);
  const currentAudioDataRef = useRef<Uint8Array | null>(null);

  const isActive = status === 'active';

  // Setup audio source and data listener
  useEffect(() => {
    if (!provider) {
      setError('Audio provider not available');
      return;
    }

    // Create simple audio source directly in hook
    const audioSource: AudioSource = {
      getAudioData: () => currentAudioDataRef.current,
      isActive: () => status === 'active',
    };

    audioSourceRef.current = audioSource;

    // Listen for audio data from provider
    const unsubscribeData = provider.onAudioData((data: Uint8Array) => {
      currentAudioDataRef.current = data;
    });

    // Listen for errors from provider (if supported)
    const unsubscribeError = provider.onAudioError?.((errorMessage: string) => {
      setError(errorMessage);
      setStatus('idle');
    });

    return () => {
      unsubscribeData?.();
      unsubscribeError?.();
      currentAudioDataRef.current = null;
    };
  }, [provider, status]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    isActive,
    source: audioSourceRef.current,
    error,
    deviceId,
    clearError,
  };
}
