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
  AudioBridgeConfig,
  AudioDataPacket,
  AudioDeviceInfo,
  AudioDataInput,
} from './audio-bridge';
// Main audio bridge class
export { AudioBridge } from './audio-bridge';

// Backward compatibility
export type { AudioBridgeConfig as AudioConfig } from './audio-bridge';

import type { AudioBridgeConfig } from './audio-bridge';
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
export function createAudioBridge(_config?: Partial<AudioBridgeConfig>): AudioBridge {
  return new AudioBridge();
}

/**
 * Default configuration for AudioBridge
 */
export const DEFAULT_AUDIO_CONFIG: AudioBridgeConfig = {
  bufferSize: 1024,
  skipInitialFrames: 0,
};

/**
 * Validate audio configuration
 *
 * @param config - Configuration to validate
 * @returns True if configuration is valid
 */
export function validateAudioConfig(config: AudioBridgeConfig): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (typeof config.bufferSize !== 'number' || config.bufferSize <= 0 || config.bufferSize > 16384) {
    return false;
  }

  if (config.skipInitialFrames !== undefined &&
      (typeof config.skipInitialFrames !== 'number' ||
       config.skipInitialFrames < 0 ||
       config.skipInitialFrames > 100)) {
    return false;
  }

  return true;
}
