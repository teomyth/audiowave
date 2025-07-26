/**
 * Core type definitions for audiowave
 * Provides unified interfaces for audio sources and visualization components
 */

import type React from 'react';

// Import the new standard AudioSource interface
import type { AudioSource as StandardAudioSource } from './types/AudioSource';

// ============================================================================
// AUDIO SOURCE TYPES
// ============================================================================

/**
 * AudioSource type - now only supports the standard interface
 * All audio sources must implement getAudioData() and isActive() methods
 */
export type AudioSource = StandardAudioSource;

/**
 * Basic audio source configuration - only affects rendering
 */
export interface AudioSourceConfig {
  /** FFT size for frequency analysis - affects audioData array length (default: 2048) */
  fftSize?: number;
}

// ============================================================================
// VISUALIZATION COMPONENT TYPES
// ============================================================================

/**
 * Comprehensive props interface for AudioWave component
 * Compatible with React Voice Visualizer API
 */
export interface AudioWaveProps {
  // === AUDIO SOURCE ===
  /** Audio source - supports MediaStream, HTMLMediaElement, or AudioNode */
  source?: AudioSource;

  // === DIMENSIONS ===
  /** Component width - supports CSS units and numbers */
  width?: string | number;
  /** Component height in pixels */
  height?: number;

  // === VISUAL STYLING ===
  /** Background color of the visualization area */
  backgroundColor?: string;
  /** Primary color for active audio bars (React Voice Visualizer: mainBarColor) */
  barColor?: string;
  /** Secondary color for inactive/past bars */
  secondaryBarColor?: string;
  /** Width of each audio bar in pixels */
  barWidth?: number;
  /** Gap between bars in pixels */
  gap?: number;
  /** Border radius for rounded bars */
  rounded?: number;

  // === BORDER STYLING ===
  /** Show border around the visualization area */
  showBorder?: boolean;
  /** Border color */
  borderColor?: string;
  /** Border width in pixels */
  borderWidth?: number;
  /** Border radius for rounded corners */
  borderRadius?: number;

  // === ANIMATION & RENDERING ===
  /** Animation speed (1-6, higher number is slower) */
  speed?: number;
  /** Enable smooth bar transitions */
  animateCurrentPick?: boolean;
  /** Fill entire parent container */
  fullscreen?: boolean;
  /** Whether to show visualization only when active */
  onlyActive?: boolean;
  /**
   * Visualization gain multiplier for waveform amplitude
   * @default 1.0 (no gain)
   * @range 0.1 - 10.0
   */
  gain?: number;

  // === STATE CONTROL ===
  /** Whether the visualization is paused (keeps waveform frozen) */
  isPaused?: boolean;

  // === STATE CALLBACKS ===
  /** Callback when visualization state changes */
  onStateChange?: (state: AudioWaveState) => void;

  // === ADVANCED CUSTOMIZATION ===
  /** Custom rendering function for advanced visualizations */
  customRenderer?: (context: RenderContext) => void;

  // === PLACEHOLDER CONTENT ===
  /** Custom placeholder content when no audio source is provided */
  placeholder?: React.ReactNode;
  /** Whether to show background and border in placeholder state */
  showPlaceholderBackground?: boolean;

  // === CSS CLASSES ===
  /** CSS class for the main container */
  className?: string;
  /** CSS class for the canvas element */
  canvasClassName?: string;

  // === CALLBACKS ===
  /** Called when rendering starts */
  onRenderStart?: () => void;
  /** Called when rendering stops */
  onRenderStop?: () => void;
  /** Called on render errors */
  onError?: (error: Error) => void;
}

/**
 * AudioWave visualization states
 */
export type AudioWaveState = 'idle' | 'visualizing' | 'paused';

/**
 * AudioWave component control interface for imperative control
 * Following React media component best practices
 */
export interface AudioWaveController {
  /** Pause visualization (freeze waveform display) */
  pause: () => void;
  /** Resume visualization from paused state */
  resume: () => void;
  /** Clear all waveform data and reset display */
  clear: () => void;
  /** Get current paused state */
  isPaused: () => boolean;
  /** Get current state */
  getState: () => AudioWaveState;
  /** Get current audio data */
  getAudioData: () => Uint8Array;
}

/**
 * Context object provided to custom renderer functions
 */
export interface RenderContext {
  /** Canvas element for drawing */
  canvas: HTMLCanvasElement;
  /** 2D rendering context */
  context: CanvasRenderingContext2D;
  /** Current audio data frame (frequency domain) */
  audioData: Uint8Array;
  /** Whether audio source is active */
  isActive: boolean;
  /** Current timestamp for animations */
  timestamp: number;
  /** Canvas dimensions */
  dimensions: {
    width: number;
    height: number;
  };
}

// ============================================================================
// LEGACY TYPES (removed - use new AudioSource architecture)
// ============================================================================

// Note: useMediaStream and useSharedArrayBuffer hooks have been removed
// Use useAudioSource with appropriate source types instead

/**
 * Return type for useElectronAudio hook
 * @deprecated Use new architecture with AdaptedAudioSource instead
 */
export interface UseElectronAudioReturn {
  /** The audio source for Electron IPC */
  source: AudioSource | null;
  /** Whether the audio source is active */
  isActive: boolean;
  /** Function to start the audio source */
  start: () => Promise<void>;
  /** Function to stop the audio source */
  stop: () => void;
  /** Any error that occurred */
  error: Error | null;
  /** Current performance metrics */
  performanceMetrics: PerformanceMetrics | null;
}

export interface PerformanceMetrics {
  averageLatency: number;
  dataRate: number;
  droppedFrames: number;
  memoryUsage: number;
}

// ============================================================================
// SCROLLING WAVEFORM TYPES
// ============================================================================

/**
 * Data point for scrolling waveform visualization
 * Represents a single waveform segment with position and height
 */
export interface WaveformDataPoint {
  /** Y position as percentage of canvas height (0-100) */
  startY: number;
  /** Bar height as percentage of canvas height */
  barHeight: number;
}

/**
 * Parameters for scrolling waveform rendering
 */
export interface ScrollingWaveformParams {
  /** Canvas element for drawing */
  canvas: HTMLCanvasElement;
  /** Current audio data frame (time domain) */
  audioData: Uint8Array;
  /** Array of historical waveform data points */
  picks: Array<WaveformDataPoint | null>;
  /** Current animation index */
  index: React.MutableRefObject<number>;
  /** Secondary animation index for smooth scrolling */
  index2: React.MutableRefObject<number>;
  /** Unit calculation: barWidth + gap * barWidth */
  unit: number;
  /** Whether audio is in progress */
  isAudioInProgress: boolean;
  /** Whether audio is paused */
  isPausedAudio: boolean;
  /** Background color */
  backgroundColor: string;
  /** Primary waveform color */
  barColor: string;
  /** Secondary/inactive waveform color */
  secondaryBarColor: string;
  /** Width of each waveform bar */
  barWidth: number;
  /** Gap between waveform bars */
  gap: number;
  /** Border radius for rounded bars */
  rounded: number;
  /** Enable current pick animation */
  animateCurrentPick: boolean;
  /** Fill entire canvas width */
  fullscreen: boolean;
  /** Visualization gain multiplier (default: 1.0) */
  gain?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Error types for better error handling
 */
export enum AudioWaveErrorType {
  MEDIA_NOT_SUPPORTED = 'MEDIA_NOT_SUPPORTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  SHARED_BUFFER_ERROR = 'SHARED_BUFFER_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INVALID_STATE = 'INVALID_STATE',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
}

/**
 * Custom error class for audiowave
 */
export class AudioWaveError extends Error {
  constructor(
    public type: AudioWaveErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AudioWaveError';
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if source implements standard AudioSource interface
 */
export function isStandardAudioSource(source: any): source is AudioSource {
  return (
    source && typeof source.getAudioData === 'function' && typeof source.isActive === 'function'
  );
}

/**
 * Type guard to check if SharedArrayBuffer is supported (Electron)
 */
export function isSharedArrayBufferSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}
