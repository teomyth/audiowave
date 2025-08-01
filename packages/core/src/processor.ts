import { AUDIO_CONSTANTS } from './constants';
import type { AudioConfig, AudioDataInput, AudioDataPacket } from './types';

/**
 * Simple audio processor with minimal state for skip frames functionality
 */
export class AudioProcessor {
  private frameCount = 0;
  private config: AudioConfig;

  constructor(config: AudioConfig) {
    this.config = config;
  }

  /**
   * Process raw audio data and convert to visualization format
   * Handles skip frames logic internally
   */
  process(rawData: AudioDataInput): AudioDataPacket | null {
    this.frameCount++;

    // Skip initial frames if configured
    if (this.config.skipInitialFrames && this.frameCount <= this.config.skipInitialFrames) {
      return null; // Skip this frame
    }

    try {
      // Convert input data to Float32Array
      const samples = rawData instanceof Buffer ? convertBufferToFloat32Array(rawData) : rawData;

      // Resample to target buffer size
      const resampledSamples = resampleAudioData(samples as Float32Array, this.config.bufferSize);

      // Convert to time domain data (0-255 range for visualization)
      const timeDomainData = convertToTimeDomainData(resampledSamples);

      return {
        timeDomainData,
        timestamp: Date.now(),
        bufferSize: this.config.bufferSize,
      };
    } catch (error) {
      console.error('Error processing audio data:', error);
      return null;
    }
  }

  /**
   * Reset frame counter (call when starting new audio stream)
   */
  reset(): void {
    this.frameCount = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: AudioConfig): void {
    this.config = config;
  }
}

/**
 * Stateless audio processing function (for cases without skip frames)
 *
 * @param rawData - Raw audio data (Buffer or Float32Array)
 * @param config - Audio processing configuration
 * @returns Processed audio packet or null if processing fails
 */
export function process(rawData: AudioDataInput, config: AudioConfig): AudioDataPacket | null {
  try {
    // Convert input data to Float32Array
    const samples = rawData instanceof Buffer ? convertBufferToFloat32Array(rawData) : rawData;

    // Resample to target buffer size
    const resampledSamples = resampleAudioData(samples as Float32Array, config.bufferSize);

    // Convert to time domain data (0-255 range for visualization)
    const timeDomainData = convertToTimeDomainData(resampledSamples);

    return {
      timeDomainData,
      timestamp: Date.now(),
      bufferSize: config.bufferSize,
    };
  } catch (error) {
    console.error('Error processing audio data:', error);
    return null;
  }
}

/**
 * Convert Buffer to Float32Array with validation
 */
export function convertBufferToFloat32Array(buffer: Buffer): Float32Array {
  // Validate buffer length for 32-bit samples
  if (buffer.length % 4 !== 0) {
    throw new Error(
      `Invalid buffer length: ${buffer.length} (must be multiple of 4 for 32-bit samples)`
    );
  }

  const sampleCount = buffer.length / 4;
  const samples = new Float32Array(sampleCount);

  // Convert Buffer to Float32Array
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const int32View = new Int32Array(arrayBuffer);

  // Optimized conversion with constant factor
  for (let i = 0; i < int32View.length; i++) {
    samples[i] = int32View[i] * AUDIO_CONSTANTS.INT32_NORMALIZATION_FACTOR;
  }

  return samples;
}

/**
 * Simple audio resampling
 */
export function resampleAudioData(samples: Float32Array, targetSize: number): Float32Array {
  if (samples.length === targetSize) {
    return samples;
  }

  const result = new Float32Array(targetSize);
  const ratio = samples.length / targetSize;

  for (let i = 0; i < targetSize; i++) {
    const sourceIndex = Math.floor(i * ratio);
    result[i] = samples[Math.min(sourceIndex, samples.length - 1)];
  }

  return result;
}

/**
 * Convert Float32Array to Uint8Array for visualization
 */
export function convertToTimeDomainData(samples: Float32Array): Uint8Array {
  const timeDomainData = new Uint8Array(samples.length);

  for (let i = 0; i < samples.length; i++) {
    // Convert from [-1, 1] to [0, 255]
    timeDomainData[i] = Math.floor((samples[i] + 1) * AUDIO_CONSTANTS.UINT8_CONVERSION_FACTOR);
  }

  return timeDomainData;
}

/**
 * Validate audio configuration
 */
export function validateAudioConfig(config: AudioConfig): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (
    typeof config.bufferSize !== 'number' ||
    config.bufferSize < AUDIO_CONSTANTS.MIN_BUFFER_SIZE ||
    config.bufferSize > AUDIO_CONSTANTS.MAX_BUFFER_SIZE
  ) {
    return false;
  }

  if (
    config.skipInitialFrames !== undefined &&
    (typeof config.skipInitialFrames !== 'number' ||
      config.skipInitialFrames < 0 ||
      config.skipInitialFrames > AUDIO_CONSTANTS.MAX_SKIP_FRAMES)
  ) {
    return false;
  }

  return true;
}
