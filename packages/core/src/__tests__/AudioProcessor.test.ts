import { beforeEach, describe, expect, it } from 'vitest';
import { AudioProcessor } from '../processor';
import type { AudioConfig } from '../types';

describe('AudioProcessor', () => {
  let processor: AudioProcessor;
  let config: AudioConfig;

  beforeEach(() => {
    config = {
      bufferSize: 4,
      skipInitialFrames: 2,
      inputBitsPerSample: 32,
      inputChannels: 1,
    };
    processor = new AudioProcessor(config);
  });

  describe('skip frames functionality', () => {
    it('should skip initial frames as configured', () => {
      const buffer = Buffer.alloc(16);
      buffer.writeInt32LE(1073741823, 0);

      // First frame should be skipped
      const result1 = processor.process(buffer);
      expect(result1).toBeNull();

      // Second frame should be skipped
      const result2 = processor.process(buffer);
      expect(result2).toBeNull();

      // Third frame should be processed
      const result3 = processor.process(buffer);
      expect(result3).not.toBeNull();
      expect(result3?.timeDomainData).toHaveLength(4);
    });

    it('should process all frames when skipInitialFrames is 0', () => {
      const processorNoSkip = new AudioProcessor({
        ...config,
        skipInitialFrames: 0,
      });

      const buffer = Buffer.alloc(16);
      buffer.writeInt32LE(1073741823, 0);

      const result = processorNoSkip.process(buffer);
      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);
    });
  });

  describe('Buffer processing', () => {
    it('should process Buffer data correctly', () => {
      // Skip initial frames first
      processor.process(Buffer.alloc(16));
      processor.process(Buffer.alloc(16));

      const buffer = Buffer.alloc(16);
      buffer.writeInt32LE(1073741823, 0); // 50% positive
      buffer.writeInt32LE(-1073741824, 4); // 50% negative
      buffer.writeInt32LE(0, 8); // silence
      buffer.writeInt32LE(2147483647, 12); // max positive

      const result = processor.process(buffer);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);
      expect(result?.timestamp).toBeTypeOf('number');
      expect(result?.bufferSize).toBe(4);

      // Check audio data values
      const data = result!.timeDomainData;
      expect(data[0]).toBeCloseTo(191, 5); // 50% positive
      expect(data[1]).toBeCloseTo(64, 5); // 50% negative
      expect(data[2]).toBe(128); // silence
      expect(data[3]).toBe(255); // max positive
    });
  });

  describe('Float32Array processing', () => {
    it('should process Float32Array data correctly', () => {
      // Skip initial frames first
      processor.process(Buffer.alloc(16));
      processor.process(Buffer.alloc(16));

      const samples = new Float32Array([0.5, -0.5, 0.0, 1.0]);
      const result = processor.process(samples);

      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);

      const data = result!.timeDomainData;
      expect(data[0]).toBeCloseTo(191, 1); // 0.5 -> ~191
      expect(data[1]).toBeCloseTo(64, 1); // -0.5 -> ~64
      expect(data[2]).toBe(128); // 0.0 -> 128
      expect(data[3]).toBe(255); // 1.0 -> 255
    });

    it('should clamp Float32Array values to [-1, 1]', () => {
      // Skip initial frames first
      processor.process(Buffer.alloc(16));
      processor.process(Buffer.alloc(16));

      const samples = new Float32Array([2.0, -2.0]); // Out of range values
      const result = processor.process(samples);

      expect(result).not.toBeNull();
      const data = result!.timeDomainData;
      expect(data[0]).toBe(255); // Clamped to 1.0 -> 255
      expect(data[1]).toBe(1); // Clamped to -1.0 -> 1
    });
  });

  describe('reset functionality', () => {
    it('should reset frame counter', () => {
      const buffer = Buffer.alloc(16);

      // Process some frames
      processor.process(buffer); // Frame 1 (skipped)
      processor.process(buffer); // Frame 2 (skipped)
      processor.process(buffer); // Frame 3 (processed)

      // Reset and verify skip frames work again
      processor.reset();

      const result1 = processor.process(buffer); // Frame 1 (should be skipped)
      expect(result1).toBeNull();

      const result2 = processor.process(buffer); // Frame 2 (should be skipped)
      expect(result2).toBeNull();

      const result3 = processor.process(buffer); // Frame 3 (should be processed)
      expect(result3).not.toBeNull();
    });
  });

  describe('updateConfig functionality', () => {
    it('should update configuration', () => {
      const newConfig: AudioConfig = {
        bufferSize: 8,
        skipInitialFrames: 1,
        inputBitsPerSample: 16,
        inputChannels: 2,
      };

      processor.updateConfig(newConfig);

      // Skip initial frame (now only 1)
      const buffer = Buffer.alloc(32); // 8 samples * 2 channels * 2 bytes
      const result1 = processor.process(buffer);
      expect(result1).toBeNull();

      // Second frame should be processed
      const result2 = processor.process(buffer);
      expect(result2).not.toBeNull();
      expect(result2?.bufferSize).toBe(8);
    });
  });

  describe('error handling', () => {
    it('should handle small buffers gracefully', () => {
      // Skip initial frames first
      processor.process(Buffer.alloc(16));
      processor.process(Buffer.alloc(16));

      // Small buffer should not cause errors, just return default values
      const smallBuffer = Buffer.alloc(1);

      const result = processor.process(smallBuffer);
      expect(result).not.toBeNull();
      expect(result?.timeDomainData).toHaveLength(4);
      // Should contain silence values for missing data
      expect(result?.timeDomainData.every((val) => val === 128)).toBe(true);
    });
  });
});
