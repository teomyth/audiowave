/**
 * IPCAudioSource - Audio source implementation for IPC communication
 *
 * This class implements the AudioSource interface for applications that need to
 * communicate with a remote process (like Electron main process) via IPC.
 */

import type { AudioSourceConfig, ExtendedAudioSource } from '@audiowave/react';
import { AudioSourceState, AudioWaveError, AudioWaveErrorType } from '@audiowave/react';

/**
 * Configuration options for IPCAudioDataSource - visualization only
 */
export interface IPCAudioSourceOptions extends AudioSourceConfig {
  /** IPC buffer size for data transmission (default: 1024) */
  bufferSize?: number;
  /** Callback for received audio data */
  onDataReceived?: (data: Uint8Array) => void;
  /** Callback for connection state changes */
  onConnectionChange?: (connected: boolean) => void;
  /** Callback for errors */
  onError?: (error: string) => void;
}

/**
 * Audio configuration interface - only what AudioBridge actually needs
 */
export interface AudioConfig {
  bufferSize: number; // Buffer size for data transmission
  fftSize: number; // For visualization analysis
}

/**
 * Data transmission API interface (focused on data access only)
 */
export interface IPCAudioDataAPI {
  setupAudioStream: (config: AudioConfig) => Promise<ArrayBuffer>;
  onAudioData: (callback: (data: Uint8Array) => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
}

/**
 * IPCAudioDataSource - Pure data transmission AudioSource implementation
 *
 * This class focuses solely on audio data access and transmission via IPC,
 * without any device control functionality.
 */
export class IPCAudioDataSource implements ExtendedAudioSource {
  private dataAPI: IPCAudioDataAPI;
  private options: IPCAudioSourceOptions;
  private audioData: Uint8Array | null = null;
  private state: AudioSourceState = AudioSourceState.INACTIVE;
  private unsubscribeData: (() => void) | null = null;
  private unsubscribeError: (() => void) | null = null;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(dataAPI: IPCAudioDataAPI, options: IPCAudioSourceOptions = {}) {
    this.dataAPI = dataAPI;
    this.options = {
      bufferSize: 1024,
      fftSize: 2048, // Inherited from AudioSourceConfig
      ...options,
    };

    this.setupEventListeners();
  }

  /**
   * Set up IPC event listeners for data transmission
   */
  private setupEventListeners(): void {
    // Listen for audio data from main process
    this.unsubscribeData = this.dataAPI.onAudioData((data: Uint8Array) => {
      this.audioData = data;
      this.options.onDataReceived?.(data);
    });

    // Listen for errors from main process
    this.unsubscribeError = this.dataAPI.onError((error: string) => {
      this.handleError(new AudioWaveError(AudioWaveErrorType.AUDIO_CONTEXT_ERROR, error));
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: AudioWaveError): void {
    console.error('IPCAudioDataSource error:', error);
    this.state = AudioSourceState.ERROR;
    this.options.onError?.(error.message);
  }

  // ============================================================================
  // AudioSource Interface Implementation (Data Access Only)
  // ============================================================================

  /**
   * Get current audio data
   */
  getAudioData(): Uint8Array | null {
    return this.audioData;
  }

  /**
   * Check if the audio source is active (AudioSource interface)
   */
  isActive(): boolean {
    return this.state === AudioSourceState.ACTIVE;
  }

  /**
   * Get current state (AudioSource interface)
   */
  getState(): AudioSourceState {
    return this.state;
  }

  /**
   * Check if the audio source is active (ExtendedAudioSource interface)
   */
  getIsActive(): boolean {
    return this.isActive();
  }

  /**
   * Get configuration (ExtendedAudioSource interface)
   */
  getConfig(): AudioSourceConfig {
    return { ...this.options };
  }

  // ============================================================================
  // Data Stream Setup (No Device Control)
  // ============================================================================

  /**
   * Setup audio data stream (data transmission only)
   */
  async setupStream(): Promise<void> {
    if (this.state === AudioSourceState.ACTIVE) {
      return;
    }

    try {
      this.state = AudioSourceState.CONNECTING;

      // Configuration for audio processing
      const config: AudioConfig = {
        bufferSize: this.options.bufferSize || 1024,
        fftSize: this.options.fftSize || 2048,
      };

      // Setup audio stream
      await this.dataAPI.setupAudioStream(config);

      this.state = AudioSourceState.ACTIVE;
      this.options.onConnectionChange?.(true);

      // Set up connection monitoring
      this.startConnectionMonitoring();
    } catch (error) {
      this.handleError(
        new AudioWaveError(
          AudioWaveErrorType.AUDIO_CONTEXT_ERROR,
          `Failed to setup IPC audio stream: ${error}`
        )
      );
      throw error;
    }
  }

  /**
   * Cleanup data stream
   */
  async cleanup(): Promise<void> {
    if (this.state === AudioSourceState.INACTIVE) {
      return;
    }

    this.state = AudioSourceState.INACTIVE;
    this.audioData = null;

    this.options.onConnectionChange?.(false);
    this.stopConnectionMonitoring();
  }

  /**
   * Start connection monitoring
   */
  private startConnectionMonitoring(): void {
    this.connectionTimer = setInterval(() => {
      // Simple connection check - if no data received for a while, consider disconnected
      // This is a basic implementation, can be enhanced based on requirements
    }, 5000);
  }

  /**
   * Stop connection monitoring
   */
  private stopConnectionMonitoring(): void {
    if (this.connectionTimer) {
      clearInterval(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cleanup();
    this.unsubscribeData?.();
    this.unsubscribeError?.();
    this.unsubscribeData = null;
    this.unsubscribeError = null;
  }

  // ============================================================================
  // Static Methods
  // ============================================================================

  /**
   * Check if running in Electron environment
   */
  static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).electronAPI !== 'undefined';
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an IPC audio data source
 */
export async function createIPCAudioDataSource(
  dataAPI: IPCAudioDataAPI,
  options: IPCAudioSourceOptions = {}
): Promise<IPCAudioDataSource> {
  const source = new IPCAudioDataSource(dataAPI, options);
  return source;
}

/**
 * Check if running in Electron environment
 */
export function isElectronEnvironment(): boolean {
  return IPCAudioDataSource.isElectronEnvironment();
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

// Export with old names for backward compatibility
export const RemoteAudioDataSource = IPCAudioDataSource;
export type RemoteAudioSourceOptions = IPCAudioSourceOptions;
export type RemoteAudioDataAPI = IPCAudioDataAPI;
export const createRemoteAudioDataSource = createIPCAudioDataSource;
export const ElectronAudioDataSource = IPCAudioDataSource;
export type ElectronAudioSourceOptions = IPCAudioSourceOptions;
export type ElectronAudioDataAPI = IPCAudioDataAPI;
export const createElectronAudioDataSource = createIPCAudioDataSource;
