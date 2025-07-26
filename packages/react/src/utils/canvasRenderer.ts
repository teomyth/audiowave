/**
 * Canvas Renderer Utilities
 *
 * Optimized Canvas 2D rendering functions for audio visualization.
 * Based on the existing helpers but simplified and performance-focused.
 */

import type { RefObject } from 'react';
import type { ScrollingWaveformParams, WaveformDataPoint } from '../types';

/**
 * Audio data normalization constant
 * This value is used to normalize audio amplitude data for visualization.
 *
 * Effects of adjusting this value:
 * - Lower values (e.g., 256): Larger waveforms, may cause visual overflow at maximum amplitude
 * - Higher values (e.g., 258, 300): Smaller waveforms, provides visual buffer and prevents edge artifacts
 *
 * The normalization formula: normalizedHeight = (amplitude / NORMALIZATION_FACTOR) * canvasHeight
 *
 * Recommended range: 256-300
 * - 256: Standard Uint8Array range, 1:1 mapping
 * - 258: Provides ~1.2% visual buffer (255/258 ≈ 0.988)
 * - Higher values: More conservative scaling for busy audio environments
 */
const AUDIO_NORMALIZATION_FACTOR = 256;

export interface CanvasSetupResult {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  halfWidth: number;
  halfHeight: number;
}

export interface RenderBarParams {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rounded: number;
}

export interface RenderWaveformParams {
  canvas: HTMLCanvasElement;
  audioData: Uint8Array;
  backgroundColor: string;
  barColor: string;
  secondaryBarColor: string;
  barWidth: number;
  gap: number;
  rounded: number;
  speed: number;
  animateCurrentPick: boolean;
  fullscreen: boolean;
  isActive: boolean;
}

/**
 * Initialize canvas with proper dimensions and background
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  backgroundColor = 'transparent'
): CanvasSetupResult | null {
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const { width, height } = canvas;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Clear canvas
  context.clearRect(0, 0, width, height);

  // Set background
  if (backgroundColor !== 'transparent') {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  return {
    context,
    width,
    height,
    halfWidth,
    halfHeight,
  };
}

/**
 * Render a single bar with optional rounded corners
 */
export function renderBar({ context, x, y, width, height, color, rounded }: RenderBarParams): void {
  context.fillStyle = color;

  if (rounded > 0) {
    // Draw rounded rectangle
    context.beginPath();
    context.roundRect(x, y, width, height, rounded);
    context.fill();
  } else {
    // Draw regular rectangle (faster)
    context.fillRect(x, y, width, height);
  }
}

/**
 * Initialize canvas for rendering
 */
const initialCanvasSetup = ({
  canvas,
  backgroundColor,
}: {
  canvas: HTMLCanvasElement;
  backgroundColor: string;
}) => {
  const height = canvas.height;
  const width = canvas.width;
  const halfWidth = Math.round(width / 2);
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.clearRect(0, 0, width, height);

  if (backgroundColor !== 'transparent') {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  return { context, height, width, halfWidth };
};

/**
 * Paint a line on the canvas with optional rounded corners
 */
const paintLine = ({
  context,
  color,
  rounded,
  x,
  y,
  w,
  h,
}: {
  context: CanvasRenderingContext2D;
  color: string;
  rounded: number | number[];
  x: number;
  y: number;
  w: number;
  h: number;
}) => {
  context.fillStyle = color;
  context.beginPath();

  if (context.roundRect) {
    // ensuring roundRect is supported by the browser
    context.roundRect(x, y, w, h, rounded);
    context.fill();
  } else {
    // Fallback for browsers that do not support roundRect
    context.fillRect(x, y, w, h);
  }
};

/**
 * Paint a line from center to right edge of the canvas
 */
const paintLineFromCenterToRight = ({
  context,
  color,
  rounded,
  width,
  height,
  barWidth,
}: {
  context: CanvasRenderingContext2D;
  color: string;
  rounded: number | number[];
  width: number;
  height: number;
  barWidth: number;
}) => {
  paintLine({
    context,
    color,
    rounded,
    x: width / 2 + barWidth / 2,
    y: height / 2 - 1,
    h: 2,
    w: width - (width / 2 + barWidth / 2),
  });
};

/**
 * Draw live streaming waveform visualization
 */
export const drawByLiveStream = ({
  audioData,
  unit,
  index,
  index2,
  canvas,
  isAudioInProgress,
  isPausedAudio,
  picks,
  backgroundColor,
  barWidth,
  mainBarColor,
  secondaryBarColor,
  rounded,
  animateCurrentPick,
  fullscreen,
  gain = 1.0,
}: {
  audioData: Uint8Array;
  unit: number;
  index: RefObject<number>;
  index2: RefObject<number>;
  canvas: HTMLCanvasElement;
  isAudioInProgress: boolean;
  isPausedAudio: boolean;
  picks: Array<WaveformDataPoint | null>;
  backgroundColor: string;
  barWidth: number;
  mainBarColor: string;
  secondaryBarColor: string;
  rounded: number;
  animateCurrentPick: boolean;
  fullscreen: boolean;
  gain?: number;
}) => {
  const canvasData = initialCanvasSetup({ canvas, backgroundColor });
  if (!canvasData) return;

  const { context, height, width, halfWidth } = canvasData;
  if (audioData?.length && isAudioInProgress) {
    // WebAudioSource always returns time domain data (centered at 128)
    // Time domain data shows the actual audio waveform with values around 128
    // We need to calculate amplitude from the center value

    let maxPick = 0;

    // Time domain data processing: calculate amplitude from center (128)
    let maxAmplitude = 0;
    const centerValue = 128;

    for (let i = 0; i < audioData.length; i++) {
      const deviation = Math.abs(audioData[i] - centerValue);
      if (deviation > maxAmplitude) {
        maxAmplitude = deviation;
      }
    }

    // Convert amplitude to 0-255 scale and apply gain
    // Scale the amplitude appropriately for visualization
    const amplitudeScale = maxAmplitude * 2; // Reasonable sensitivity for better visibility

    // Apply gain to amplify the waveform for better visibility
    // Ensure gain is within valid range
    const clampedGain = Math.max(0.1, Math.min(10.0, gain));

    // Apply gain directly to the amplitude
    maxPick = Math.min(255, amplitudeScale * clampedGain);

    // In very quiet environments, maxPick will naturally be very small (close to 0)
    // This will create a small dot in the center, which is the correct behavior

    if (!isPausedAudio) {
      if (index2.current >= barWidth) {
        index2.current = 0;

        // Use the corrected amplitude calculation
        // Normalize using AUDIO_NORMALIZATION_FACTOR
        const normalizedAmplitude = maxPick / AUDIO_NORMALIZATION_FACTOR;
        const barHeight = normalizedAmplitude * 100; // Height proportional to amplitude
        const startY = (100 - barHeight) / 2; // Center the bar vertically

        const newPick: WaveformDataPoint | null =
          index.current === barWidth
            ? {
                startY,
                barHeight,
              }
            : null;

        if (index.current >= unit) {
          index.current = barWidth;
        } else {
          index.current += barWidth;
        }

        // quantity of picks enough for visualisation
        if (picks.length > (fullscreen ? width : halfWidth) / barWidth) {
          picks.pop();
        }
        picks.unshift(newPick);
      }

      index2.current += 1;
    }

    !fullscreen && paintInitialLine();

    // animate current pick - only when not paused
    // When paused, we don't want the current pick indicator to respond to live audio
    if (animateCurrentPick && !isPausedAudio) {
      // Calculate the height of the current pick bar based on amplitude
      const normalizedAmplitude = maxPick / AUDIO_NORMALIZATION_FACTOR;
      const barHeight = normalizedAmplitude * height;

      paintLine({
        context,
        rounded,
        color: mainBarColor,
        x: fullscreen ? width : halfWidth,
        y: (height - barHeight) / 2, // Center the bar vertically
        h: barHeight, // Height should be proportional to amplitude
        w: barWidth,
      });
    }

    // picks visualisation
    let x = (fullscreen ? width : halfWidth) - index2.current;
    for (const pick of picks) {
      if (pick) {
        paintLine({
          context,
          color: mainBarColor,
          rounded,
          x,
          y:
            (pick.startY * height) / 100 > height / 2 - 1
              ? height / 2 - 1
              : (pick.startY * height) / 100,
          h: (pick.barHeight * height) / 100 > 2 ? (pick.barHeight * height) / 100 : 2,
          w: barWidth,
        });
      }
      x -= barWidth;
    }
  } else {
    picks.length = 0;
  }

  function paintInitialLine() {
    paintLineFromCenterToRight({
      context,
      color: secondaryBarColor,
      rounded,
      width,
      height,
      barWidth,
    });
  }
};

// Keep the old function for compatibility but make it use the new one
export function renderScrollingWaveform(params: ScrollingWaveformParams): void {
  drawByLiveStream({
    audioData: params.audioData,
    unit: params.unit,
    index: params.index,
    index2: params.index2,
    canvas: params.canvas,
    isAudioInProgress: params.isAudioInProgress,
    isPausedAudio: params.isPausedAudio,
    picks: params.picks,
    backgroundColor: params.backgroundColor,
    barWidth: params.barWidth,
    mainBarColor: params.barColor,
    secondaryBarColor: params.secondaryBarColor,
    rounded: params.rounded,
    animateCurrentPick: params.animateCurrentPick,
    fullscreen: params.fullscreen,
    gain: params.gain,
  });
}

/**
 * Utility to resize canvas with proper pixel ratio handling and background initialization
 */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor?: string,
  _pixelRatio = 1 // Disable devicePixelRatio for audio visualization
): void {
  // Set display size
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Set actual canvas size (1:1 ratio for audio visualization)
  canvas.width = width;
  canvas.height = height;

  // Initialize background if provided
  if (backgroundColor && backgroundColor !== 'transparent') {
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
    }
  }
}
