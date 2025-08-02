import { describe, expect, it } from 'vitest';
import { AUDIO_CONSTANTS } from '../constants';
import { validateAudioConfig } from '../processor';
import type { AudioConfig } from '../types';

describe('validateAudioConfig', () => {
  describe('valid configurations', () => {
    it('should validate minimal valid config', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });

    it('should validate complete valid config', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        skipInitialFrames: 2,
        inputBitsPerSample: 16,
        inputChannels: 2,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });

    it('should validate config with minimum buffer size', () => {
      const config: AudioConfig = {
        bufferSize: AUDIO_CONSTANTS.MIN_BUFFER_SIZE,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });

    it('should validate config with maximum buffer size', () => {
      const config: AudioConfig = {
        bufferSize: AUDIO_CONSTANTS.MAX_BUFFER_SIZE,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });

    it('should validate config with zero skip frames', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        skipInitialFrames: 0,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });

    it('should validate config with maximum skip frames', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        skipInitialFrames: AUDIO_CONSTANTS.MAX_SKIP_FRAMES,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });
  });

  describe('invalid configurations', () => {
    it('should reject null config', () => {
      expect(validateAudioConfig(null as any)).toBe(false);
    });

    it('should reject undefined config', () => {
      expect(validateAudioConfig(undefined as any)).toBe(false);
    });

    it('should reject non-object config', () => {
      expect(validateAudioConfig('invalid' as any)).toBe(false);
      expect(validateAudioConfig(123 as any)).toBe(false);
      expect(validateAudioConfig(true as any)).toBe(false);
    });

    it('should reject config without bufferSize', () => {
      const config = {} as AudioConfig;
      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject config with invalid bufferSize type', () => {
      const config = {
        bufferSize: 'invalid',
      } as any;

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject config with bufferSize below minimum', () => {
      const config: AudioConfig = {
        bufferSize: AUDIO_CONSTANTS.MIN_BUFFER_SIZE - 1,
      };

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject config with bufferSize above maximum', () => {
      const config: AudioConfig = {
        bufferSize: AUDIO_CONSTANTS.MAX_BUFFER_SIZE + 1,
      };

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject config with negative bufferSize', () => {
      const config: AudioConfig = {
        bufferSize: -1,
      };

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject config with zero bufferSize', () => {
      const config: AudioConfig = {
        bufferSize: 0,
      };

      expect(validateAudioConfig(config)).toBe(false);
    });
  });

  describe('skipInitialFrames validation', () => {
    it('should reject invalid skipInitialFrames type', () => {
      const config = {
        bufferSize: 1024,
        skipInitialFrames: 'invalid',
      } as any;

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject negative skipInitialFrames', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        skipInitialFrames: -1,
      };

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should reject skipInitialFrames above maximum', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        skipInitialFrames: AUDIO_CONSTANTS.MAX_SKIP_FRAMES + 1,
      };

      expect(validateAudioConfig(config)).toBe(false);
    });

    it('should allow undefined skipInitialFrames', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        skipInitialFrames: undefined,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });
  });

  describe('optional fields validation', () => {
    it('should allow valid inputBitsPerSample values', () => {
      const validBits = [8, 16, 32];

      validBits.forEach((bits) => {
        const config: AudioConfig = {
          bufferSize: 1024,
          inputBitsPerSample: bits,
        };
        expect(validateAudioConfig(config)).toBe(true);
      });
    });

    it('should allow valid inputChannels values', () => {
      const validChannels = [1, 2, 4, 6, 8];

      validChannels.forEach((channels) => {
        const config: AudioConfig = {
          bufferSize: 1024,
          inputChannels: channels,
        };
        expect(validateAudioConfig(config)).toBe(true);
      });
    });

    it('should allow undefined optional fields', () => {
      const config: AudioConfig = {
        bufferSize: 1024,
        inputBitsPerSample: undefined,
        inputChannels: undefined,
      };

      expect(validateAudioConfig(config)).toBe(true);
    });
  });
});
