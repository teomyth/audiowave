export interface AudioProcessingOptions {
  echoCancellation: boolean;
  autoGainControl: boolean;
  noiseSuppression: boolean;
}

export const DEFAULT_AUDIO_PROCESSING: AudioProcessingOptions = {
  echoCancellation: true,
  autoGainControl: true,
  noiseSuppression: true,
};
