import { DEFAULT_AUDIO_CONFIG } from './constants';
import type { AudioConfig } from './types';

/**
 * Create audio configuration with defaults
 */
export function createAudioConfig(config: Partial<AudioConfig> = {}): AudioConfig {
  return {
    ...DEFAULT_AUDIO_CONFIG,
    ...config,
  };
}

/**
 * Check if buffer size is a power of 2 (recommended for FFT)
 */
export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Get the nearest power of 2 buffer size
 */
export function getNearestPowerOfTwo(size: number): number {
  return 2 ** Math.round(Math.log2(size));
}

/**
 * Validate buffer data format for 32-bit samples
 */
export function isValidAudioBuffer(buffer: Buffer): boolean {
  return buffer.length % 4 === 0;
}
