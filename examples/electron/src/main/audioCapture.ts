import { EventEmitter } from 'node:events';
import { type AudioConfig, type AudioDeviceInfo, AudioProcessor } from '@audiowave/core';

/**
 * AudioWave Integration - Audio Capture Configuration
 *
 * This configuration demonstrates how to set up audio capture for AudioWave:
 * - sampleRate: Controls audio quality (44100 Hz is CD quality)
 * - channels: 1 for mono (sufficient for waveform visualization)
 * - bufferSize: Affects latency vs performance (1024 is a good balance)
 * - skipInitialFrames: Avoids audio initialization noise
 */
export interface AudioCaptureConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
  skipInitialFrames?: number;
}

/**
 * Default configuration optimized for AudioWave visualization
 */
export const DEFAULT_AUDIO_CAPTURE_CONFIG: AudioCaptureConfig = {
  sampleRate: 44100, // CD quality audio
  channels: 1, // Mono is sufficient for waveform visualization
  bufferSize: 1024, // Good balance of latency and performance
  skipInitialFrames: 2, // Skip noisy initialization frames
};

// Import naudiodon2 dynamically to handle potential installation issues
interface NAudioDevice {
  id: number;
  name: string;
  maxInputChannels: number;
  defaultSampleRate: number;
}

interface NAudioIO {
  on(event: 'data', callback: (data: Buffer) => void): void;
  on(event: 'error', callback: (error: Error) => void): void;
  start(): void;
  quit(): void;
}

interface NAudioDon {
  getDevices(): NAudioDevice[];
  AudioIO: new (options: unknown) => NAudioIO;
  SampleFormat32Bit: number;
}

let naudiodon: NAudioDon | null = null;
try {
  naudiodon = require('naudiodon2') as NAudioDon;
} catch (error) {
  console.warn('naudiodon2 not available:', error);
}

/**
 * AudioCapture - Desktop Audio Bridge for AudioWave
 *
 * This class provides a clean interface for integrating AudioWave:
 * 1. Desktop audio capture using naudiodon2
 * 2. Audio processing via @audiowave/core AudioProcessor
 * 3. Real-time data streaming to renderer process
 */
export class AudioCapture extends EventEmitter {
  // Core state - simplified for focused demo
  private audioInput: NAudioIO | null = null;
  private audioProcessor: AudioProcessor | null = null;
  private isCapturing: boolean = false;
  private config: AudioCaptureConfig | null = null;

  /**
   * Get or create AudioProcessor for audio data processing
   */
  private getOrCreateProcessor(): AudioProcessor {
    if (!this.audioProcessor && this.config) {
      const processorConfig: AudioConfig = {
        bufferSize: this.config.bufferSize,
        skipInitialFrames: this.config.skipInitialFrames ?? 2,
        // Audio format configuration
        inputBitsPerSample: 32, // naudiodon2 uses 32-bit format
        inputChannels: this.config.channels,
      };
      this.audioProcessor = new AudioProcessor(processorConfig);
    }
    return this.audioProcessor!;
  }

  /**
   * Get available audio input devices
   * Simplified for demo - returns available input devices
   */
  async getAudioDevices(): Promise<AudioDeviceInfo[]> {
    if (!naudiodon) {
      throw new Error('naudiodon2 is not available. Please install it: npm install naudiodon2');
    }

    try {
      const devices = naudiodon.getDevices();
      return devices
        .filter((device: NAudioDevice) => device.maxInputChannels > 0)
        .map((device: NAudioDevice) => ({
          id: device.id.toString(),
          name: device.name,
        }));
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  /**
   * Configure audio stream for AudioWave integration
   * Must be called before starting capture
   */
  createAudioBuffer(config: AudioCaptureConfig): ArrayBuffer {
    this.config = config;
    // Return dummy buffer for IPC compatibility - real processing happens in data handler
    return new ArrayBuffer(config.bufferSize);
  }

  /**
   * Start audio capture - main entry point for AudioWave integration
   */
  async start(): Promise<void> {
    if (!this.config) {
      throw new Error('Audio buffer not initialized. Call createAudioBuffer first.');
    }

    if (this.isCapturing) {
      return; // Already running
    }

    if (!naudiodon) {
      throw new Error('naudiodon2 is not available');
    }

    try {
      // Create AudioProcessor for processing raw audio data
      this.getOrCreateProcessor();

      // Setup naudiodon audio input
      this.audioInput = new naudiodon.AudioIO({
        inOptions: {
          channelCount: this.config.channels,
          sampleFormat: naudiodon.SampleFormat32Bit,
          sampleRate: this.config.sampleRate,
          deviceId: -1, // Default device for demo
          closeOnError: true,
        },
      });

      // Handle audio data - key integration point for AudioWave
      this.audioInput.on('data', (data: Buffer) => {
        this.processAudioData(data);
      });

      // Handle errors
      this.audioInput.on('error', (error: Error) => {
        console.error('Audio input error:', error);
        this.emit('error', 'default', error.message);
        this.stop();
      });

      // Start the audio stream
      this.audioInput.start();
      this.isCapturing = true;
      this.emit('started');
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  async stop(): Promise<void> {
    if (!this.isCapturing) {
      return;
    }

    try {
      if (this.audioInput) {
        this.audioInput.quit();
        this.audioInput = null;
      }

      this.isCapturing = false;
      this.emit('stopped', 'default');
    } catch (error) {
      console.error('Failed to stop audio capture:', error);
      throw error;
    }
  }

  /**
   * Process incoming audio data and emit via IPC
   * This is where raw audio gets converted for AudioWave visualization
   */
  private processAudioData(data: Buffer): void {
    if (!this.config) {
      return;
    }

    try {
      // Validate buffer length
      if (data.length % 4 !== 0) {
        return; // Invalid buffer length for 32-bit samples
      }

      // Get the audio processor
      const processor = this.audioProcessor;
      if (!processor) {
        return;
      }

      // Use AudioProcessor to convert raw audio data for visualization
      const audioPacket = processor.process(data);
      if (!audioPacket) {
        return; // Processing failed or skipped frame
      }

      // Emit processed data to renderer - this feeds AudioWave component
      this.emit('data', 'default', audioPacket.timeDomainData);
    } catch (error) {
      console.error('Error processing audio data:', error);
      this.emit(
        'error',
        'default',
        `Audio processing error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if naudiodon2 is available for graceful fallbacks
   */
  static isAvailable(): boolean {
    return naudiodon !== null;
  }

  /**
   * Get current capture status
   */
  isActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Cleanup resources on shutdown
   */
  destroy(): void {
    this.stop();
    this.audioProcessor = null;
    this.config = null;
    this.removeAllListeners();
  }
}
