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
  /** External status control (optional) */
  status?: AudioStatus;
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
  const { provider, deviceId = 'default', status: externalStatus } = options;
  const [internalStatus, setInternalStatus] = useState<AudioStatus>('idle'); // Start as idle

  // Use external status if provided, otherwise use internal status
  const status = externalStatus || internalStatus;
  const [error, setError] = useState<string | null>(null);
  const audioSourceRef = useRef<AudioSource | null>(null);
  const currentAudioDataRef = useRef<Uint8Array | null>(null);
  // CRITICAL: Use state for source so React re-renders when it changes
  const [source, setSource] = useState<AudioSource | null>(null);

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
    // CRITICAL: Set source state to trigger React re-render
    setSource(audioSource);

    // Listen for audio data from provider
    const unsubscribeData = provider.onAudioData((data: Uint8Array) => {
      currentAudioDataRef.current = data;
    });

    // Listen for errors from provider (if supported)
    const unsubscribeError = provider.onAudioError?.((errorMessage: string) => {
      setError(errorMessage);
      // Only set internal status if no external status is provided
      if (!externalStatus) {
        setInternalStatus('idle');
      }
    });

    return () => {
      unsubscribeData?.();
      unsubscribeError?.();
      currentAudioDataRef.current = null;
      // Clear source when cleaning up
      setSource(null);
    };
  }, [provider, status, externalStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    isActive,
    source, // Return state instead of ref for reactivity
    error,
    deviceId,
    clearError,
  };
}
