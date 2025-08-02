import { describe, expect, it } from 'vitest';
import {
  createAudioConfig,
  getNearestPowerOfTwo,
  isPowerOfTwo,
  isValidAudioBuffer,
} from '../utils';

describe('utils', () => {
  describe('isPowerOfTwo', () => {
    it('should return true for powers of 2', () => {
      expect(isPowerOfTwo(1)).toBe(true);
      expect(isPowerOfTwo(2)).toBe(true);
      expect(isPowerOfTwo(4)).toBe(true);
      expect(isPowerOfTwo(8)).toBe(true);
      expect(isPowerOfTwo(16)).toBe(true);
      expect(isPowerOfTwo(32)).toBe(true);
      expect(isPowerOfTwo(64)).toBe(true);
      expect(isPowerOfTwo(128)).toBe(true);
      expect(isPowerOfTwo(256)).toBe(true);
      expect(isPowerOfTwo(512)).toBe(true);
      expect(isPowerOfTwo(1024)).toBe(true);
      expect(isPowerOfTwo(2048)).toBe(true);
      expect(isPowerOfTwo(4096)).toBe(true);
    });

    it('should return false for non-powers of 2', () => {
      expect(isPowerOfTwo(0)).toBe(false);
      expect(isPowerOfTwo(3)).toBe(false);
      expect(isPowerOfTwo(5)).toBe(false);
      expect(isPowerOfTwo(6)).toBe(false);
      expect(isPowerOfTwo(7)).toBe(false);
      expect(isPowerOfTwo(9)).toBe(false);
      expect(isPowerOfTwo(10)).toBe(false);
      expect(isPowerOfTwo(100)).toBe(false);
      expect(isPowerOfTwo(1000)).toBe(false);
      expect(isPowerOfTwo(1023)).toBe(false);
      expect(isPowerOfTwo(1025)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isPowerOfTwo(-1)).toBe(false);
      expect(isPowerOfTwo(-2)).toBe(false);
      expect(isPowerOfTwo(-4)).toBe(false);
    });
  });

  describe('getNearestPowerOfTwo', () => {
    it('should return the nearest power of 2', () => {
      expect(getNearestPowerOfTwo(1)).toBe(1);
      expect(getNearestPowerOfTwo(2)).toBe(2);
      expect(getNearestPowerOfTwo(3)).toBe(4);
      expect(getNearestPowerOfTwo(5)).toBe(4);
      expect(getNearestPowerOfTwo(6)).toBe(8);
      expect(getNearestPowerOfTwo(7)).toBe(8);
      expect(getNearestPowerOfTwo(9)).toBe(8);
      expect(getNearestPowerOfTwo(10)).toBe(8);
      expect(getNearestPowerOfTwo(12)).toBe(16);
      expect(getNearestPowerOfTwo(15)).toBe(16);
      expect(getNearestPowerOfTwo(17)).toBe(16);
      expect(getNearestPowerOfTwo(24)).toBe(32);
    });

    it('should handle common buffer sizes', () => {
      expect(getNearestPowerOfTwo(1000)).toBe(1024);
      expect(getNearestPowerOfTwo(1500)).toBe(2048);
      expect(getNearestPowerOfTwo(3000)).toBe(4096);
    });

    it('should return exact powers of 2 unchanged', () => {
      expect(getNearestPowerOfTwo(512)).toBe(512);
      expect(getNearestPowerOfTwo(1024)).toBe(1024);
      expect(getNearestPowerOfTwo(2048)).toBe(2048);
    });
  });

  describe('isValidAudioBuffer', () => {
    it('should return true for valid 32-bit buffers', () => {
      const validBuffer = Buffer.alloc(4); // 1 sample * 4 bytes
      expect(isValidAudioBuffer(validBuffer)).toBe(true);

      const validBuffer2 = Buffer.alloc(8); // 2 samples * 4 bytes
      expect(isValidAudioBuffer(validBuffer2)).toBe(true);

      const validBuffer3 = Buffer.alloc(1024); // 256 samples * 4 bytes
      expect(isValidAudioBuffer(validBuffer3)).toBe(true);
    });

    it('should return false for invalid buffer sizes', () => {
      const invalidBuffer1 = Buffer.alloc(1); // Not divisible by 4
      expect(isValidAudioBuffer(invalidBuffer1)).toBe(false);

      const invalidBuffer2 = Buffer.alloc(3); // Not divisible by 4
      expect(isValidAudioBuffer(invalidBuffer2)).toBe(false);

      const invalidBuffer3 = Buffer.alloc(5); // Not divisible by 4
      expect(isValidAudioBuffer(invalidBuffer3)).toBe(false);

      const invalidBuffer4 = Buffer.alloc(7); // Not divisible by 4
      expect(isValidAudioBuffer(invalidBuffer4)).toBe(false);
    });

    it('should return true for empty buffer', () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(isValidAudioBuffer(emptyBuffer)).toBe(true);
    });
  });

  describe('createAudioConfig', () => {
    it('should create config with defaults', () => {
      const config = createAudioConfig();

      expect(config).toHaveProperty('bufferSize');
      expect(config).toHaveProperty('skipInitialFrames');
      expect(typeof config.bufferSize).toBe('number');
      expect(typeof config.skipInitialFrames).toBe('number');
    });

    it('should merge provided config with defaults', () => {
      const customConfig = createAudioConfig({
        bufferSize: 2048,
        skipInitialFrames: 5,
      });

      expect(customConfig.bufferSize).toBe(2048);
      expect(customConfig.skipInitialFrames).toBe(5);
    });

    it('should preserve default values for unspecified properties', () => {
      const partialConfig = createAudioConfig({
        bufferSize: 512,
      });

      expect(partialConfig.bufferSize).toBe(512);
      expect(partialConfig).toHaveProperty('skipInitialFrames');
      expect(typeof partialConfig.skipInitialFrames).toBe('number');
    });

    it('should handle empty config object', () => {
      const config = createAudioConfig({});

      expect(config).toHaveProperty('bufferSize');
      expect(config).toHaveProperty('skipInitialFrames');
    });
  });
});
