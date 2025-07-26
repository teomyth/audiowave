// Export hooks with renamed exports for clarity

// Export main App component if needed
export { default as App } from './App';
// Export components for reuse
export { AudioControls } from './components/AudioControls';
export {
  PauseIcon,
  PlayIcon,
  ResumeIcon,
  StopIcon,
} from './components/AudioIcons';
export { ErrorDisplay } from './components/ErrorDisplay';
// Export icons that might be needed
export {
  AudioWaveIcon,
  GitHubIcon,
  MicrophoneIcon,
  NPMIcon,
} from './components/Icons';
export { WaveformIcon } from './components/WaveformIcon';
export type {
  AudioActions,
  AudioState,
  AudioStatus,
  UseAudioReturn,
} from './hooks/useAudio';
export { useAudio as useWebAudio } from './hooks/useAudio';
export type { AudioWaveConfig } from './settings';
// Export settings and types
export { DEFAULT_WAVE_CONFIG, WaveSettings } from './settings';
