/**
 * Hooks - Unified exports
 *
 * Provides all React hooks for audio visualization and source management.
 */

// ============================================================================
// AUDIO SOURCE HOOKS
// ============================================================================

export type {
  AudioSourceInput,
  UseMediaAudioOptions,
  UseMediaAudioReturn,
} from './useMediaAudio';
export {
  useAudioNodeSource,
  useMediaAudio,
  useMediaElementSource,
  useMediaStreamSource,
} from './useMediaAudio';

// ============================================================================
// PROVIDER AUDIO SOURCE HOOKS
// ============================================================================

export type {
  CustomAudioReturn,
  UseCustomAudioOptions,
} from './useCustomAudio';
export { useCustomAudio } from './useCustomAudio';
