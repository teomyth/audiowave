import { EventEmitter } from 'node:events';

/**
 * Configuration for AudioBridge - only what it actually needs
 */
export interface AudioConfig {
  bufferSize: number; // Buffer size for data transmission
  skipInitialFrames?: number; // Number of initial frames to skip (default: 0)
}

/**
 * Audio device information
 */
export interface AudioDeviceInfo {
  id: string;
  name: string;
}

/**
 * Audio data packet for transmission - visualization data only
 */
export interface AudioDataPacket {
  timeDomainData: Uint8Array;
  timestamp: number;
  bufferSize: number;
}

/**
 * Simplified audio bridge for Electron IPC communication
 * Handles basic audio data processing without complex AGC
 */
export class AudioBridge extends EventEmitter {
  private audioBuffer: ArrayBuffer | null = null;
  private config: AudioConfig | null = null;
  private deviceId: string;
  private frameCount: number = 0;

  constructor(deviceId: string = 'default') {
    super();
    this.deviceId = deviceId;
  }

  /**
   * Create audio buffer for IPC communication
   */
  createAudioBuffer(config: AudioConfig): ArrayBuffer {
    this.config = config;
    this.frameCount = 0; // Reset frame counter for new audio stream

    // Create buffer for time domain data (Uint8Array)
    const bufferSize = config.bufferSize;
    this.audioBuffer = new ArrayBuffer(bufferSize);

    return this.audioBuffer;
  }

  /**
   * Process raw audio data and prepare for transmission
   */
  processAudioData(rawData: Buffer | Float32Array): AudioDataPacket | null {
    if (!this.config || !this.audioBuffer) {
      return null;
    }

    // Increment frame counter
    this.frameCount++;

    // Skip initial frames if configured
    if (this.config.skipInitialFrames && this.frameCount <= this.config.skipInitialFrames) {
      return null; // Skip this frame
    }

    try {
      let samples: Float32Array;

      // Convert input data to Float32Array
      if (rawData instanceof Buffer) {
        // Convert Buffer to Float32Array
        const arrayBuffer = rawData.buffer.slice(
          rawData.byteOffset,
          rawData.byteOffset + rawData.byteLength
        );
        const int32View = new Int32Array(arrayBuffer);

        // Convert Int32 to Float32 (simple conversion)
        samples = new Float32Array(int32View.length);
        for (let i = 0; i < int32View.length; i++) {
          samples[i] = int32View[i] / 2147483647; // Normalize to [-1, 1]
        }
      } else {
        samples = rawData as Float32Array;
      }

      // Resample to target buffer size if needed
      const resampledSamples = this.resampleAudioData(samples, this.config.bufferSize);

      // Convert to time domain data (0-255 range for visualization) without gain processing
      const timeDomainData = this.convertToTimeDomainData(resampledSamples);

      // Create audio packet
      const audioPacket: AudioDataPacket = {
        timeDomainData,
        timestamp: Date.now(),
        bufferSize: this.config.bufferSize,
      };

      // Emit data event for IPC transmission with deviceId
      this.emit('data', this.deviceId, audioPacket);

      return audioPacket;
    } catch (error) {
      console.error('Error processing audio data:', error);
      return null;
    }
  }

  /**
   * Simple audio resampling
   */
  private resampleAudioData(samples: Float32Array, targetSize: number): Float32Array {
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
  private convertToTimeDomainData(samples: Float32Array): Uint8Array {
    const timeDomainData = new Uint8Array(samples.length);

    for (let i = 0; i < samples.length; i++) {
      // Convert from [-1, 1] to [0, 255]
      timeDomainData[i] = Math.floor((samples[i] + 1) * 127.5);
    }

    return timeDomainData;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.audioBuffer = null;
    this.config = null;
    this.removeAllListeners();
  }
}
