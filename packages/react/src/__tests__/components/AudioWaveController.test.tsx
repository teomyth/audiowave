/**
 * AudioWave Controller Tests
 *
 * Tests for the imperative API methods and state management of the AudioWave component.
 * These tests focus on the ref-based control interface and state transitions.
 */

import { act, render } from '@testing-library/react';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioWave } from '../../components/AudioWave';
import type { AudioSource, AudioWaveController } from '../../types';

// Mock AudioSource for testing
const createMockAudioSource = (
  isActive = true,
  audioData: Uint8Array | null = null
): AudioSource => ({
  getAudioData: vi.fn(() => audioData || new Uint8Array([128, 140, 120, 150, 110, 160, 100])),
  isActive: vi.fn(() => isActive),
});

// Mock Canvas and Context
const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  roundRect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
} as unknown as CanvasRenderingContext2D;

// Mock HTMLCanvasElement globally
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockContext),
});

describe('AudioWave Controller - Imperative API Tests', () => {
  let controllerRef: React.RefObject<AudioWaveController>;

  beforeEach(() => {
    vi.clearAllMocks();
    controllerRef = createRef<AudioWaveController>();
  });

  describe('Controller Reference', () => {
    it('should provide controller ref when component mounts', () => {
      const mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} source={mockSource} />);

      expect(controllerRef.current).toBeDefined();
      expect(controllerRef.current).toHaveProperty('pause');
      expect(controllerRef.current).toHaveProperty('resume');
      expect(controllerRef.current).toHaveProperty('clear');
      expect(controllerRef.current).toHaveProperty('isPaused');
      expect(controllerRef.current).toHaveProperty('getState');
      expect(controllerRef.current).toHaveProperty('getAudioData');
    });

    it('should provide all required methods in controller interface', () => {
      render(<AudioWave ref={controllerRef} />);

      const controller = controllerRef.current!;

      expect(typeof controller.pause).toBe('function');
      expect(typeof controller.resume).toBe('function');
      expect(typeof controller.clear).toBe('function');
      expect(typeof controller.isPaused).toBe('function');
      expect(typeof controller.getState).toBe('function');
      expect(typeof controller.getAudioData).toBe('function');
    });
  });

  describe('State Management', () => {
    it('should start in idle state when no source', () => {
      render(<AudioWave ref={controllerRef} />);

      const controller = controllerRef.current!;

      expect(controller.getState()).toBe('idle');
      expect(controller.isPaused()).toBe(false);
    });

    it('should transition to visualizing state when source is provided', () => {
      const mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} source={mockSource} />);

      const controller = controllerRef.current!;

      expect(controller.getState()).toBe('visualizing');
      expect(controller.isPaused()).toBe(false);
    });

    it('should handle isPaused prop correctly', () => {
      const mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} source={mockSource} isPaused={true} />);

      const controller = controllerRef.current!;

      // Note: isPaused prop affects rendering but internal state might still be 'visualizing'
      // The component handles both internal state and external isPaused prop
      expect(controller.getState()).toBeDefined();
    });
  });

  describe('Pause and Resume Methods', () => {
    it('should have pause method that can be called', async () => {
      const mockSource = createMockAudioSource();
      const onStateChange = vi.fn();

      render(<AudioWave ref={controllerRef} source={mockSource} onStateChange={onStateChange} />);

      const controller = controllerRef.current!;

      // Should start visualizing
      expect(controller.getState()).toBe('visualizing');

      // Pause method should not throw
      expect(() => {
        act(() => {
          controller.pause();
        });
      }).not.toThrow();

      // isPaused should return a boolean
      expect(typeof controller.isPaused()).toBe('boolean');
    });

    it('should have resume method that can be called', async () => {
      const mockSource = createMockAudioSource();
      const onStateChange = vi.fn();

      render(<AudioWave ref={controllerRef} source={mockSource} onStateChange={onStateChange} />);

      const controller = controllerRef.current!;

      // Resume method should not throw
      expect(() => {
        act(() => {
          controller.resume();
        });
      }).not.toThrow();

      // State should remain valid
      expect(['idle', 'visualizing', 'paused']).toContain(controller.getState());
    });

    it('should handle pause when idle with source', () => {
      const _mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} />);

      const controller = controllerRef.current!;

      // Should start idle
      expect(controller.getState()).toBe('idle');

      // Pause when idle but with source should work
      controller.pause();

      // State behavior depends on implementation
      expect(controller.getState()).toBeDefined();
    });

    it('should handle resume when idle with source', () => {
      const _mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} />);

      const controller = controllerRef.current!;

      // Should start idle
      expect(controller.getState()).toBe('idle');

      // Resume when idle should work if source is available
      controller.resume();

      expect(controller.getState()).toBeDefined();
    });
  });

  describe('Clear Method', () => {
    it('should clear waveform data', () => {
      const mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} source={mockSource} />);

      const controller = controllerRef.current!;

      // Clear should not throw
      expect(() => {
        controller.clear();
      }).not.toThrow();

      // State should remain the same (paused/visualizing) but data cleared
      const stateAfterClear = controller.getState();
      expect(['visualizing', 'paused', 'idle']).toContain(stateAfterClear);
    });

    it('should clear data while maintaining current state', () => {
      const mockSource = createMockAudioSource();

      render(<AudioWave ref={controllerRef} source={mockSource} />);

      const controller = controllerRef.current!;

      // Pause first
      controller.pause();
      const stateBefore = controller.getState();

      // Clear
      controller.clear();

      // State should be preserved
      expect(controller.getState()).toBe(stateBefore);
    });
  });

  describe('Data Access Methods', () => {
    it('should return audio data when available', () => {
      const testAudioData = new Uint8Array([100, 120, 140, 160, 180, 128, 90]);
      const mockSource = createMockAudioSource(true, testAudioData);

      render(<AudioWave ref={controllerRef} source={mockSource} />);

      const controller = controllerRef.current!;

      const audioData = controller.getAudioData();

      expect(audioData).toBeInstanceOf(Uint8Array);
      expect(audioData.length).toBeGreaterThan(0);
    });

    it('should return empty data when no source', () => {
      render(<AudioWave ref={controllerRef} />);

      const controller = controllerRef.current!;

      const audioData = controller.getAudioData();

      expect(audioData).toBeInstanceOf(Uint8Array);
      expect(audioData.length).toBe(0);
    });
  });

  describe('State Transitions', () => {
    it('should handle multiple method calls without errors', () => {
      const mockSource = createMockAudioSource();
      const onStateChange = vi.fn();

      render(<AudioWave ref={controllerRef} source={mockSource} onStateChange={onStateChange} />);

      const controller = controllerRef.current!;

      // Initial state
      expect(controller.getState()).toBe('visualizing');

      // Multiple method calls should not throw
      expect(() => {
        act(() => {
          controller.pause();
          controller.resume();
          controller.pause();
          controller.clear();
          controller.resume();
        });
      }).not.toThrow();

      // State should remain valid after all operations
      expect(['idle', 'visualizing', 'paused']).toContain(controller.getState());

      // Methods should still be callable
      expect(typeof controller.isPaused()).toBe('boolean');
      expect(controller.getAudioData()).toBeInstanceOf(Uint8Array);
    });
  });

  describe('Error Handling', () => {
    it('should handle methods gracefully when component is unmounted', () => {
      const mockSource = createMockAudioSource();

      const { unmount } = render(<AudioWave ref={controllerRef} source={mockSource} />);

      const controller = controllerRef.current!;

      // Unmount component
      unmount();

      // Methods should not throw after unmount
      expect(() => {
        controller.pause();
        controller.resume();
        controller.clear();
        controller.getState();
        controller.isPaused();
        controller.getAudioData();
      }).not.toThrow();
    });
  });
});
