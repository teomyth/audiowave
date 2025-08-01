import { EventEmitter } from 'node:events';

/**
 * Configuration for AudioBridge - only what it actually needs
 */
export interface AudioBridgeConfig {
  /** Buffer size for data transmission (samples) */
  bufferSize: number;
  /** Number of initial frames to skip to avoid initialization noise (default: 0) */
  skipInitialFrames?: number;
}

/**
 * Audio device information
 */
export interface AudioDeviceInfo {
  /** Unique device identifier */
  id: string;
  /** Human-readable device name */
  name: string;
}

/**
 * Audio data packet for IPC transmission - visualization data only
 */
export interface AudioDataPacket {
  /** Time domain audio data in range [0, 255] for visualization */
  timeDomainData: Uint8Array;
  /** Timestamp when data was processed (milliseconds) */
  timestamp: number;
  /** Buffer size used for this packet */
  bufferSize: number;
}

/**
 * Supported audio data input formats
 */
export type AudioDataInput = Buffer | Float32Array;

/**
 * Simplified audio bridge for Electron IPC communication
 * Handles basic audio data processing without complex AGC
 */
export class AudioBridge extends EventEmitter {
  private audioBuffer: ArrayBuffer | null = null;
  private config: AudioBridgeConfig | null = null;
  private deviceId: string;
  private frameCount: number = 0;

  // Performance optimization: reuse objects to reduce GC pressure
  private cachedAudioPacket: AudioDataPacket | null = null;
  private cachedSamplesBuffer: Float32Array | null = null;

  constructor(deviceId: string = 'default') {
    super();
    this.deviceId = deviceId;
  }

  /**
   * Create audio buffer for IPC communication
   */
  createAudioBuffer(config: AudioBridgeConfig): ArrayBuffer {
    // Validate configuration
    if (!config || typeof config.bufferSize !== 'number') {
      throw new Error('Invalid AudioBridgeConfig: bufferSize must be a number');
    }

    if (config.bufferSize <= 0 || config.bufferSize > 16384) {
      throw new Error('Invalid bufferSize: must be between 1 and 16384 samples');
    }

    if (config.skipInitialFrames !== undefined &&
        (config.skipInitialFrames < 0 || config.skipInitialFrames > 100)) {
      throw new Error('Invalid skipInitialFrames: must be between 0 and 100');
    }

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
  processAudioData(rawData: AudioDataInput): AudioDataPacket | null {
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

      // Convert input data to Float32Array with performance optimization
      if (rawData instanceof Buffer) {
        // Validate buffer length for 32-bit samples
        if (rawData.length % 4 !== 0) {
          throw new Error(`Invalid buffer length: ${rawData.length} (must be multiple of 4 for 32-bit samples)`);
        }

        const sampleCount = rawData.length / 4;

        // Reuse cached buffer if possible
        if (!this.cachedSamplesBuffer || this.cachedSamplesBuffer.length !== sampleCount) {
          this.cachedSamplesBuffer = new Float32Array(sampleCount);
        }
        samples = this.cachedSamplesBuffer;

        // Convert Buffer to Float32Array with optimized loop
        const arrayBuffer = rawData.buffer.slice(
          rawData.byteOffset,
          rawData.byteOffset + rawData.byteLength
        );
        const int32View = new Int32Array(arrayBuffer);

        // Optimized conversion with constant factor
        const normalizationFactor = 1 / 2147483647;
        for (let i = 0; i < int32View.length; i++) {
          samples[i] = int32View[i] * normalizationFactor;
        }
      } else {
        samples = rawData as Float32Array;
      }

      // Resample to target buffer size if needed
      const resampledSamples = this.resampleAudioData(samples, this.config.bufferSize);

      // Convert to time domain data (0-255 range for visualization) without gain processing
      const timeDomainData = this.convertToTimeDomainData(resampledSamples);

      // Reuse cached audio packet to reduce GC pressure
      if (!this.cachedAudioPacket) {
        this.cachedAudioPacket = {
          timeDomainData,
          timestamp: 0,
          bufferSize: 0,
        };
      }

      // Update cached packet with new data
      this.cachedAudioPacket.timeDomainData = timeDomainData;
      this.cachedAudioPacket.timestamp = Date.now();
      this.cachedAudioPacket.bufferSize = this.config.bufferSize;

      const audioPacket = this.cachedAudioPacket;

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
