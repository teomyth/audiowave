/**
 * WebAudioSource - Web Audio API implementation
 *
 * Unified Web Audio source that handles MediaStream, HTMLMediaElement, and AudioNode inputs.
 * Implements the standard AudioSource interface for consistent behavior.
 * Built-in Web Audio API support with automatic audio processing.
 */

import { AudioWaveError, AudioWaveErrorType } from '../types';
import type { AudioSourceConfig, ExtendedAudioSource } from '../types/AudioSource';
import { AudioSourceState } from '../types/AudioSource';

export interface WebAudioSourceOptions extends AudioSourceConfig {
  /** Smoothing time constant for the analyser (0-1, default: 0.8) */
  smoothingTimeConstant?: number;
}

/**
 * WebAudioSource - Unified Web Audio API implementation
 *
 * Supports multiple input types:
 * - MediaStream (from getUserMedia, getDisplayMedia)
 * - HTMLMediaElement (audio/video elements)
 * - AudioNode (existing Web Audio nodes)
 */
export class WebAudioSource implements ExtendedAudioSource {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: AudioNode | null = null;
  private audioData: Uint8Array | null = null;
  private state: AudioSourceState = AudioSourceState.INACTIVE;
  private options: Required<WebAudioSourceOptions>;

  // Input-specific properties
  private mediaStream: MediaStream | null = null;
  private inputAudioNode: AudioNode | null = null;

  constructor(options: WebAudioSourceOptions = {}) {
    this.options = {
      fftSize: 2048,
      smoothingTimeConstant: 0.0, // No smoothing for real-time waveform visualization
      ...options,
    } as Required<WebAudioSourceOptions>;
  }

  /**
   * Initialize from MediaStream (getUserMedia, getDisplayMedia)
   */
  async initializeFromMediaStream(stream: MediaStream): Promise<void> {
    if (this.state !== AudioSourceState.INACTIVE) {
      throw new AudioWaveError(
        AudioWaveErrorType.INVALID_STATE,
        'WebAudioSource is already initialized'
      );
    }

    this.state = AudioSourceState.CONNECTING;
    this.mediaStream = stream;

    try {
      await this.setupWebAudio();
      this.sourceNode = this.audioContext!.createMediaStreamSource(stream);
      this.connectNodes();
      this.state = AudioSourceState.ACTIVE;
    } catch (error) {
      this.cleanup();
      this.state = AudioSourceState.ERROR;
      throw new AudioWaveError(
        AudioWaveErrorType.AUDIO_CONTEXT_ERROR,
        'Failed to initialize from MediaStream',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Initialize from HTMLMediaElement (audio/video elements)
   */
  async initializeFromMediaElement(element: HTMLMediaElement): Promise<void> {
    if (this.state !== AudioSourceState.INACTIVE) {
      throw new AudioWaveError(
        AudioWaveErrorType.INVALID_STATE,
        'WebAudioSource is already initialized'
      );
    }

    this.state = AudioSourceState.CONNECTING;

    try {
      await this.setupWebAudio();
      this.sourceNode = this.audioContext!.createMediaElementSource(element);

      // Connect to destination so audio still plays through speakers
      this.sourceNode.connect(this.audioContext!.destination);

      this.connectNodes();

      // MediaElement is always active once connected - state control is at application layer
      this.state = AudioSourceState.ACTIVE;
    } catch (error) {
      this.cleanup();
      this.state = AudioSourceState.ERROR;
      throw new AudioWaveError(
        AudioWaveErrorType.AUDIO_CONTEXT_ERROR,
        'Failed to initialize from HTMLMediaElement',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Initialize from existing AudioNode
   */
  async initializeFromAudioNode(node: AudioNode): Promise<void> {
    if (this.state !== AudioSourceState.INACTIVE) {
      throw new AudioWaveError(
        AudioWaveErrorType.INVALID_STATE,
        'WebAudioSource is already initialized'
      );
    }

    this.state = AudioSourceState.CONNECTING;
    this.inputAudioNode = node;

    try {
      // Use the same audio context as the input node
      this.audioContext = node.context as AudioContext;

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.setupAnalyser();
      this.sourceNode = node;
      this.connectNodes();
      this.state = AudioSourceState.ACTIVE;
    } catch (error) {
      this.cleanup();
      this.state = AudioSourceState.ERROR;
      throw new AudioWaveError(
        AudioWaveErrorType.AUDIO_CONTEXT_ERROR,
        'Failed to initialize from AudioNode',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Get current audio data for visualization (Standard AudioSource interface)
   */
  getAudioData(): Uint8Array | null {
    if (this.state !== AudioSourceState.ACTIVE || !this.analyserNode || !this.audioData) {
      return null;
    }

    // Use time domain data for true waveform visualization
    // Time domain data shows the actual audio waveform (oscilloscope-like)
    // Values are centered around 128, with amplitude variations above/below
    this.analyserNode.getByteTimeDomainData(this.audioData);

    // Always return a copy to ensure data safety
    return new Uint8Array(this.audioData);
  }

  /**
   * Get time domain data specifically (for debugging/comparison)
   */
  getTimeDomainData(): Uint8Array | null {
    if (this.state !== AudioSourceState.ACTIVE || !this.analyserNode || !this.audioData) {
      return null;
    }

    const timeDomainData = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(timeDomainData);
    return timeDomainData;
  }

  /**
   * Get frequency domain data specifically (for debugging/comparison)
   */
  getFrequencyData(): Uint8Array | null {
    if (this.state !== AudioSourceState.ACTIVE || !this.analyserNode || !this.audioData) {
      return null;
    }

    const frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(frequencyData);
    return frequencyData;
  }

  /**
   * Check if the source is currently active (Standard AudioSource interface)
   */
  isActive(): boolean {
    return this.state === AudioSourceState.ACTIVE;
  }

  /**
   * Get current state of the audio source (Extended interface)
   */
  getState(): AudioSourceState {
    return this.state;
  }

  /**
   * Get configuration used by this audio source (Extended interface)
   */
  getConfig(): AudioSourceConfig {
    return {
      fftSize: this.options.fftSize,
    };
  }

  /**
   * Destroy the source and clean up all resources (Extended interface)
   */
  destroy(): void {
    this.cleanup();
    this.state = AudioSourceState.INACTIVE;
  }

  /**
   * Set up Web Audio API context and analyser
   */
  private async setupWebAudio(): Promise<void> {
    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.setupAnalyser();
  }

  /**
   * Set up analyser node
   */
  private setupAnalyser(): void {
    if (!this.audioContext) return;

    // Create analyser node
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.options.fftSize;
    this.analyserNode.smoothingTimeConstant = this.options.smoothingTimeConstant;

    // Initialize audio data array for time domain data
    // Time domain data requires fftSize length, not frequencyBinCount (fftSize/2)
    // Explicitly create with ArrayBuffer to ensure type compatibility
    this.audioData = new Uint8Array(new ArrayBuffer(this.analyserNode.fftSize));
  }

  /**
   * Connect source node to analyser
   */
  private connectNodes(): void {
    if (this.sourceNode && this.analyserNode) {
      this.sourceNode.connect(this.analyserNode);
    }
  }

  /**
   * Clean up all resources
   */
  private cleanup(): void {
    // Stop MediaStream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Disconnect Web Audio nodes
    if (this.sourceNode && this.sourceNode !== this.inputAudioNode) {
      this.sourceNode.disconnect();
    }
    this.sourceNode = null;

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    // Close audio context (only if we created it)
    if (this.audioContext && !this.inputAudioNode && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(console.warn);
    }
    this.audioContext = null;

    // Clear references
    this.inputAudioNode = null;
    this.audioData = null;
  }
}
