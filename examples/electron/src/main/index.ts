import { join } from 'node:path';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import icon from '../../resources/icon.png?asset';
import type { AudioCaptureConfig } from './audioCapture';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000, // Optimized default width: suitable for content display, not too large
    height: 800, // Increased height: ensures all content is visible, including settings panel
    minWidth: 800, // Minimum width: ensures settings panel and waveform display properly
    minHeight: 700, // Increased minimum height: ensures all controls are visible when scrolling
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      // Enable SharedArrayBuffer support
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Configure session for SharedArrayBuffer support
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Embedder-Policy': ['require-corp'],
        'Cross-Origin-Opener-Policy': ['same-origin'],
      },
    });
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Handle app protocol for deep linking (optional)
app.setAsDefaultProtocolClient('audiowave');

// Import audio capture
import type { AudioDeviceInfo } from '@audiowave/core';
import { AudioCapture } from './audioCapture';

// Define types for IPC communication
export interface SystemInfo {
  platform: string;
  version: string;
  audioDevices: AudioDeviceInfo[];
}

// Initialize audio capture
const audioCapture = new AudioCapture();

// IPC Handlers (standardized naming with deviceId support)
ipcMain.handle('audio:start', async (_, deviceId: string = 'default') => {
  try {
    await audioCapture.start();
    return { success: true };
  } catch (error) {
    console.error(`Failed to start audio for device ${deviceId}:`, error);
    throw error;
  }
});

ipcMain.handle('audio:stop', async (_, deviceId: string = 'default') => {
  try {
    await audioCapture.stop();
    return { success: true };
  } catch (error) {
    console.error(`Failed to stop audio for device ${deviceId}:`, error);
    throw error;
  }
});

ipcMain.handle('audio:pause', async (_, deviceId: string = 'default') => {
  try {
    await audioCapture.stop(); // For this simplified implementation, pause = stop
    return { success: true };
  } catch (error) {
    console.error(`Failed to pause audio for device ${deviceId}:`, error);
    throw error;
  }
});

ipcMain.handle('audio:resume', async (_, deviceId: string = 'default') => {
  try {
    await audioCapture.start(); // For this simplified implementation, resume = start
    return { success: true };
  } catch (error) {
    console.error(`Failed to resume audio for device ${deviceId}:`, error);
    throw error;
  }
});

ipcMain.handle(
  'audio:request-shared-buffer',
  async (_, config: AudioCaptureConfig, deviceId: string = 'default') => {
    try {
      const audioBuffer = audioCapture.createAudioBuffer(config);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to create audio buffer for device ${deviceId}:`, error);
      throw error;
    }
  }
);

ipcMain.handle('system:info', async (): Promise<SystemInfo> => {
  try {
    const audioDevices = await audioCapture.getAudioDevices();
    return {
      platform: process.platform,
      version: process.version,
      audioDevices,
    };
  } catch (error) {
    console.error('Failed to get system info:', error);
    return {
      platform: process.platform,
      version: process.version,
      audioDevices: [],
    };
  }
});

/**
 * Forward audio events to renderer - essential for AudioWave integration
 * This is where processed audio data gets sent to the React component
 */
audioCapture.on('error', (deviceId: string, error: string) => {
  mainWindow?.webContents.send('audio:error', deviceId, error);
});

audioCapture.on('data', (deviceId: string, data: Uint8Array) => {
  // Send processed audio data to renderer - this feeds the AudioWave component
  mainWindow?.webContents.send('audio:data', deviceId, data);
});

// Cleanup on app quit
app.on('before-quit', () => {
  audioCapture.destroy();
});

export { mainWindow };
