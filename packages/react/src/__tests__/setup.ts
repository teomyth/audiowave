/**
 * Test setup for audiowave
 * Provides mocks and global test utilities
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Use globalThis instead of global for better TypeScript compatibility
const globalObj = globalThis as any;

// ============================================================================
// MEDIA STREAM API MOCKS
// ============================================================================

// Mock MediaStream constructor
globalObj.MediaStream = class MockMediaStream {
  id = 'mock-stream';
  active = true;
  getTracks = vi.fn(() => []);
  getAudioTracks = vi.fn(() => []);
  getVideoTracks = vi.fn(() => []);
  addTrack = vi.fn();
  removeTrack = vi.fn();
  clone = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
};

// Mock HTMLMediaElement constructor
globalObj.HTMLMediaElement = class MockHTMLMediaElement {
  src = '';
  currentTime = 0;
  duration = 100;
  paused = true;
  play = vi.fn();
  pause = vi.fn();
  load = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
};

// Mock CanvasRenderingContext2D
globalObj.CanvasRenderingContext2D = class MockCanvasRenderingContext2D {
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  globalAlpha = 1;
  fillRect = vi.fn();
  strokeRect = vi.fn();
  clearRect = vi.fn();
  beginPath = vi.fn();
  closePath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  arc = vi.fn();
  fill = vi.fn();
  stroke = vi.fn();
  save = vi.fn();
  restore = vi.fn();
  translate = vi.fn();
  rotate = vi.fn();
  scale = vi.fn();
  setTransform = vi.fn();
  resetTransform = vi.fn();
  measureText = vi.fn(() => ({ width: 100 }));
  fillText = vi.fn();
  strokeText = vi.fn();
  createLinearGradient = vi.fn();
  createRadialGradient = vi.fn();
  createPattern = vi.fn();
  getImageData = vi.fn();
  putImageData = vi.fn();
  drawImage = vi.fn();
};

// ============================================================================
// WEB AUDIO API MOCKS
// ============================================================================

// Mock AudioContext
const mockAudioContext = {
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    minDecibels: -100,
    maxDecibels: -30,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    getFloatFrequencyData: vi.fn(),
    getFloatTimeDomainData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    mediaStream: null,
  })),
  createMediaElementSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    mediaElement: null,
  })),
  createGain: vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
  state: 'running',
  sampleRate: 44100,
  currentTime: 0,
  listener: {},
  resume: vi.fn(() => Promise.resolve()),
  suspend: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock global AudioContext
globalObj.AudioContext = vi.fn(() => mockAudioContext) as any;
globalObj.webkitAudioContext = vi.fn(() => mockAudioContext) as any;

// ============================================================================
// MEDIA STREAM API MOCKS
// ============================================================================

const mockMediaStream = {
  id: 'mock-stream',
  active: true,
  getTracks: vi.fn(() => []),
  getAudioTracks: vi.fn(() => []),
  getVideoTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  clone: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

const mockMediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve(mockMediaStream)),
  getDisplayMedia: vi.fn(() => Promise.resolve(mockMediaStream)),
  enumerateDevices: vi.fn(() => Promise.resolve([])),
  getSupportedConstraints: vi.fn(() => ({})),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock navigator.mediaDevices
Object.defineProperty(globalObj.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

// ============================================================================
// CANVAS API MOCKS
// ============================================================================

const mockCanvasContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
};

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === '2d') {
    return mockCanvasContext;
  }
  return null;
}) as any;

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback?.(new Blob(['mock'], { type: 'image/png' }));
});

// ============================================================================
// ANIMATION FRAME MOCKS
// ============================================================================

globalObj.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(Date.now()), 16);
});

globalObj.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// ============================================================================
// PERFORMANCE API MOCKS
// ============================================================================

globalObj.performance = {
  ...globalObj.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

// ============================================================================
// SHARED ARRAY BUFFER MOCKS
// ============================================================================

// Mock SharedArrayBuffer for testing (if not available)
if (typeof SharedArrayBuffer === 'undefined') {
  globalObj.SharedArrayBuffer = class MockSharedArrayBuffer {
    constructor(public byteLength: number) {}
    slice(_begin?: number, _end?: number): ArrayBuffer {
      return new ArrayBuffer(this.byteLength);
    }
  } as any;
}

// ============================================================================
// RESIZE OBSERVER MOCK
// ============================================================================

globalObj.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ============================================================================
// INTERSECTION OBSERVER MOCK
// ============================================================================

globalObj.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ============================================================================
// CONSOLE MOCKS (for cleaner test output)
// ============================================================================

// Suppress console.warn in tests unless explicitly needed
const originalWarn = console.warn;
console.warn = vi.fn((...args) => {
  // Only show warnings that are not from our mocks
  if (!args.some((arg) => typeof arg === 'string' && arg.includes('mock'))) {
    originalWarn(...args);
  }
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Create a mock audio data array for testing
 */
export function createMockAudioData(size = 1024, amplitude = 128): Uint8Array {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = Math.floor(Math.sin(i * 0.1) * amplitude + amplitude);
  }
  return data;
}

/**
 * Wait for next animation frame (mocked)
 */
export function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Wait for specified time in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock canvas element for testing
 */
export function createMockCanvas(width = 800, height = 200): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Override getContext to return our mock
  canvas.getContext = vi.fn((contextType) => {
    if (contextType === '2d') {
      return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        createLinearGradient: vi.fn(),
        createRadialGradient: vi.fn(),
        createPattern: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        drawImage: vi.fn(),
        roundRect: vi.fn(), // Add roundRect for rounded rectangles
      };
    }
    return null;
  }) as any;

  return canvas;
}
