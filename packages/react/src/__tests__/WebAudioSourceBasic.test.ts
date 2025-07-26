/**
 * WebAudioSource Basic Tests
 *
 * Testing our actual WebAudioSource class - only basic functionality that works
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebAudioSource } from '../sources/WebAudioSource';
import { AudioSourceState } from '../types/AudioSource';

// Mock Web Audio API
const mockAnalyserNode = {
  fftSize: 2048,
  frequencyBinCount: 1024,
  smoothingTimeConstant: 0.8,
  getByteFrequencyData: vi.fn(),
  getByteTimeDomainData: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockAudioContext = {
  createAnalyser: vi.fn(() => mockAnalyserNode),
  createMediaStreamSource: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() })),
  createMediaElementSource: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() })),
  close: vi.fn(),
  state: 'running',
  resume: vi.fn(),
};

// Mock global AudioContext
global.AudioContext = vi.fn(() => mockAudioContext) as any;

describe('WebAudioSource - Basic Tests', () => {
  let webAudioSource: WebAudioSource;

  beforeEach(() => {
    vi.clearAllMocks();
    webAudioSource = new WebAudioSource();
  });

  it('should initialize with inactive state', () => {
    expect(webAudioSource.getState()).toBe(AudioSourceState.INACTIVE);
    expect(webAudioSource.isActive()).toBe(false);
  });

  it('should provide getAudioData method', () => {
    expect(typeof webAudioSource.getAudioData).toBe('function');
  });

  it('should return null audio data when inactive', () => {
    const audioData = webAudioSource.getAudioData();

    expect(audioData).toBeNull();
  });

  it('should provide state management methods', () => {
    expect(typeof webAudioSource.getState).toBe('function');
    expect(typeof webAudioSource.isActive).toBe('function');
    expect(typeof webAudioSource.destroy).toBe('function');
  });

  it('should handle destroy method without throwing', () => {
    expect(() => {
      webAudioSource.destroy();
    }).not.toThrow();
  });

  it('should provide configuration options', () => {
    const customSource = new WebAudioSource({
      fftSize: 1024,
      smoothingTimeConstant: 0.5,
    });

    expect(customSource).toBeInstanceOf(WebAudioSource);
    expect(customSource.getState()).toBe(AudioSourceState.INACTIVE);
  });

  it('should provide getConfig method', () => {
    const config = webAudioSource.getConfig();

    expect(config).toBeDefined();
    expect(typeof config.fftSize).toBe('number');
  });

  it('should provide frequency and time domain data methods', () => {
    expect(typeof webAudioSource.getFrequencyData).toBe('function');
    expect(typeof webAudioSource.getTimeDomainData).toBe('function');

    // Should return null when inactive
    expect(webAudioSource.getFrequencyData()).toBeNull();
    expect(webAudioSource.getTimeDomainData()).toBeNull();
  });
});
