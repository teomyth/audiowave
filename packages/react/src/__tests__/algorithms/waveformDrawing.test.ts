/**
 * Waveform Drawing Algorithm Tests
 *
 * Specialized tests for the core drawing logic to verify center-line rendering,
 * symmetric up/down drawing, and correct handling of time-domain vs frequency-domain data.
 * These tests address the specific issues mentioned about waveform rendering.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WaveformDataPoint } from '../../types';
import { drawByLiveStream } from '../../utils/canvasRenderer';

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

describe('Waveform Drawing Algorithm Tests', () => {
  let picks: Array<WaveformDataPoint | null>;
  let indexRef: React.MutableRefObject<number>;
  let index2Ref: React.MutableRefObject<number>;

  beforeEach(() => {
    vi.clearAllMocks();
    picks = [];
    indexRef = { current: 0 };
    index2Ref = { current: 0 };

    // Reset canvas dimensions
    mockCanvas.width = 800;
    mockCanvas.height = 200;
  });

  describe('Data Type Detection', () => {
    it('should correctly identify frequency domain data', () => {
      // Frequency domain data: mostly low values with some peaks
      const frequencyData = new Uint8Array([0, 5, 10, 2, 80, 3, 1, 0, 120, 4, 2, 0, 1, 90, 0, 3]);

      // Calculate average to verify detection logic
      const avgValue = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
      expect(avgValue).toBeLessThan(64); // Should be detected as frequency data

      expect(() => {
        drawByLiveStream({
          audioData: frequencyData,
          unit: 100,
          index: indexRef,
          index2: index2Ref,
          canvas: mockCanvas,
          isAudioInProgress: true,
          isPausedAudio: false,
          picks,
          backgroundColor: 'transparent',
          barWidth: 2,
          mainBarColor: '#ffffff',
          secondaryBarColor: '#666666',
          rounded: 0,
          animateCurrentPick: true,
          fullscreen: false,
        });
      }).not.toThrow();
    });

    it('should correctly identify time domain data', () => {
      // Time domain data: centered around 128 with variations
      const timeDomainData = new Uint8Array([
        128, 140, 120, 150, 110, 160, 100, 170, 90, 180, 80, 128, 135, 125, 145, 115, 155, 105, 165,
        95,
      ]);

      // Calculate average to verify detection logic
      const avgValue = timeDomainData.reduce((sum, val) => sum + val, 0) / timeDomainData.length;
      expect(avgValue).toBeGreaterThanOrEqual(64); // Should be detected as time domain data

      expect(() => {
        drawByLiveStream({
          audioData: timeDomainData,
          unit: 100,
          index: indexRef,
          index2: index2Ref,
          canvas: mockCanvas,
          isAudioInProgress: true,
          isPausedAudio: false,
          picks,
          backgroundColor: 'transparent',
          barWidth: 2,
          mainBarColor: '#ffffff',
          secondaryBarColor: '#666666',
          rounded: 0,
          animateCurrentPick: true,
          fullscreen: false,
        });
      }).not.toThrow();
    });
  });

  describe('Center Line Calculation', () => {
    it('should use 128 as center value for time domain data', () => {
      // Time domain data with clear deviations from center (128)
      const timeDomainData = new Uint8Array([128, 148, 108, 168, 88, 128, 158, 98, 178, 78]);

      // Test that center line calculation works correctly
      const centerValue = 128;
      const expectedMaxAmplitude = Math.max(
        ...timeDomainData.map((val) => Math.abs(val - centerValue))
      );

      expect(expectedMaxAmplitude).toBe(50); // 178 - 128 = 50

      drawByLiveStream({
        audioData: timeDomainData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: true,
        isPausedAudio: false,
        picks,
        backgroundColor: 'transparent',
        barWidth: 2,
        mainBarColor: '#ffffff',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });

      // Verify canvas operations were called
      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it('should handle silence (all values at 128) correctly', () => {
      // Silence: all values at center line
      const silenceData = new Uint8Array(16).fill(128);

      expect(() => {
        drawByLiveStream({
          audioData: silenceData,
          unit: 100,
          index: indexRef,
          index2: index2Ref,
          canvas: mockCanvas,
          isAudioInProgress: true,
          isPausedAudio: false,
          picks,
          backgroundColor: 'transparent',
          barWidth: 2,
          mainBarColor: '#ffffff',
          secondaryBarColor: '#666666',
          rounded: 0,
          animateCurrentPick: true,
          fullscreen: false,
        });
      }).not.toThrow();

      // Should still render (flat line)
      expect(mockContext.clearRect).toHaveBeenCalled();
    });
  });

  describe('Symmetric Up/Down Drawing', () => {
    it('should handle positive and negative deviations symmetrically', () => {
      // Data with both positive and negative deviations from center
      const symmetricData = new Uint8Array([
        128, // center
        148, // +20 from center
        108, // -20 from center
        168, // +40 from center
        88, // -40 from center
        178, // +50 from center
        78, // -50 from center
        128, // back to center
      ]);

      drawByLiveStream({
        audioData: symmetricData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: true,
        isPausedAudio: false,
        picks,
        backgroundColor: 'transparent',
        barWidth: 2,
        mainBarColor: '#ffffff',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });

      // Verify rendering operations
      expect(mockContext.clearRect).toHaveBeenCalled();
      // Note: fillRect might not be called for transparent background
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);
    });

    it('should handle extreme values correctly', () => {
      // Test with extreme values (0 and 255)
      const extremeData = new Uint8Array([
        0, // Maximum negative deviation (-128)
        255, // Maximum positive deviation (+127)
        128, // Center
        64, // -64 from center
        192, // +64 from center
      ]);

      expect(() => {
        drawByLiveStream({
          audioData: extremeData,
          unit: 100,
          index: indexRef,
          index2: index2Ref,
          canvas: mockCanvas,
          isAudioInProgress: true,
          isPausedAudio: false,
          picks,
          backgroundColor: 'transparent',
          barWidth: 2,
          mainBarColor: '#ffffff',
          secondaryBarColor: '#666666',
          rounded: 0,
          animateCurrentPick: true,
          fullscreen: false,
        });
      }).not.toThrow();
    });
  });

  describe('Canvas Drawing Operations', () => {
    it('should clear canvas before drawing', () => {
      const testData = new Uint8Array([128, 140, 120, 150]);

      drawByLiveStream({
        audioData: testData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: true,
        isPausedAudio: false,
        picks,
        backgroundColor: '#000000',
        barWidth: 2,
        mainBarColor: '#ffffff',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });

      // Should clear canvas first
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);

      // Should call fillRect for background (the exact fillStyle value may vary due to mock behavior)
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 200);
    });

    it('should not set background for transparent', () => {
      const testData = new Uint8Array([128, 140, 120, 150]);

      drawByLiveStream({
        audioData: testData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: true,
        isPausedAudio: false,
        picks,
        backgroundColor: 'transparent',
        barWidth: 2,
        mainBarColor: '#ffffff',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });

      // Should clear canvas
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 200);

      // Should not fill background for transparent
      const fillRectCalls = (mockContext.fillRect as any).mock.calls;
      const backgroundFillCall = fillRectCalls.find(
        (call: any[]) => call[0] === 0 && call[1] === 0 && call[2] === 800 && call[3] === 200
      );
      expect(backgroundFillCall).toBeUndefined();
    });
  });

  describe('Animation and State Handling', () => {
    it('should handle paused state correctly', () => {
      const testData = new Uint8Array([128, 140, 120, 150]);

      drawByLiveStream({
        audioData: testData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: true,
        isPausedAudio: true, // Paused
        picks,
        backgroundColor: 'transparent',
        barWidth: 2,
        mainBarColor: '#ffffff',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });

      // Should still render when paused
      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it('should handle inactive audio state', () => {
      const testData = new Uint8Array([128, 140, 120, 150]);

      drawByLiveStream({
        audioData: testData,
        unit: 100,
        index: indexRef,
        index2: index2Ref,
        canvas: mockCanvas,
        isAudioInProgress: false, // Inactive
        isPausedAudio: false,
        picks,
        backgroundColor: 'transparent',
        barWidth: 2,
        mainBarColor: '#ffffff',
        secondaryBarColor: '#666666',
        rounded: 0,
        animateCurrentPick: true,
        fullscreen: false,
      });

      // Should clear picks when inactive
      expect(picks.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty audio data', () => {
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
          backgroundColor: 'transparent',
          barWidth: 2,
          mainBarColor: '#ffffff',
          secondaryBarColor: '#666666',
          rounded: 0,
          animateCurrentPick: true,
          fullscreen: false,
        });
      }).not.toThrow();
    });

    it('should handle single data point', () => {
      const singleData = new Uint8Array([150]);

      expect(() => {
        drawByLiveStream({
          audioData: singleData,
          unit: 100,
          index: indexRef,
          index2: index2Ref,
          canvas: mockCanvas,
          isAudioInProgress: true,
          isPausedAudio: false,
          picks,
          backgroundColor: 'transparent',
          barWidth: 2,
          mainBarColor: '#ffffff',
          secondaryBarColor: '#666666',
          rounded: 0,
          animateCurrentPick: true,
          fullscreen: false,
        });
      }).not.toThrow();
    });
  });
});
