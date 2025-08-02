export interface AudioProcessingOptions {
  echoCancellation: boolean;
  autoGainControl: boolean;
  noiseSuppression: boolean;
  // Audio format constraints (optional)
  sampleRate?: number;
  sampleSize?: number;
  channelCount?: number;
}

export const DEFAULT_AUDIO_PROCESSING: AudioProcessingOptions = {
  echoCancellation: true,
  autoGainControl: true,
  noiseSuppression: true,
  // Audio format constraints - Note: Browser support varies
  // Most browsers default to 48kHz/16-bit and may ignore these constraints
  sampleRate: 16000, // Requested sample rate (browser may override)
  sampleSize: 16, // Requested bit depth (browser may override)
  channelCount: 1, // Mono audio for waveform visualization
};
