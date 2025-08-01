import { EventEmitter } from 'node:events';
import { AudioBridge, type AudioConfig, type AudioDeviceInfo } from '@audiowave/electron/main';

/**
 * Configuration for audio capture - includes parameters needed by naudiodon
 */
export interface AudioCaptureConfig {
  sampleRate: number; // Used by naudiodon
  channels: number; // Used by naudiodon
  bufferSize: number; // Buffer size for data transmission
  skipInitialFrames?: number; // Number of initial frames to skip (default: 2)
}

/**
 * Default configuration for audio capture
 */
export const DEFAULT_AUDIO_CAPTURE_CONFIG: AudioCaptureConfig = {
  sampleRate: 44100,
  channels: 1,
  bufferSize: 1024,
  skipInitialFrames: 2, // Skip first 2 frames to avoid initialization noise
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

export class AudioManager extends EventEmitter {
  private audioInputs: Map<string, NAudioIO> = new Map(); // deviceId -> NAudioIO
  private audioBridges: Map<string, AudioBridge> = new Map(); // deviceId -> AudioBridge
  private captureStates: Map<string, boolean> = new Map(); // deviceId -> isCapturing
  private configs: Map<string, AudioCaptureConfig> = new Map(); // deviceId -> config



  /**
   * Get or create AudioBridge for a specific device
   */
  private getOrCreateBridge(deviceId: string): AudioBridge {
    if (!this.audioBridges.has(deviceId)) {
      const bridge = new AudioBridge(deviceId);
      this.audioBridges.set(deviceId, bridge);

      // Forward bridge events (AudioBridge includes deviceId)
      bridge.on('data', (deviceId: string, packet) => {
        this.emit('data', deviceId, packet.timeDomainData);
      });

      bridge.on('error', (deviceId: string, error) => {
        this.emit('error', deviceId, error);
      });
    }
    return this.audioBridges.get(deviceId)!;
  }

  /**
   * Get available audio input devices
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
   * Create ArrayBuffer for audio data (IPC-compatible)
   */
  createAudioBuffer(config: AudioCaptureConfig, deviceId: string = 'default'): ArrayBuffer {
    this.configs.set(deviceId, config);

    // Get or create bridge for this device
    const bridge = this.getOrCreateBridge(deviceId);

    // Extract only the parameters AudioBridge needs
    const bridgeConfig: AudioConfig = {
      bufferSize: config.bufferSize,
      skipInitialFrames: config.skipInitialFrames ?? 2, // Default to 2 frames if not specified
    };

    // Use AudioBridge to create the buffer
    return bridge.createAudioBuffer(bridgeConfig);
  }

  /**
   * Start audio (standardized naming)
   */
  async start(deviceId: string = 'default'): Promise<void> {
    return this.startCapture(deviceId);
  }

  /**
   * Stop audio (standardized naming)
   */
  async stop(deviceId: string = 'default'): Promise<void> {
    return this.stopCapture(deviceId);
  }

  /**
   * Pause audio (standardized naming, same as stop for this implementation)
   */
  async pause(deviceId: string = 'default'): Promise<void> {
    return this.stopCapture(deviceId);
  }

  /**
   * Resume audio (standardized naming, same as start for this implementation)
   */
  async resume(deviceId: string = 'default'): Promise<void> {
    return this.startCapture(deviceId);
  }

  /**
   * Start audio capture
   * @deprecated Use start() instead
   */
  async startCapture(deviceId: string = 'default'): Promise<void> {
    const config = this.configs.get(deviceId);
    if (!config) {
      throw new Error(
        `Audio buffer not initialized for device ${deviceId}. Call createAudioBuffer first.`
      );
    }

    if (this.captureStates.get(deviceId)) {
      return; // Already running for this device
    }

    try {
      // Use real audio capture
      if (!naudiodon) {
        throw new Error('naudiodon2 is not available');
      }

      // Configure audio input - try different sample formats

      // Get the bridge for this device (ensures it's created)
      this.getOrCreateBridge(deviceId);

      // Use the default 32-bit format but treat it as Int32 instead of Float32
      const audioInput = new naudiodon.AudioIO({
        inOptions: {
          channelCount: config.channels,
          sampleFormat: naudiodon.SampleFormat32Bit, // This is likely Int32, not Float32
          sampleRate: config.sampleRate,
          deviceId: -1, // Default device
          closeOnError: true,
        },
      });

      // Store format info for processing (currently unused)
      // this.sampleFormat = naudiodon.SampleFormat32Bit;
      // this.bytesPerSample = 4;

      // Store the audio input for this device
      this.audioInputs.set(deviceId, audioInput);

      // Handle audio data
      audioInput.on('data', (data: Buffer) => {
        this.processAudioData(deviceId, data);
      });

      // Handle errors
      audioInput.on('error', (error: Error) => {
        console.error(`Audio input error for device ${deviceId}:`, error);
        this.emit('error', deviceId, error.message);
        this.stopCapture(deviceId);
      });

      // Start the audio stream
      audioInput.start();

      this.captureStates.set(deviceId, true);
      this.emit('started');
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }

  /**
   * Stop audio capture
   * @deprecated Use stop() instead
   */
  async stopCapture(deviceId: string = 'default'): Promise<void> {
    if (!this.captureStates.get(deviceId)) {
      return;
    }

    try {
      // Stop audio input for this device
      const audioInput = this.audioInputs.get(deviceId);
      if (audioInput) {
        audioInput.quit();
        this.audioInputs.delete(deviceId);
      }

      this.captureStates.set(deviceId, false);
      this.emit('stopped', deviceId);
    } catch (error) {
      console.error(`Failed to stop audio capture for device ${deviceId}:`, error);
      throw error;
    }
  }

  // Removed isRealAudioData method - no longer needed
  // Backend now sends all audio data continuously, letting frontend handle display

  /**
   * Process incoming audio data and emit via IPC
   * Optimized for performance with minimal memory allocations
   */
  private processAudioData(deviceId: string, data: Buffer): void {
    const config = this.configs.get(deviceId);
    if (!config) {
      return;
    }

    try {
      // Remove data capture for production

      if (data.length % 4 !== 0) {
        return; // Invalid buffer length
      }

      // Get the bridge for this device
      const bridge = this.audioBridges.get(deviceId);
      if (!bridge) {
        return;
      }

      // Use AudioBridge to process the raw audio data
      const audioPacket = bridge.processAudioData(data);
      if (!audioPacket) {
        return; // Processing failed
      }

      // Remove Float32Array capture for production

      // AudioBridge has already processed and emitted the data
      // The 'data' event is forwarded in the constructor
    } catch (error) {
      console.error(`Error processing audio data for device ${deviceId}:`, error);
      this.emit(
        'error',
        deviceId,
        `Audio processing error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if naudiodon2 is available
   */
  static isAvailable(): boolean {
    return naudiodon !== null;
  }

  /**
   * Get current capture status for a device
   */
  isActive(deviceId: string = 'default'): boolean {
    return this.captureStates.get(deviceId) || false;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Stop all devices
    for (const deviceId of this.captureStates.keys()) {
      this.stopCapture(deviceId);
    }

    // Destroy all bridges
    for (const bridge of this.audioBridges.values()) {
      bridge.destroy();
    }

    this.audioBridges.clear();
    this.configs.clear();
    this.captureStates.clear();
    this.audioInputs.clear();
    this.removeAllListeners();

    // Remove report generation for production
  }
}
