/**
 * Standard AudioSource Interface
 *
 * Defines the unified interface for all audio sources in the audiowave library.
 * This interface ensures consistent behavior across different audio source implementations.
 */

/**
 * Standard AudioSource interface
 *
 * All audio sources must implement this interface to be compatible with the AudioWave component.
 * The interface focuses on data provision only - device control is handled at the application layer.
 */
export interface AudioSource {
  /**
   * Get current audio data for visualization
   *
   * @returns Standardized audio data in Uint8Array format, or null if no data is available
   *          - Data format: Uint8Array with values in range [0-255]
   *          - Center line: 128 (silence state)
   *          - Buffer size: typically 1024 samples
   */
  getAudioData(): Uint8Array | null;

  /**
   * Check if the audio source is currently active
   *
   * @returns true if the audio source is connected and may produce data
   *          false if the source is inactive, disconnected, or stopped
   */
  isActive(): boolean;
}

/**
 * Audio source state enumeration
 */
export enum AudioSourceState {
  /** Source is not initialized or has been destroyed */
  INACTIVE = 'inactive',
  /** Source is initializing or connecting */
  CONNECTING = 'connecting',
  /** Source is active and may produce data */
  ACTIVE = 'active',
  /** Source encountered an error */
  ERROR = 'error',
}

/**
 * Audio source configuration interface
 */
export interface AudioSourceConfig {
  /** FFT size for frequency analysis - affects audioData array length (default: 2048) */
  fftSize?: number;
}

/**
 * Extended AudioSource interface with additional methods for advanced use cases
 */
export interface ExtendedAudioSource extends AudioSource {
  /**
   * Get current state of the audio source
   */
  getState(): AudioSourceState;

  /**
   * Get configuration used by this audio source
   */
  getConfig(): AudioSourceConfig;

  /**
   * Destroy the audio source and clean up resources
   */
  destroy(): void;
}
