/**
 * Type Definitions
 *
 * Exports all type definitions for the audiowave library.
 * Provides both new standardized interfaces and backward compatibility types.
 */

// Re-export existing types for backward compatibility
// These will be imported from the main types.ts file
export type {
  // Legacy AudioSource union type (for backward compatibility)
  AudioSource as LegacyAudioSource,
  AudioWaveController,
  // Error types
  AudioWaveError,
  AudioWaveErrorType,
  // Component props and interfaces
  AudioWaveProps,
  AudioWaveState,
  RenderContext,
  WaveformDataPoint,
} from '../types';
// Standard AudioSource interface (new architecture)
export type {
  AudioSource,
  AudioSourceConfig,
  ExtendedAudioSource,
} from './AudioSource';
export { AudioSourceState } from './AudioSource';

// Note: The main types.ts file will be updated to use the new AudioSource interface
// while maintaining backward compatibility through type aliases
