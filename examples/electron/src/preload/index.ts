import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Standardized audio methods (with optional deviceId for multi-device support)
  startAudio: (deviceId?: string) => Promise<void>;
  stopAudio: (deviceId?: string) => Promise<void>;
  pauseAudio: (deviceId?: string) => Promise<void>;
  resumeAudio: (deviceId?: string) => Promise<void>;

  // Legacy audio capture methods (deprecated)
  /** @deprecated Use startAudio() instead */
  startAudioCapture: () => Promise<void>;
  /** @deprecated Use stopAudio() instead */
  stopAudioCapture: () => Promise<void>;

  // Audio buffer methods (with optional deviceId for multi-device support)
  requestSharedBuffer: (config: AudioCaptureConfig, deviceId?: string) => Promise<ArrayBuffer>;
  setupAudioStream: (config: AudioCaptureConfig, deviceId?: string) => Promise<ArrayBuffer>;

  // Event listeners (with deviceId support for multi-device)
  onAudioData: (callback: (deviceId: string, data: Uint8Array) => void) => () => void;
  onAudioError: (callback: (deviceId: string, error: string) => void) => () => void;

  // System info
  getSystemInfo: () => Promise<SystemInfo>;
}

export interface AudioCaptureConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
}

export interface SystemInfo {
  platform: string;
  version: string;
  audioDevices: AudioDeviceInfo[];
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
  channels: number;
  sampleRate: number;
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  // Standardized audio methods (with optional deviceId)
  startAudio: (deviceId?: string) => ipcRenderer.invoke('audio:start', deviceId || 'default'),
  stopAudio: (deviceId?: string) => ipcRenderer.invoke('audio:stop', deviceId || 'default'),
  pauseAudio: (deviceId?: string) => ipcRenderer.invoke('audio:pause', deviceId || 'default'),
  resumeAudio: (deviceId?: string) => ipcRenderer.invoke('audio:resume', deviceId || 'default'),

  // Legacy audio capture methods (deprecated)
  startAudioCapture: () => ipcRenderer.invoke('audio:start', 'default'),
  stopAudioCapture: () => ipcRenderer.invoke('audio:stop', 'default'),

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
