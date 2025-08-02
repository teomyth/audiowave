import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Standardized audio methods (with optional deviceId for multi-device support)
  startAudio: (deviceId?: string) => Promise<void>;
  stopAudio: (deviceId?: string) => Promise<void>;
  pauseAudio: (deviceId?: string) => Promise<void>;
  resumeAudio: (deviceId?: string) => Promise<void>;

  // Audio buffer methods (with optional deviceId for multi-device support)
  requestSharedBuffer: (config: AudioCaptureConfig, deviceId?: string) => Promise<ArrayBuffer>;
  setupAudioStream: (config: AudioCaptureConfig, deviceId?: string) => Promise<ArrayBuffer>;

  // Event listeners (with deviceId support for multi-device)
  onAudioData: (callback: (deviceId: string, data: Uint8Array) => void) => () => void;
  onAudioError: (callback: (deviceId: string, error: string) => void) => () => void;

  // System info
  getSystemInfo: () => Promise<SystemInfo>;
}

/**
 * Audio configuration for AudioWave integration
 * These settings control the audio capture quality and performance
 */
export interface AudioCaptureConfig {
  sampleRate: number; // Audio sample rate (e.g., 44100 Hz)
  sampleSize: 8 | 16 | 24 | 32; // Sample format (bits per sample)
  channelCount: number; // Number of audio channels (1 = mono, 2 = stereo)
}

export interface SystemInfo {
  platform: string;
  version: string;
  audioDevices: AudioDeviceInfo[];
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  // Standardized audio methods (with optional deviceId)
  startAudio: (deviceId?: string) => ipcRenderer.invoke('audio:start', deviceId || 'default'),
  stopAudio: (deviceId?: string) => ipcRenderer.invoke('audio:stop', deviceId || 'default'),
  pauseAudio: (deviceId?: string) => ipcRenderer.invoke('audio:pause', deviceId || 'default'),
  resumeAudio: (deviceId?: string) => ipcRenderer.invoke('audio:resume', deviceId || 'default'),

  // Audio buffer methods (with optional deviceId)
  requestSharedBuffer: (config: AudioCaptureConfig, deviceId?: string) =>
    ipcRenderer.invoke('audio:request-shared-buffer', config, deviceId || 'default'),
  setupAudioStream: (config: AudioCaptureConfig, deviceId?: string) =>
    ipcRenderer.invoke('audio:request-shared-buffer', config, deviceId || 'default'),

  onAudioData: (callback: (deviceId: string, data: Uint8Array) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, deviceId: string, data: Uint8Array) => {
      callback(deviceId, data);
    };
    ipcRenderer.on('audio:data', listener);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('audio:data', listener);
    };
  },

  onAudioError: (callback: (deviceId: string, error: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, deviceId: string, error: string) => {
      callback(deviceId, error);
    };
    ipcRenderer.on('audio:error', listener);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('audio:error', listener);
    };
  },

  getSystemInfo: () => ipcRenderer.invoke('system:info'),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
