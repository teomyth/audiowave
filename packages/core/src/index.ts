/**
 * @audiowave/core - Core audio processing utilities and types
 *
 * This package provides the fundamental building blocks for AudioWave:
 * - Type definitions for audio data providers
 * - Pure functions for audio processing
 * - Shared utilities and constants
 *
 * It's designed to be platform-agnostic and can be used with any audio data source.
 */

// Constants and defaults
export {
  AUDIO_CONSTANTS,
  COMMON_BUFFER_SIZES,
  DEFAULT_AUDIO_CONFIG,
} from './constants';

// Audio processing
export {
  AudioProcessor,
  convertBufferToWaveData,
  process,
  validateAudioConfig,
} from './processor';
// Core types
export type {
  AudioConfig,
  AudioDataInput,
  AudioDataPacket,
  AudioDataProvider,
  AudioDeviceInfo,
} from './types';

// Utility functions
export {
  createAudioConfig,
  getNearestPowerOfTwo,
  isPowerOfTwo,
  isValidAudioBuffer,
} from './utils';
