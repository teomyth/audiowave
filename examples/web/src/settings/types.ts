/**
 * AudioWave Settings Configuration Types
 *
 * These types define the complete configuration interface for the AudioWave component.
 * They can be used across different environments (Web Demo, Electron, etc.)
 */

export interface WaveSizeConfig {
  /** Width as percentage of container (10-100) */
  width: number;
  /** Height in pixels (50-400) */
  height: number;
  /** Border width in pixels (0-4) */
  borderWidth: number;
  /** Border radius in pixels (0-20) */
  borderRadius: number;
}

export interface WaveBarConfig {
  /** Width of individual frequency bars (1-8) */
  width: number;
  /** Space between frequency bars (0-5) */
  gap: number;
  /** Corner radius for rounded bar tops (0-8) */
  rounded: number;
  /** Animation speed multiplier (1-5) */
  speed: number;
  /** Visualization gain multiplier (0.1-10.0) */
  gain: number;
}

export interface WaveColorConfig {
  /** Background color of the wave container */
  background: string;
  /** Primary color for frequency bars */
  primary: string;
  /** Secondary color for bar gradients */
  secondary: string;
  /** Border color */
  border: string;
}

export interface WaveBehaviorConfig {
  /** Animate the currently playing frequency */
  animateCurrentPick: boolean;
  /** Enable fullscreen mode for the wave */
  fullscreen: boolean;
}

export interface AudioWaveConfig {
  /** Size and border configuration */
  size: WaveSizeConfig;
  /** Bar appearance configuration */
  bars: WaveBarConfig;
  /** Color scheme configuration */
  colors: WaveColorConfig;
  /** Behavior configuration */
  behavior: WaveBehaviorConfig;
}

export type ConfigChangeHandler<T = AudioWaveConfig> = (config: T) => void;

/**
 * Default configuration values
 */
export const DEFAULT_WAVE_CONFIG: AudioWaveConfig = {
  size: {
    width: 100, // 100% of container width (full width by default)
    height: 200, // Standard height for good visibility
    borderWidth: 0,
    borderRadius: 0,
  },
  bars: {
    width: 2,
    gap: 1,
    rounded: 0,
    speed: 3,
    gain: 1.0, // Default gain (no amplification)
  },
  colors: {
    background: '#2a2a2a',
    primary: '#ffffff',
    secondary: '#5e5e5e',
    border: '#333333',
  },
  behavior: {
    animateCurrentPick: true,
    fullscreen: false,
  },
};
