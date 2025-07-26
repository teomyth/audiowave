/**
 * AudioWave - Core React Component
 *
 * Pure visualization component that renders real-time audio waveforms.
 * Follows single responsibility principle - only handles rendering.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { DEFAULT_VISUALIZER_PROPS } from '../index';
import {
  type AudioSource,
  type AudioWaveController,
  AudioWaveError,
  AudioWaveErrorType,
  type AudioWaveProps,
  type AudioWaveState,
  type RenderContext,
  type WaveformDataPoint,
} from '../types';
import { drawByLiveStream, resizeCanvas } from '../utils/canvasRenderer';

export const AudioWave = forwardRef<AudioWaveController, AudioWaveProps>(
  (
    {
      source,
      width = DEFAULT_VISUALIZER_PROPS.width,
      height = DEFAULT_VISUALIZER_PROPS.height,
      backgroundColor = DEFAULT_VISUALIZER_PROPS.backgroundColor,
      barColor = DEFAULT_VISUALIZER_PROPS.barColor,
      secondaryBarColor = DEFAULT_VISUALIZER_PROPS.secondaryBarColor,
      barWidth = DEFAULT_VISUALIZER_PROPS.barWidth,
      gap = DEFAULT_VISUALIZER_PROPS.gap,
      rounded = DEFAULT_VISUALIZER_PROPS.rounded,
      showBorder = false,
      borderColor = '#333333',
      borderWidth = 1,
      borderRadius = 0,
      speed = DEFAULT_VISUALIZER_PROPS.speed,
      animateCurrentPick = DEFAULT_VISUALIZER_PROPS.animateCurrentPick,
      fullscreen = DEFAULT_VISUALIZER_PROPS.fullscreen,
      gain = 1.0,
      isPaused = false,
      placeholder,
      showPlaceholderBackground = true,
      customRenderer,
      className,
      canvasClassName,
      onStateChange,
      onRenderStart,
      onRenderStop,
      onError,
    },
    ref
  ) => {
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Audio processing refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceNodeRef = useRef<AudioNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const rafAudioRef = useRef<number | null>(null);

    // Screen width and mobile detection
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const isMobile = screenWidth < 768;
    const formattedSpeed = Math.trunc(speed);
    const formattedGap = Math.trunc(gap);
    const formattedBarWidth = Math.trunc(isMobile && formattedGap > 0 ? barWidth + 1 : barWidth);
    const unit = formattedBarWidth + formattedGap * formattedBarWidth;

    // Waveform state initialization
    const picksRef = useRef<Array<WaveformDataPoint | null>>([]);
    const indexSpeedRef = useRef<number>(formattedSpeed);
    const indexRef = useRef<number>(formattedBarWidth);
    const index2Ref = useRef<number>(formattedBarWidth); // 用于平滑速度控制

    // Component state
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));

    // Remove debug logging for production

    // Internal state management for pause/stop/resume functionality
    const [internalState, setInternalState] = useState<AudioWaveState>('idle');
    const internalStateRef = useRef<AudioWaveState>('idle');

    // Audio source ref - only supports standard AudioSource interface
    const audioSourceRef = useRef<AudioSource | null>(null);

    // State change callback
    const updateState = useCallback(
      (newState: AudioWaveState) => {
        setInternalState(newState);
        internalStateRef.current = newState;
        onStateChange?.(newState);
      },
      [onStateChange]
    );

    // Removed complex adapter logic - now only supports standard AudioSource interface

    // Method to clear waveform data
    const clearWaveformData = useCallback(() => {
      picksRef.current.length = 0;
      indexRef.current = 0;
      index2Ref.current = 0;
      setAudioData(new Uint8Array(0));
    }, []);

    // Screen width monitoring for responsive design
    useEffect(() => {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    /**
     * Visualization frame loop - simplified for standard AudioSource interface
     * Only supports AudioSource with getAudioData() and isActive() methods
     */
    const audioFrame = useCallback(() => {
      if (!dataArrayRef.current || !source) {
        return;
      }

      // Only update audio data if visualizing and not paused
      const shouldUpdateData = internalStateRef.current === 'visualizing' && !isPaused;

      if (shouldUpdateData && typeof source.getAudioData === 'function') {
        // Get data directly from standard AudioSource
        const audioData = source.getAudioData();
        if (audioData && audioData.length > 0) {
          // Always process valid audio data - including silence
          // Silence is a valid audio state that should be visualized as a flat line
          const avgValue = audioData.reduce((a: number, b: number) => a + b, 0) / audioData.length;
          const isReasonableRange = avgValue >= 0 && avgValue <= 255; // Valid byte range

          if (isReasonableRange) {
            // Copy data to our buffer - this includes both active audio and silence
            // The visualization will show active waveforms for audio and flat lines for silence
            const copyLength = Math.min(audioData.length, dataArrayRef.current.length);
            for (let i = 0; i < copyLength; i++) {
              dataArrayRef.current[i] = audioData[i];
            }
            setAudioData(new Uint8Array(dataArrayRef.current));
          }
        }
      }

      rafAudioRef.current = requestAnimationFrame(audioFrame);
    }, [isPaused, source]);

    /**
     * Handle errors with proper error reporting
     */
    const handleError = useCallback(
      (error: Error, context: string) => {
        const audioError = new AudioWaveError(
          AudioWaveErrorType.RENDER_ERROR,
          `${context}: ${error.message}`,
          error
        );

        onError?.(audioError);
        console.error('AudioWave Error:', audioError);
      },
      [onError]
    );

    /**
     * Set up audio source - simplified for standard AudioSource interface
     */
    const setupAudioSource = useCallback(async () => {
      if (!source) {
        return;
      }

      try {
        // Validate that source implements standard AudioSource interface
        if (typeof source.getAudioData !== 'function' || typeof source.isActive !== 'function') {
          throw new Error('Audio source must implement getAudioData() and isActive() methods');
        }

        audioSourceRef.current = source;

        // Initialize audio data array with default size
        // The actual size will be determined by the first data from the source
        dataArrayRef.current = new Uint8Array(1024);
        dataArrayRef.current.fill(128); // Initialize with center line (silence)

        updateState('visualizing'); // Update internal state to visualizing
        onRenderStart?.();

        // Start visualization frame loop
        audioFrame();
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          'Failed to set up audio source'
        );
      }
    }, [source, handleError, onRenderStart, audioFrame, updateState]);

    /**
     * Clean up audio resources
     */
    const cleanupAudioSource = useCallback(
      (preserveDataForPause = false) => {
        // Stop visualization frame loop
        if (rafAudioRef.current) {
          cancelAnimationFrame(rafAudioRef.current);
          rafAudioRef.current = null;
        }

        // No need to stop animation - useLayoutEffect handles this automatically

        // Disconnect source node
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }

        // Clean up analyser
        if (analyserRef.current) {
          analyserRef.current.disconnect();
          analyserRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          try {
            audioContextRef.current.close?.();
          } catch (error) {
            console.warn('Error closing audio context:', error);
          }
          audioContextRef.current = null;
        }

        // Clean up audio source
        if (!preserveDataForPause) {
          audioSourceRef.current = null;
        }

        // Only clear data if not preserving for pause
        if (!preserveDataForPause) {
          dataArrayRef.current = null;
          updateState('idle'); // Reset internal state to idle
          onRenderStop?.();
        }
      },
      [onRenderStop, updateState]
    );

    /**
     * Main rendering effect for waveform visualization
     */
    useLayoutEffect(() => {
      if (!canvasRef.current) return;

      // Rendering frame - debug logs removed for production

      if (indexSpeedRef.current >= formattedSpeed || !audioData.length) {
        indexSpeedRef.current = audioData.length ? 0 : formattedSpeed;

        // Get real audio source active state
        const sourceIsActive = source?.isActive() ?? false;

        // Use custom renderer if provided
        if (customRenderer) {
          const renderContext: RenderContext = {
            canvas: canvasRef.current,
            context: canvasRef.current.getContext('2d')!,
            audioData: audioData,
            isActive: sourceIsActive,
            timestamp: performance.now(),
            dimensions: {
              width: canvasRef.current.width,
              height: canvasRef.current.height,
            },
          };

          customRenderer(renderContext);
        } else {
          // Use drawByLiveStream for waveform rendering
          drawByLiveStream({
            audioData: audioData,
            unit,
            index: indexRef,
            index2: index2Ref,
            canvas: canvasRef.current,
            isAudioInProgress: sourceIsActive || internalState === 'paused' || isPaused, // Keep rendering when paused
            isPausedAudio: internalState === 'paused' || isPaused, // Support both internal state and external prop
            picks: picksRef.current,
            backgroundColor,
            barWidth: formattedBarWidth,
            mainBarColor: barColor,
            secondaryBarColor,
            rounded,
            animateCurrentPick,
            fullscreen,
            gain,
          });
        }

        // Draw border if enabled
        if (showBorder && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;

            if (borderRadius > 0 && ctx.roundRect) {
              // Use rounded rectangle if borderRadius is set and supported
              ctx.beginPath();
              ctx.roundRect(
                borderWidth / 2,
                borderWidth / 2,
                canvasRef.current.width - borderWidth,
                canvasRef.current.height - borderWidth,
                borderRadius
              );
              ctx.stroke();
            } else {
              // Fallback to regular rectangle
              ctx.strokeRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }
      }

      indexSpeedRef.current += 1;
    }, [
      // Effect dependencies
      audioData,
      formattedBarWidth,
      backgroundColor,
      barColor,
      secondaryBarColor,
      rounded,
      fullscreen,
      // Border properties
      showBorder,
      borderColor,
      borderWidth,
      borderRadius,
      // Additional required dependencies
      formattedSpeed,
      unit,
      isPaused,
      source, // Need source to check isActive()
      customRenderer,
      internalState,
      animateCurrentPick,
    ]);

    /**
     * Handle canvas resize
     */
    const handleResize = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (!canvas || !container) {
        return;
      }

      let canvasWidth: number;
      let canvasHeight: number;

      if (typeof width === 'string') {
        if (width.endsWith('%')) {
          // Handle percentage width
          const percentage = Number.parseFloat(width);
          canvasWidth = (container.clientWidth * percentage) / 100;
        } else {
          // Handle pixel width like "500px"
          const parsedWidth = Number.parseInt(width, 10);
          canvasWidth = parsedWidth || 800; // fallback to 800px
        }
      } else {
        canvasWidth = width;
      }

      canvasHeight = height;

      // Only resize if dimensions changed
      if (canvasDimensions.width !== canvasWidth || canvasDimensions.height !== canvasHeight) {
        resizeCanvas(canvas, canvasWidth, canvasHeight, backgroundColor);
        setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
      }
    }, [width, height, canvasDimensions]);

    // Set up audio source when source changes
    useEffect(() => {
      if (source) {
        setupAudioSource();
      } else if (!isPaused) {
        // Only cleanup when source becomes null AND not paused
        // This preserves the waveform when paused
        cleanupAudioSource();
      }

      return () => {
        // Preserve data when paused to keep waveform visible
        const shouldPreserveData = isPaused || internalStateRef.current === 'paused';
        cleanupAudioSource(shouldPreserveData);
      };
    }, [source, setupAudioSource, cleanupAudioSource, isPaused]); // Added isPaused back as it's used in the effect

    // No need for animation control - useLayoutEffect handles rendering automatically

    // Handle resize
    useEffect(() => {
      handleResize();

      // Set up resize observer for responsive behavior
      const resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [handleResize]);

    // Cleanup on unmount - only run once
    useEffect(() => {
      return () => {
        cleanupAudioSource(false); // Force cleanup on unmount
        // Clear waveform data to prevent memory leaks
        picksRef.current.length = 0;
        indexRef.current = 0;
        index2Ref.current = 0;
      };
    }, [cleanupAudioSource]); // Add cleanupAudioSource dependency

    // Imperative API for external control
    useImperativeHandle(
      ref,
      () => ({
        pause: () => {
          const currentState = internalStateRef.current;
          if (currentState === 'visualizing') {
            updateState('paused');
          } else if (currentState === 'idle' && source) {
            // If idle but has source, start in paused state
            updateState('paused');
          }
        },

        resume: () => {
          const currentState = internalStateRef.current;
          if (currentState === 'paused') {
            updateState('visualizing');
          } else if (currentState === 'idle' && source) {
            // If idle but has source, start visualizing
            updateState('visualizing');
          }
        },

        clear: () => {
          clearWaveformData();
          // Keep current state (paused/visualizing) but clear data
        },

        isPaused: () => internalState === 'paused',

        getState: () => internalState,

        getAudioData: () => audioData,
      }),
      [internalState, updateState, clearWaveformData, audioData, source]
    );

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width:
            typeof width === 'string' && width.endsWith('%')
              ? '100%'
              : typeof width === 'string'
                ? width
                : `${width}px`,
          height: `${height}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            !source && !isPaused && internalState !== 'paused' && showPlaceholderBackground
              ? backgroundColor
              : 'transparent',
          border:
            !source &&
            !isPaused &&
            internalState !== 'paused' &&
            showPlaceholderBackground &&
            showBorder
              ? `${borderWidth}px solid ${borderColor}`
              : 'none',
          borderRadius:
            !source &&
            !isPaused &&
            internalState !== 'paused' &&
            showPlaceholderBackground &&
            borderRadius > 0
              ? `${borderRadius}px`
              : '0',
        }}
      >
        <canvas
          ref={canvasRef}
          className={canvasClassName}
          style={{
            width: typeof width === 'string' && width.endsWith('%') ? width : '100%',
            height: '100%',
            display: source || isPaused || internalState === 'paused' ? 'block' : 'none', // Keep canvas visible when paused
            borderRadius: borderRadius > 0 ? `${borderRadius}px` : '0',
          }}
        />

        {/* Placeholder content when no source AND not paused */}
        {!source && !isPaused && internalState !== 'paused' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          >
            {placeholder || (
              // Default placeholder - simple wave icon
              <svg
                width={48}
                height={48}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-label="Audio waveform placeholder"
              >
                <title>Audio waveform placeholder</title>
                <rect x="2" y="8" width="2" height="8" rx="1" />
                <rect x="6" y="4" width="2" height="16" rx="1" />
                <rect x="10" y="6" width="2" height="12" rx="1" />
                <rect x="14" y="2" width="2" height="20" rx="1" />
                <rect x="18" y="7" width="2" height="10" rx="1" />
              </svg>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Add display name for better debugging
AudioWave.displayName = 'AudioWave';
