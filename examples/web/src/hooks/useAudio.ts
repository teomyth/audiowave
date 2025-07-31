import { type AudioSource, type AudioSourceInput, useAudioSource } from '@audiowave/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AudioProcessingOptions } from '../types/audioProcessing';

export type AudioSourceType = 'microphone' | 'audioFile' | 'audioUrl';
export type AudioStatus = 'idle' | 'active' | 'paused';

export interface AudioSourceConfig {
  sourceType: AudioSourceType;
  file?: File;
  url?: string;
  audioProcessing?: AudioProcessingOptions;
}

export interface AudioState {
  status: AudioStatus;
  isActive: boolean;
  source: AudioSource | null; // Changed from audioSource to source for consistency
  error: string | null;
  sourceType: AudioSourceType;
}

export interface AudioActions {
  start: (config?: AudioSourceConfig) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: () => Promise<void>; // Keep for backward compatibility
  clearError: () => void;
  setSourceType: (type: AudioSourceType) => void;
}

export interface UseAudioReturn extends AudioState, AudioActions {}

/**
 * Custom hook for managing audio state and operations
 *
 * This hook encapsulates all the logic for:
 * - Starting and stopping audio from multiple sources
 * - Managing MediaStream, audio files, and video files
 * - Error handling
 * - State management
 */
export function useAudio(): UseAudioReturn {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<AudioSourceType>('microphone');

  // Raw audio source state (MediaStream, HTMLAudioElement, etc.)
  const [rawAudioSource, setRawAudioSource] = useState<AudioSourceInput>(null);

  // Memoize the onError callback to prevent unnecessary re-initializations
  const handleAudioSourceError = useCallback((err: Error) => {
    setError(err.message);
  }, []);

  // Memoize the useAudioSource options to prevent unnecessary re-initializations
  const audioSourceOptions = useMemo(
    () => ({
      source: rawAudioSource,
      onError: handleAudioSourceError,
    }),
    [rawAudioSource, handleAudioSourceError]
  );

  // Use the standardized useAudioSource hook from React package
  const { source: audioSource } = useAudioSource(audioSourceOptions);

  const mediaElementRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  // Computed property for backward compatibility
  const isActive = status === 'active';

  const stop = useCallback(() => {
    // Clean up media elements
    if (mediaElementRef.current) {
      mediaElementRef.current.pause();
      mediaElementRef.current.src = '';
      mediaElementRef.current = null;
    }

    // Clear the raw audio source (this will automatically clean up the AudioSource via useAudioSource)
    setRawAudioSource(null);
    setStatus('idle');
  }, []);

  const pause = useCallback(() => {
    if (status === 'active') {
      // Keep the stream alive and visible, just change status
      // AudioWave will handle the pause state internally
      setStatus('paused');
    }
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('active');
    }
  }, [status]);

  // Handle audio end events - defined before start to avoid dependency issues
  const handleAudioEnd = useCallback(() => {
    // When audio ends (e.g., file playback completes), return to idle state
    // This allows the user to restart playback
    setStatus('idle');
    setRawAudioSource(null);

    // Clean up media elements
    if (mediaElementRef.current) {
      mediaElementRef.current.pause();
      mediaElementRef.current.currentTime = 0;
    }
  }, []);

  const start = useCallback(
    async (config?: AudioSourceConfig) => {
      try {
        setError(null);

        const currentSourceType = config?.sourceType || sourceType;

        switch (currentSourceType) {
          case 'microphone': {
            // ✅ Application layer creates MediaStream with audio processing options
            const audioConstraints: MediaTrackConstraints = {
              echoCancellation: config?.audioProcessing?.echoCancellation ?? true,
              autoGainControl: config?.audioProcessing?.autoGainControl ?? true,
              noiseSuppression: config?.audioProcessing?.noiseSuppression ?? true,
            };

            const stream = await navigator.mediaDevices.getUserMedia({
              audio: audioConstraints,
            });

            // ✅ Set the raw audio source, useAudioSource will handle the conversion
            setRawAudioSource(stream);
            break;
          }

          case 'audioFile': {
            if (!config?.file) {
              throw new Error('Audio file is required');
            }

            // ✅ Application layer creates audio element and manages lifecycle
            const url = URL.createObjectURL(config.file);
            const audio = new Audio(url);

            // ✅ Application layer handles events
            audio.addEventListener('ended', () => {
              URL.revokeObjectURL(url);
              handleAudioEnd();
            });

            // Wait for audio to be ready
            await new Promise<void>((resolve, reject) => {
              const onCanPlay = () => {
                audio.removeEventListener('canplay', onCanPlay);
                audio.removeEventListener('error', onError);
                resolve();
              };
              const onError = () => {
                audio.removeEventListener('canplay', onCanPlay);
                audio.removeEventListener('error', onError);
                reject(new Error(`Failed to load audio file`));
              };
              audio.addEventListener('canplay', onCanPlay);
              audio.addEventListener('error', onError);
              audio.load();
            });

            // ✅ Set the raw audio source, useAudioSource will handle the conversion
            setRawAudioSource(audio);
            mediaElementRef.current = audio;

            // ✅ Application layer controls playback
            audio.play();
            break;
          }

          case 'audioUrl': {
            if (!config?.url) {
              throw new Error('Audio URL is required');
            }

            // ✅ Application layer creates audio element and manages lifecycle
            const audio = new Audio(config.url);

            // ✅ Application layer handles events
            audio.addEventListener('ended', handleAudioEnd);

            // Wait for audio to be ready
            await new Promise<void>((resolve, reject) => {
              const onCanPlay = () => {
                audio.removeEventListener('canplay', onCanPlay);
                audio.removeEventListener('error', onError);
                resolve();
              };
              const onError = () => {
                audio.removeEventListener('canplay', onCanPlay);
                audio.removeEventListener('error', onError);
                reject(new Error(`Failed to load audio from URL: ${config.url}`));
              };
              audio.addEventListener('canplay', onCanPlay);
              audio.addEventListener('error', onError);
              audio.load();
            });

            // ✅ Set the raw audio source, useAudioSource will handle the conversion
            setRawAudioSource(audio);
            mediaElementRef.current = audio;

            // ✅ Application layer controls playback
            audio.play();
            break;
          }

          default:
            throw new Error(`Unsupported audio source type: ${currentSourceType}`);
        }

        setStatus('active');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to start ${sourceType}`;
        setError(errorMessage);
      }
    },
    [sourceType, handleAudioEnd]
  );

  const toggle = useCallback(async () => {
    if (status === 'active') {
      stop();
    } else {
      await start();
    }
  }, [status, stop, start]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Add event listeners for audio end events
  useEffect(() => {
    if (mediaElementRef.current) {
      const element = mediaElementRef.current;
      element.addEventListener('ended', handleAudioEnd);
      return () => element.removeEventListener('ended', handleAudioEnd);
    }
    // Return undefined if no element
    return undefined;
  }, [handleAudioEnd]);

  return {
    // State
    status,
    isActive,
    source: audioSource, // From useAudioSource hook
    error,
    sourceType,
    // Actions
    start,
    pause,
    resume,
    stop,
    toggle,
    clearError,
    setSourceType,
  };
}

// Export with renamed alias for clarity in electron app
export { useAudio as useWebAudio };
