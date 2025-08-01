/**
 * @audiowave/react - A focused, high-performance real-time audio visualization library
 *
 * @packageDocumentation
 */

// ============================================================================
// MAIN COMPONENT EXPORTS
// ============================================================================

// Main visualization components
export { AudioWave } from './components';

// ============================================================================
// HOOKS EXPORTS
// ============================================================================

export { useCustomAudio } from './hooks';
export type {
  CustomAudioReturn,
  UseCustomAudioOptions,
} from './hooks/useCustomAudio';
// Universal audio source management (NEW - recommended)
export type {
  AudioSourceInput,
  UseMediaAudioOptions,
  UseMediaAudioReturn,
} from './hooks/useMediaAudio';
export {
  useAudioNodeSource,
  useMediaAudio,
  useMediaElementSource,
  useMediaStreamSource,
} from './hooks/useMediaAudio';

// Note: useUserMedia has been removed - use useAudioSource instead

// ============================================================================
// AUDIO SOURCE EXPORTS (NEW ARCHITECTURE)
// ============================================================================

// New architecture audio sources
export type { WebAudioSourceOptions } from './sources/WebAudioSource';
export { WebAudioSource } from './sources/WebAudioSource';
// Standard AudioSource interface and types
export type {
  AudioSource as StandardAudioSource,
  AudioSourceConfig,
  ExtendedAudioSource,
} from './types/AudioSource';
// AudioSourceState enum (exported as value)
export { AudioSourceState } from './types/AudioSource';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export type {
  CanvasSetupResult,
  RenderBarParams,
  RenderWaveformParams,
} from './utils/canvasRenderer';
// Canvas rendering utilities
export {
  drawByLiveStream,
  renderBar,
  resizeCanvas,
  setupCanvas,
} from './utils/canvasRenderer';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Main AudioSource type (unified interface)
  AudioSource,
  // Component types
  AudioWaveController,
  AudioWaveProps,
  AudioWaveState,
  RenderContext,
  WaveformDataPoint,
} from './types';

// ============================================================================
// ERROR AND ENUM EXPORTS
// ============================================================================

export {
  AudioWaveError,
  AudioWaveErrorType,
} from './types';

// Type guards removed - not needed with new architecture

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '0.1.0';

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature flags for different environments and capabilities
 */
export const FEATURES = {
  /** Web Audio API support */
  WEB_AUDIO:
    typeof AudioContext !== 'undefined' ||
    typeof (globalThis as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !==
      'undefined',

  /** MediaStream API support */
  MEDIA_STREAM: typeof navigator !== 'undefined' && 'mediaDevices' in navigator,

  /** SharedArrayBuffer support (Electron) */
  SHARED_ARRAY_BUFFER: typeof SharedArrayBuffer !== 'undefined',

  /** Canvas 2D support */
  CANVAS_2D: typeof CanvasRenderingContext2D !== 'undefined',

  /** RequestAnimationFrame support */
  ANIMATION_FRAME: typeof requestAnimationFrame !== 'undefined',
} as const;

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default configuration for new architecture audio sources
 */
export const DEFAULT_AUDIO_CONFIG = {
  fftSize: 2048,
} as const;

/**
 * Default props for AudioWave component (formerly AudioWave)
 */
export const DEFAULT_VISUALIZER_PROPS = {
  // Dimensions
  width: '100%', // Full width by default
  height: 200, // Standard height for good visibility

  // Visual styling
  backgroundColor: 'transparent',
  barColor: '#ffffff',
  secondaryBarColor: '#5e5e5e',
  barWidth: 2,
  gap: 1,
  rounded: 0,

  // Animation & rendering
  speed: 3,
  animateCurrentPick: true,
  fullscreen: false,
  onlyActive: false,
  amplitudeMode: 'peak',
} as const;

// ============================================================================
// CORE TYPES RE-EXPORTS
// ============================================================================

// Re-export core types for convenience
export type {
  AudioConfig,
  AudioDataInput,
  AudioDataPacket,
  AudioDataProvider,
  AudioDeviceInfo,
} from '@audiowave/core';
