/**
 * useAudioSource Hook
 *
 * Universal React hook for managing any audio source for visualization.
 * Supports MediaStream, HTMLMediaElement, AudioNode, and custom AudioSource implementations.
 * Does NOT create audio sources - only manages existing ones for pure visualization.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { WebAudioSource } from '../sources/WebAudioSource';
import type { AudioSource } from '../types/AudioSource';

// Union type for all supported audio source types
export type AudioSourceInput =
  | MediaStream
  | HTMLMediaElement
  | HTMLAudioElement
  | HTMLVideoElement
  | AudioNode
  | AudioSource
  | null;

export interface UseMediaAudioOptions {
  /** Audio source to manage (any supported type) */
  source?: AudioSourceInput;
  /** Callback function triggered on error */
  onError?: (error: Error) => void;
}

export interface UseMediaAudioReturn {
  /** Standardized AudioSource for AudioWave component */
  source: AudioSource | null;
  /** Any error that occurred */
  error: Error | null;
}

/**
 * Universal audio source management hook
 *
 * Perfect for integrating with external recording software, media players,
 * or any application that already has audio sources and just needs visualization.
 */
export function useMediaAudio(options: UseMediaAudioOptions = {}): UseMediaAudioReturn {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // ========================================
  // REFS
  // ========================================

  const webAudioSourceRef = useRef<WebAudioSource | null>(null);
  const isExternalAudioSource = useRef<boolean>(false);

  // ========================================
  // AUDIO SOURCE CONVERSION
  // ========================================

  const convertToAudioSource = useCallback(
    async (input: AudioSourceInput): Promise<AudioSource | null> => {
      if (!input) return null;

      // If it's already an AudioSource, use it directly
      if (typeof input === 'object' && 'getAudioData' in input && 'isActive' in input) {
        isExternalAudioSource.current = true;
        return input as AudioSource;
      }

      // Convert other types to AudioSource using WebAudioSource
      try {
        const webAudioSource = new WebAudioSource();

        if (input instanceof MediaStream) {
          await webAudioSource.initializeFromMediaStream(input);
        } else if (
          input instanceof HTMLMediaElement ||
          input instanceof HTMLAudioElement ||
          input instanceof HTMLVideoElement
        ) {
          await webAudioSource.initializeFromMediaElement(input);
        } else if ('context' in input && typeof input.connect === 'function') {
          // AudioNode
          await webAudioSource.initializeFromAudioNode(input as AudioNode);
        } else {
          throw new Error(`Unsupported audio source type: ${typeof input}`);
        }

        webAudioSourceRef.current = webAudioSource;
        isExternalAudioSource.current = false;
        return webAudioSource;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        return null;
      }
    },
    [options]
  );

  // ========================================
  // EFFECTS
  // ========================================

  // Handle source changes
  useEffect(() => {
    let mounted = true;

    const setupSource = async () => {
      try {
        setError(null);

        // Cleanup previous WebAudioSource if it was created by us
        if (webAudioSourceRef.current && !isExternalAudioSource.current) {
          webAudioSourceRef.current.destroy();
          webAudioSourceRef.current = null;
        }

        const newAudioSource = await convertToAudioSource(options.source ?? null);

        if (mounted) {
          setAudioSource(newAudioSource);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          options.onError?.(error);
        }
      }
    };

    setupSource();

    return () => {
      mounted = false;
    };
  }, [options.source, convertToAudioSource, options]);

  // ========================================
  // CLEANUP
  // ========================================

  useEffect(() => {
    return () => {
      // Only cleanup WebAudioSource if we created it
      if (webAudioSourceRef.current && !isExternalAudioSource.current) {
        webAudioSourceRef.current.destroy();
      }
    };
  }, []);

  return {
    source: audioSource,
    error,
  };
}

// ========================================
// CONVENIENCE HOOKS FOR SPECIFIC TYPES
// ========================================

/**
 * Hook specifically for MediaStream sources
 */
export function useMediaStreamSource(
  stream: MediaStream | null,
  options: Omit<UseMediaAudioOptions, 'source'> = {}
) {
  return useMediaAudio({ ...options, source: stream });
}

/**
 * Hook specifically for HTMLMediaElement sources (audio/video files)
 */
export function useMediaElementSource(
  element: HTMLMediaElement | null,
  options: Omit<UseMediaAudioOptions, 'source'> = {}
) {
  return useMediaAudio({ ...options, source: element });
}

/**
 * Hook specifically for AudioNode sources
 */
export function useAudioNodeSource(
  node: AudioNode | null,
  options: Omit<UseMediaAudioOptions, 'source'> = {}
) {
  return useMediaAudio({ ...options, source: node });
}

// Backward compatibility alias
export { useMediaAudio as useAudioSource };
