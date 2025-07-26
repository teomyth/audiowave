/**
 * @audiowave/electron-source - Electron renderer process audio source
 *
 * This package provides React hooks and utilities for audio visualization
 * in Electron renderer processes, using IPC communication with the main process.
 *
 * @packageDocumentation
 */

// ============================================================================
// MAIN EXPORTS
// ============================================================================

// Type definitions
export type {
  AudioReturn,
  AudioStatus,
  UseIPCAudioOptions,
  UseNativeAudioOptions, // Backward compatibility
  UseRemoteAudioOptions, // Backward compatibility
} from './useIPCAudio';
// React hooks
export { useIPCAudio, useNativeAudio, useRemoteAudio } from './useIPCAudio';

// ============================================================================
// STANDARDIZED NAMING INTERFACES (RECOMMENDED)
// ============================================================================

// Basic error types are now part of the core AudioWave library

// ============================================================================
// NEW ARCHITECTURE COMPONENTS (RECOMMENDED)
// ============================================================================

export type {
  AudioConfig,
  ElectronAudioDataAPI,
  ElectronAudioSourceOptions,
  IPCAudioDataAPI,
  IPCAudioSourceOptions,
  // Backward compatibility
  RemoteAudioDataAPI,
  RemoteAudioSourceOptions,
} from './IPCAudioSource';
// Factory functions for data source only
export {
  createElectronAudioDataSource,
  createIPCAudioDataSource,
  // Backward compatibility
  createRemoteAudioDataSource,
  ElectronAudioDataSource,
  IPCAudioDataSource,
  isElectronEnvironment,
  RemoteAudioDataSource,
} from './IPCAudioSource';

// Import types for internal use
// (No internal types needed currently)

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '0.1.0';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if running in Electron renderer process
 *
 * @returns True if running in Electron renderer process
 */
export function isElectronRenderer(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as any).process === 'object' &&
    (window as any).process?.type === 'renderer'
  );
}

/**
 * Check if Electron API is available
 *
 * @returns True if window.electronAPI is available
 */
export function isElectronAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 'electronAPI' in window;
}

// Note: Configuration is now handled at the demo level
// useNativeAudio hook is simplified to only provide data access
