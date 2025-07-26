/**
 * @audiowave/electron/main - Electron main process audio data bridge
 *
 * This package provides audio data bridging functionality for Electron applications,
 * handling audio capture and processing in the main process and transmitting
 * processed data to the renderer process via IPC.
 *
 * @packageDocumentation
 */

// ============================================================================
// MAIN EXPORTS
// ============================================================================

// Type definitions
export type {
  AudioConfig,
  AudioDataPacket,
  AudioDeviceInfo,
} from './audio-bridge';
// Main audio bridge class
export { AudioBridge } from './audio-bridge';

import type { AudioConfig } from './audio-bridge';
// Import types for internal use
import { AudioBridge } from './audio-bridge';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '0.1.0';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Create an AudioBridge instance with default configuration
 *
 * @param config - Optional configuration overrides
 * @returns AudioBridge instance
 *
 * @example
 * ```typescript
 * import { createAudioBridge } from '@audiowave/electron/main';
 *
 * const audioBridge = createAudioBridge();
 *
 * // Set up event listeners
 * audioBridge.on('data', (audioPacket) => {
 *   // Send to renderer process via IPC
 *   mainWindow.webContents.send('audio-data', audioPacket);
 * });
 *
 * audioBridge.on('error', (error) => {
 *   console.error('Audio error:', error);
 * });
 *
 * // Create buffer and process audio data
 * const buffer = audioBridge.createAudioBuffer(config);
 * audioBridge.processAudioData(rawAudioData);
 * ```
 */
export function createAudioBridge(_config?: Partial<AudioConfig>): AudioBridge {
  return new AudioBridge();
}

/**
 * Default configuration for AudioBridge
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  bufferSize: 1024,
};

/**
 * Validate audio configuration
 *
 * @param config - Configuration to validate
 * @returns True if configuration is valid
 */
export function validateAudioConfig(config: AudioConfig): boolean {
  return config.bufferSize > 0;
}
