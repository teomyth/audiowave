import { describe, expect, it } from 'vitest';
import { process } from '../processor';
import type { AudioConfig } from '../types';

describe('process function', () => {
  const defaultConfig: AudioConfig = {
    bufferSize: 4,
    inputBitsPerSample: 32,
    inputChannels: 1,
  };

  describe('Buffer processing', () => {
    it('should process Buffer data correctly', () => {
      const buffer = Buffer.alloc(16);
      buffer.writeInt32LE(1073741823, 0); // 50% positive
      buffer.writeInt32LE(-1073741824, 4); // 50% negative
      buffer.writeInt32LE(0, 8); // silence
      buffer.writeInt32LE(2147483647, 12); // max positive

      const result = process(buffer, defaultConfig);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);
      expect(result?.timestamp).toBeTypeOf('number');
      expect(result?.bufferSize).toBe(4);

      const data = result!.timeDomainData;
      expect(data[0]).toBeCloseTo(191, 5); // 50% positive
      expect(data[1]).toBeCloseTo(64, 5); // 50% negative
      expect(data[2]).toBe(128); // silence
      expect(data[3]).toBe(255); // max positive
    });

    it('should handle different bit depths', () => {
      const buffer16 = Buffer.alloc(8);
      buffer16.writeInt16LE(16383, 0); // 50% positive
      buffer16.writeInt16LE(-16384, 2); // 50% negative
      buffer16.writeInt16LE(0, 4); // silence
      buffer16.writeInt16LE(32767, 6); // max positive

      const config16: AudioConfig = {
        ...defaultConfig,
        inputBitsPerSample: 16,
      };

      const result = process(buffer16, config16);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);

      const data = result!.timeDomainData;
      expect(data[0]).toBeCloseTo(191, 5); // 50% positive
      expect(data[1]).toBeCloseTo(64, 5); // 50% negative
      expect(data[2]).toBe(128); // silence
      expect(data[3]).toBe(255); // max positive
    });

    it('should handle stereo input', () => {
      const buffer = Buffer.alloc(16);
      buffer.writeInt32LE(1073741823, 0); // left: 50% positive
      buffer.writeInt32LE(-1073741824, 4); // right: 50% negative
      buffer.writeInt32LE(2147483647, 8); // left: max positive
      buffer.writeInt32LE(-2147483648, 12); // right: max negative

      const stereoConfig: AudioConfig = {
        bufferSize: 2,
        inputBitsPerSample: 32,
        inputChannels: 2,
      };

      const result = process(buffer, stereoConfig);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(2);

      const data = result!.timeDomainData;
      // First sample: (50% + (-50%)) / 2 = -0.5 -> 127
      expect(data[0]).toBe(127);
      // Second sample: (100% + (-100%)) / 2 = -0.5 -> 127
      expect(data[1]).toBe(127);
    });
  });

  describe('Float32Array processing', () => {
    it('should process Float32Array data correctly', () => {
      const samples = new Float32Array([0.5, -0.5, 0.0, 1.0]);
      const result = process(samples, defaultConfig);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);

      const data = result!.timeDomainData;
      expect(data[0]).toBeCloseTo(191, 1); // 0.5 -> ~191
      expect(data[1]).toBeCloseTo(64, 1); // -0.5 -> ~64
      expect(data[2]).toBe(128); // 0.0 -> 128
      expect(data[3]).toBe(255); // 1.0 -> 255
    });

    it('should clamp Float32Array values to [-1, 1]', () => {
      const samples = new Float32Array([2.0, -2.0, 1.5, -1.5]);
      const result = process(samples, defaultConfig);

      expect(result).not.toBeNull();
      const data = result!.timeDomainData;
      expect(data[0]).toBe(255); // Clamped to 1.0 -> 255
      expect(data[1]).toBe(1); // Clamped to -1.0 -> 1
      expect(data[2]).toBe(255); // Clamped to 1.0 -> 255
      expect(data[3]).toBe(1); // Clamped to -1.0 -> 1
    });

    it('should handle empty Float32Array', () => {
      const samples = new Float32Array([]);
      const result = process(samples, defaultConfig);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(0);
    });
  });

  describe('configuration handling', () => {
    it('should use default values for missing config properties', () => {
      const buffer = Buffer.alloc(16);
      buffer.writeInt32LE(1073741823, 0);

      const minimalConfig: AudioConfig = {
        bufferSize: 4,
      };

      const result = process(buffer, minimalConfig);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);
      expect(result?.bufferSize).toBe(4);
    });

    it('should respect custom buffer size', () => {
      const buffer = Buffer.alloc(32); // 8 samples
      for (let i = 0; i < 8; i++) {
        buffer.writeInt32LE(1073741823, i * 4);
      }

      const customConfig: AudioConfig = {
        bufferSize: 8,
        inputBitsPerSample: 32,
        inputChannels: 1,
      };

      const result = process(buffer, customConfig);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(8);
      expect(result?.bufferSize).toBe(8);
    });
  });

  describe('error handling', () => {
    it('should handle small buffers gracefully', () => {
      // Small buffer should not cause errors, just return default values
      const smallBuffer = Buffer.alloc(1);

      const result = process(smallBuffer, defaultConfig);
      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);
      // Should contain silence values for missing data
      expect(result?.timeDomainData.every((val) => val === 128)).toBe(true);
    });

    it('should handle null/undefined input gracefully', () => {
      const result1 = process(null as any, defaultConfig);
      expect(result1).toBeNull();

      const result2 = process(undefined as any, defaultConfig);
      expect(result2).toBeNull();
    });
  });

  describe('timestamp and metadata', () => {
    it('should include timestamp in result', () => {
      const buffer = Buffer.alloc(16);
      const before = Date.now();

      const result = process(buffer, defaultConfig);

      const after = Date.now();

      expect(result).not.toBeNull();
      expect(result?.timestamp).toBeGreaterThanOrEqual(before);
      expect(result?.timestamp).toBeLessThanOrEqual(after);
    });

    it('should include buffer size in result', () => {
      const buffer = Buffer.alloc(16);
      const result = process(buffer, defaultConfig);

      expect(result).not.toBeNull();
      expect(result?.bufferSize).toBe(defaultConfig.bufferSize);
    });
  });
});
