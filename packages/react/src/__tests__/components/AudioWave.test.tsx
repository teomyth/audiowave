/**
 * AudioWave Component Tests
 *
 * Basic tests for the AudioWave component props and rendering.
 * These tests focus on component mounting, prop handling, and basic functionality.
 */

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioWave } from '../../components/AudioWave';
import type { AudioSource } from '../../types';

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

describe('AudioWave Component - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<AudioWave />);
      }).not.toThrow();
    });

    it('should render with numeric dimensions', () => {
      expect(() => {
        render(<AudioWave width={500} height={150} />);
      }).not.toThrow();
    });

    it('should render with percentage width', () => {
      expect(() => {
        render(<AudioWave width="80%" height={100} />);
      }).not.toThrow();
    });

    it('should render with pixel string width', () => {
      expect(() => {
        render(<AudioWave width="600px" height={180} />);
      }).not.toThrow();
    });
  });

  describe('Props Handling', () => {
    it('should handle color props without errors', () => {
      expect(() => {
        render(<AudioWave backgroundColor="#ff0000" showPlaceholderBackground={true} />);
      }).not.toThrow();
    });

    it('should handle source prop', () => {
      const mockSource = createMockAudioSource();
      expect(() => {
        render(<AudioWave source={mockSource} backgroundColor="#ff0000" />);
      }).not.toThrow();
    });

    it('should handle border props without errors', () => {
      expect(() => {
        render(
          <AudioWave
            showBorder={true}
            borderColor="#333333"
            borderWidth={2}
            borderRadius={8}
            showPlaceholderBackground={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Animation and Styling Props', () => {
    it('should accept animation props without errors', () => {
      const mockSource = createMockAudioSource();

      expect(() => {
        render(
          <AudioWave source={mockSource} speed={5} animateCurrentPick={false} fullscreen={true} />
        );
      }).not.toThrow();
    });

    it('should accept bar styling props without errors', () => {
      const mockSource = createMockAudioSource();

      expect(() => {
        render(
          <AudioWave
            source={mockSource}
            barColor="#00ff00"
            secondaryBarColor="#666666"
            barWidth={3}
            gap={2}
            rounded={4}
          />
        );
      }).not.toThrow();
    });

    it('should handle isPaused prop', () => {
      const mockSource = createMockAudioSource();

      expect(() => {
        render(<AudioWave source={mockSource} isPaused={true} />);
      }).not.toThrow();
    });
  });

  describe('Placeholder and CSS Props', () => {
    it('should handle placeholder props without errors', () => {
      expect(() => {
        render(<AudioWave />);
      }).not.toThrow();
    });

    it('should handle custom placeholder', () => {
      const customPlaceholder = <div data-testid="custom-placeholder">Custom Placeholder</div>;
      expect(() => {
        render(<AudioWave placeholder={customPlaceholder} />);
      }).not.toThrow();
    });

    it('should handle CSS class props', () => {
      const mockSource = createMockAudioSource();
      expect(() => {
        render(
          <AudioWave
            className="custom-container"
            canvasClassName="custom-canvas"
            source={mockSource}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Callback Props', () => {
    it('should handle callback props without errors', () => {
      const onStateChange = vi.fn();
      const onRenderStart = vi.fn();
      const onError = vi.fn();
      const mockSource = createMockAudioSource();

      expect(() => {
        render(
          <AudioWave
            source={mockSource}
            onStateChange={onStateChange}
            onRenderStart={onRenderStart}
            onError={onError}
          />
        );
      }).not.toThrow();
    });

    it('should call callbacks when appropriate', () => {
      const onStateChange = vi.fn();
      const onRenderStart = vi.fn();
      const mockSource = createMockAudioSource();

      render(
        <AudioWave
          source={mockSource}
          onStateChange={onStateChange}
          onRenderStart={onRenderStart}
        />
      );

      // Should call callbacks
      expect(onStateChange).toHaveBeenCalled();
      expect(onRenderStart).toHaveBeenCalled();
    });
  });

  describe('Source Props', () => {
    it('should handle no source gracefully', () => {
      expect(() => {
        render(<AudioWave />);
      }).not.toThrow();
    });

    it('should handle valid AudioSource', () => {
      const mockSource = createMockAudioSource();

      expect(() => {
        render(<AudioWave source={mockSource} />);
      }).not.toThrow();

      expect(mockSource.isActive).toHaveBeenCalled();
    });

    it('should handle inactive AudioSource', () => {
      const mockSource = createMockAudioSource(false); // inactive

      expect(() => {
        render(<AudioWave source={mockSource} />);
      }).not.toThrow();
    });
  });
});
