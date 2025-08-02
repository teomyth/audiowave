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
  sampleSize: 8 | 16 | 24 | 32;
  channelCount: number;
}

/**
 * Default configuration for audio capture
 */
export const DEFAULT_AUDIO_CAPTURE_CONFIG: AudioCaptureConfig = {
  sampleRate: 48000, // 48kHz sample rate - high quality
  sampleSize: 16, // 16-bit sample format
  channelCount: 1, // Mono audio
};

// Fixed internal configuration
const FIXED_BUFFER_SIZE = 1024;
const FIXED_SKIP_INITIAL_FRAMES = 2;

import type { DeviceInfo, IoStreamRead } from 'naudiodon2';
// Import naudiodon2
import * as naudiodon from 'naudiodon2';

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
  private audioInput: IoStreamRead | null = null;
  private audioProcessor: AudioProcessor | null = null;
  private isCapturing: boolean = false;
  private config: AudioCaptureConfig | null = null;

  /**
   * Get naudiodon sample format based on config
   */
  private getSampleFormat(): 8 | 16 | 24 | 32 {
    const sampleSize = this.config?.sampleSize ?? 16;
    switch (sampleSize) {
      case 8:
        return 8;
      case 16:
        return 16;
      case 24:
        return 24;
      case 32:
        return 32;
      default:
        return 16; // fallback to 16-bit
    }
  }

  /**
   * Get or create AudioProcessor for audio data processing
   */
  private getOrCreateProcessor(): AudioProcessor {
    if (!this.audioProcessor && this.config) {
      const processorConfig: AudioConfig = {
        bufferSize: FIXED_BUFFER_SIZE,
        skipInitialFrames: FIXED_SKIP_INITIAL_FRAMES,
        // Use sampleSize from config, fallback to 16-bit
        inputBitsPerSample: this.config.sampleSize ?? 16,
        inputChannels: this.config.channelCount,
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
    try {
      const devices = naudiodon.getDevices();
      return devices
        .filter((device: DeviceInfo) => device.maxInputChannels > 0)
        .map((device: DeviceInfo) => ({
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
    return new ArrayBuffer(FIXED_BUFFER_SIZE);
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

    try {
      // Create AudioProcessor for processing raw audio data
      this.getOrCreateProcessor();

      // Setup naudiodon audio input using config parameters
      this.audioInput = naudiodon.AudioIO({
        inOptions: {
          channelCount: this.config.channelCount,
          sampleFormat: this.getSampleFormat(), // Use configured sample format
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
    return true; // Always available since we import it directly
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
