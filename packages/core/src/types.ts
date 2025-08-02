/**
 * Core types for AudioWave audio processing
 */

/**
 * Configuration for audio processing
 */
export interface AudioConfig {
  /** Buffer size for audio processing (samples) */
  bufferSize: number;
  /** Number of initial frames to skip to avoid initialization noise (default: 0) */
  skipInitialFrames?: number;

  // 新增：音频格式配置
  /** Input audio bits per sample (8, 16, 24, 32) - default: 32 */
  inputBitsPerSample?: 8 | 16 | 24 | 32;
  /** Input audio channels (1=mono, 2=stereo, etc.) - default: 1 */
  inputChannels?: number;
}

/**
 * Audio data provider interface - abstraction for any audio data source
 * Provider only needs to provide data subscription capability, configuration is handled internally by useCustomAudio
 */
export interface AudioDataProvider {
  /** Subscribe to audio data events - returns unsubscribe function */
  onAudioData(callback: (data: Uint8Array) => void): () => void;
  /** Subscribe to error events (optional) - returns unsubscribe function */
  onAudioError?(callback: (error: string) => void): () => void;
}

/**
 * Processed audio data packet
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
 * Supported audio data input formats for processing
 */
export type AudioDataInput = Buffer | Float32Array;

/**
 * Audio device information
 */
export interface AudioDeviceInfo {
  /** Unique device identifier */
  id: string;
  /** Human-readable device name */
  name: string;
}
