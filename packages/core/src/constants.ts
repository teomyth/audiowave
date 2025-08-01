import type { AudioConfig } from './types';

/**
 * Default configuration for audio processing
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  bufferSize: 1024,
  skipInitialFrames: 0,
};

/**
 * Common buffer sizes for audio processing
 */
export const COMMON_BUFFER_SIZES = [256, 512, 1024, 2048, 4096, 8192] as const;

/**
 * Audio processing constants
 */
export const AUDIO_CONSTANTS = {
  /** Maximum buffer size allowed */
  MAX_BUFFER_SIZE: 16384,
  /** Minimum buffer size allowed */
  MIN_BUFFER_SIZE: 64,
  /** Maximum skip frames allowed */
  MAX_SKIP_FRAMES: 100,
  /** Sample rate normalization factor for 32-bit integers */
  INT32_NORMALIZATION_FACTOR: 1 / 2147483647,
  /** Conversion factor for [-1, 1] to [0, 255] range */
  UINT8_CONVERSION_FACTOR: 127.5,
} as const;
