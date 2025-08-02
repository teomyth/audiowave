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
      let timeDomainData: Uint8Array;

      if (rawData instanceof Buffer) {
        // Use new one-step conversion function
        timeDomainData = convertBufferToWaveData(
          rawData,
          this.config.inputBitsPerSample || 32,
          this.config.inputChannels || 1,
          this.config.bufferSize
        );
      } else {
        // Float32Array input (Web Audio, etc.)
        const samples = rawData as Float32Array;
        timeDomainData = new Uint8Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
          const normalized = Math.max(-1, Math.min(1, samples[i]));
          timeDomainData[i] = Math.floor(128 + normalized * 127);
        }
      }

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
    let timeDomainData: Uint8Array;

    if (rawData instanceof Buffer) {
      // Use new one-step conversion function
      timeDomainData = convertBufferToWaveData(
        rawData,
        config.inputBitsPerSample || 32,
        config.inputChannels || 1,
        config.bufferSize
      );
    } else {
      // Float32Array input (Web Audio, etc.)
      const samples = rawData as Float32Array;
      timeDomainData = new Uint8Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        const normalized = Math.max(-1, Math.min(1, samples[i]));
        timeDomainData[i] = Math.floor(128 + normalized * 127);
      }
    }

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
 * Convert Buffer directly to wave data (Uint8Array) for AudioWave visualization
 * One-step conversion: format parsing + channel mixing + resampling + amplitude mapping
 */
export function convertBufferToWaveData(
  buffer: Buffer,
  bitsPerSample: number,
  channels: number,
  targetSize: number
): Uint8Array {
  const bytesPerSample = bitsPerSample / 8;
  const sourceSamples = buffer.length / (bytesPerSample * channels);
  const result = new Uint8Array(targetSize);
  const maxValue = 2 ** (bitsPerSample - 1) - 1;
  const samplesPerBin = sourceSamples / targetSize;

  for (let i = 0; i < targetSize; i++) {
    const startIndex = Math.floor(i * samplesPerBin);
    const endIndex = Math.min(Math.floor((i + 1) * samplesPerBin), sourceSamples);

    let maxAmplitude = 0;
    let representativeSample = 0;

    // Find maximum amplitude (suitable for waveform display)
    for (let j = startIndex; j < endIndex; j++) {
      let mixedSample = 0;

      // Mix channels
      for (let ch = 0; ch < channels; ch++) {
        const byteIndex = (j * channels + ch) * bytesPerSample;
        let sample = 0;

        switch (bitsPerSample) {
          case 8:
            sample = buffer.readInt8(byteIndex);
            break;
          case 16:
            sample = buffer.readInt16LE(byteIndex);
            break;
          case 32:
            sample = buffer.readInt32LE(byteIndex);
            break;
          default:
            throw new Error(`Unsupported bits per sample: ${bitsPerSample}`);
        }

        mixedSample += sample;
      }

      mixedSample = mixedSample / channels;
      const amplitude = Math.abs(mixedSample);

      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        representativeSample = mixedSample;
      }
    }

    // Convert to AudioWave format: 128 as center, symmetric mapping
    const normalized = representativeSample / maxValue; // [-1, 1]
    result[i] = Math.floor(128 + normalized * 127);
  }

  return result;
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
