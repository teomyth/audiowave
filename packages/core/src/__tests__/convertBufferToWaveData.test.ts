import { describe, expect, it } from 'vitest';
import { convertBufferToWaveData } from '../processor';

describe('convertBufferToWaveData', () => {
  describe('32-bit mono audio', () => {
    it('should convert 32-bit mono audio correctly', () => {
      const buffer = Buffer.alloc(12);
      buffer.writeInt32LE(1073741823, 0); // 50% positive amplitude
      buffer.writeInt32LE(-1073741824, 4); // 50% negative amplitude
      buffer.writeInt32LE(0, 8); // silence

      const result = convertBufferToWaveData(buffer, 32, 1, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(191, 5); // 50% positive -> ~191
      expect(result[1]).toBeCloseTo(64, 5); // 50% negative -> ~64
      expect(result[2]).toBe(128); // silence -> 128
    });

    it('should handle maximum amplitude correctly', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeInt32LE(2147483647, 0); // max positive
      buffer.writeInt32LE(-2147483648, 4); // max negative

      const result = convertBufferToWaveData(buffer, 32, 1, 2);

      expect(result[0]).toBe(255); // max positive -> 255
      expect(result[1]).toBe(0); // max negative -> 0 (due to precision)
    });
  });

  describe('16-bit stereo audio', () => {
    it('should mix stereo channels correctly', () => {
      const buffer = Buffer.alloc(8);
      buffer.writeInt16LE(16383, 0); // left: 50% amplitude
      buffer.writeInt16LE(-16384, 2); // right: -50% amplitude
      buffer.writeInt16LE(32767, 4); // left: 100% amplitude
      buffer.writeInt16LE(-32768, 6); // right: -100% amplitude

      const result = convertBufferToWaveData(buffer, 16, 2, 2);

      expect(result).toHaveLength(2);
      // First sample: (16383 + (-16384)) / 2 = -0.5 -> 127
      expect(result[0]).toBe(127);
      // Second sample: (32767 + (-32768)) / 2 = -0.5 -> 127
      expect(result[1]).toBe(127);
    });

    it('should handle 16-bit maximum values', () => {
      const buffer = Buffer.alloc(4);
      buffer.writeInt16LE(32767, 0); // left: max positive
      buffer.writeInt16LE(32767, 2); // right: max positive

      const result = convertBufferToWaveData(buffer, 16, 2, 1);

      expect(result[0]).toBe(255); // max positive -> 255
    });
  });

  describe('8-bit audio', () => {
    it('should convert 8-bit audio correctly', () => {
      const buffer = Buffer.alloc(3);
      buffer.writeInt8(63, 0); // 50% positive
      buffer.writeInt8(-64, 1); // 50% negative
      buffer.writeInt8(0, 2); // silence

      const result = convertBufferToWaveData(buffer, 8, 1, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(191, 5); // 50% positive
      expect(result[1]).toBeCloseTo(64, 5); // 50% negative
      expect(result[2]).toBe(128); // silence
    });
  });

  describe('resampling', () => {
    it('should downsample correctly', () => {
      const buffer = Buffer.alloc(16); // 4 samples
      buffer.writeInt32LE(1073741823, 0); // 50% positive
      buffer.writeInt32LE(-1073741824, 4); // 50% negative
      buffer.writeInt32LE(2147483647, 8); // max positive
      buffer.writeInt32LE(0, 12); // silence

      const result = convertBufferToWaveData(buffer, 32, 1, 2);

      expect(result).toHaveLength(2);
      // Should use maximum amplitude algorithm
      expect(result[0]).toBeCloseTo(64, 5); // max amplitude from first 2 samples (negative has higher amplitude)
      expect(result[1]).toBe(255); // max of last 2 samples
    });

    it('should upsample correctly', () => {
      const buffer = Buffer.alloc(4);
      buffer.writeInt32LE(1073741823, 0); // 50% positive

      const result = convertBufferToWaveData(buffer, 32, 1, 4);

      expect(result).toHaveLength(4);
      // With max amplitude algorithm, only the last bin should have the value
      expect(result[3]).toBeCloseTo(191, 1); // Last bin contains the sample
      expect(result.slice(0, 3).every((val) => val === 128)).toBe(true); // Other bins are silence
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported bit depth', () => {
      const buffer = Buffer.alloc(4);

      expect(() => {
        convertBufferToWaveData(buffer, 24, 1, 1);
      }).toThrow('Unsupported bits per sample: 24');
    });

    it('should handle empty buffer', () => {
      const buffer = Buffer.alloc(0);

      const result = convertBufferToWaveData(buffer, 32, 1, 2);

      expect(result).toHaveLength(2);
      // Empty buffer should result in silence values
      expect(result.every((val) => val === 128)).toBe(true);
    });
  });
});
