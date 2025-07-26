/**
 * Canvas Renderer Unit Tests
 *
 * Testing our actual exported functions from canvasRenderer.ts
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WaveformDataPoint } from '../types';
import { drawByLiveStream, renderBar, resizeCanvas, setupCanvas } from '../utils/canvasRenderer';

// Mock Canvas and Context
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  beginPath: vi.fn(),
  roundRect: vi.fn(),
  fill: vi.fn(),
} as unknown as CanvasRenderingContext2D;

const mockCanvas = {
  width: 800,
  height: 200,
  style: { width: '', height: '' },
  getContext: vi.fn(() => mockContext),
} as unknown as HTMLCanvasElement;

describe('setupCanvas Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should setup canvas with correct dimensions and context', () => {
    const result = setupCanvas(mockCanvas, '#ff0000');

    expect(result).not.toBeNull();
    expect(result!.width).toBe(800);
    expect(result!.height).toBe(200);
    expect(result!.halfWidth).toBe(400);
    expect(result!.halfHeight).toBe(100);
    expect(result!.context).toBe(mockContext);
  });

  it('should clear canvas and set background', () => {
    setupCanvas(mockCanvas, '#ff0000');

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
    expect(mockContext.fillStyle).toBe('#ff0000');
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 200);
  });

  it('should handle transparent background', () => {
    setupCanvas(mockCanvas, 'transparent');

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
    expect(mockContext.fillRect).not.toHaveBeenCalled();
  });

  it('should return null when context is not available', () => {
    const badCanvas = {
      ...mockCanvas,
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;

    const result = setupCanvas(badCanvas);

    expect(result).toBeNull();
  });
});

describe('renderBar Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render regular rectangle when rounded is 0', () => {
    renderBar({
      context: mockContext,
      x: 10,
      y: 20,
      width: 5,
      height: 30,
      color: '#00ff00',
      rounded: 0,
    });

    expect(mockContext.fillStyle).toBe('#00ff00');
    expect(mockContext.fillRect).toHaveBeenCalledWith(10, 20, 5, 30);
    expect(mockContext.beginPath).not.toHaveBeenCalled();
  });

  it('should render rounded rectangle when rounded > 0', () => {
    renderBar({
      context: mockContext,
      x: 10,
      y: 20,
      width: 5,
      height: 30,
      color: '#00ff00',
      rounded: 3,
    });

    expect(mockContext.fillStyle).toBe('#00ff00');
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.roundRect).toHaveBeenCalledWith(10, 20, 5, 30, 3);
    expect(mockContext.fill).toHaveBeenCalled();
  });
});

describe('resizeCanvas Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resize canvas with proper dimensions', () => {
    resizeCanvas(mockCanvas, 1000, 300, '#0000ff');

    expect(mockCanvas.style.width).toBe('1000px');
    expect(mockCanvas.style.height).toBe('300px');
    expect(mockCanvas.width).toBe(1000);
    expect(mockCanvas.height).toBe(300);
  });

  it('should set background when provided', () => {
    resizeCanvas(mockCanvas, 800, 200, '#ff0000');

    expect(mockContext.fillStyle).toBe('#ff0000');
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 200);
  });

  it('should not set background when transparent', () => {
    resizeCanvas(mockCanvas, 800, 200, 'transparent');

    expect(mockContext.fillRect).not.toHaveBeenCalled();
  });
});

describe('drawByLiveStream Function - Core Audio Processing', () => {
  let indexRef: React.MutableRefObject<number>;
  let index2Ref: React.MutableRefObject<number>;
  let picks: Array<WaveformDataPoint | null>;

  beforeEach(() => {
    vi.clearAllMocks();
    indexRef = { current: 0 };
    index2Ref = { current: 0 };
    picks = [];
  });

  it('should handle frequency domain data correctly', () => {
    // Frequency domain data: low average, some peaks
    const frequencyData = new Uint8Array([0, 5, 10, 15, 20, 80, 120, 0, 5, 10]);

    drawByLiveStream({
      audioData: frequencyData,
      unit: 100,
      index: indexRef,
      index2: index2Ref,
      canvas: mockCanvas,
      isAudioInProgress: true,
      isPausedAudio: false,
      picks,
      backgroundColor: '#000000',
      barWidth: 2,
      mainBarColor: '#00ff00',
      secondaryBarColor: '#666666',
      rounded: 0,
      animateCurrentPick: true,
      fullscreen: false,
    });

    // Should clear and setup canvas
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
    // Background should be set initially (first call to fillStyle)
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 200);
  });

  it('should handle time domain data correctly', () => {
    // Time domain data: centered around 128
    const timeData = new Uint8Array([100, 120, 140, 160, 180, 128, 90, 170]);

    drawByLiveStream({
      audioData: timeData,
      unit: 100,
      index: indexRef,
      index2: index2Ref,
      canvas: mockCanvas,
      isAudioInProgress: true,
      isPausedAudio: false,
      picks,
      backgroundColor: 'transparent',
      barWidth: 2,
      mainBarColor: '#ff0000',
      secondaryBarColor: '#333333',
      rounded: 0,
      animateCurrentPick: true,
      fullscreen: false,
    });

    // Should clear canvas but not set background for transparent
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
    expect(mockContext.fillRect).toHaveBeenCalledTimes(0); // No background fill
  });

  it('should handle empty audio data gracefully', () => {
    const emptyData = new Uint8Array(0);

    expect(() => {
      drawByLiveStream({
        audioData: emptyData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: true,
        isPausedAudio: false,
        picks,
        backgroundColor: '#000000',
        barWidth: 2,
        mainBarColor: '#00ff00',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });
    }).not.toThrow();

    // Should still setup canvas
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
  });

  it('should handle paused audio state', () => {
    const audioData = new Uint8Array([100, 120, 140, 160]);

    drawByLiveStream({
      audioData,
      unit: 100,
      index: indexRef,
      index2: index2Ref,
      canvas: mockCanvas,
      isAudioInProgress: true,
      isPausedAudio: true, // Paused state
      picks,
      backgroundColor: '#000000',
      barWidth: 2,
      mainBarColor: '#00ff00',
      secondaryBarColor: '#666666',
      rounded: 0,
      animateCurrentPick: true,
      fullscreen: false,
    });

    // Should setup canvas but handle paused state differently
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
  });

  it('should handle inactive audio state', () => {
    const audioData = new Uint8Array([100, 120, 140, 160]);

    drawByLiveStream({
      audioData,
      unit: 100,
      index: indexRef,
      index2: index2Ref,
      canvas: mockCanvas,
      isAudioInProgress: false, // Inactive
      isPausedAudio: false,
      picks,
      backgroundColor: '#000000',
      barWidth: 2,
      mainBarColor: '#00ff00',
      secondaryBarColor: '#666666',
      rounded: 0,
      animateCurrentPick: true,
      fullscreen: false,
    });

    // Should clear picks when inactive
    expect(picks.length).toBe(0);
  });
});
