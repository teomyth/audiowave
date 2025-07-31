---
"@audiowave/react": minor
"@audiowave/web-example": patch
"@audiowave/electron-example": patch
---

# Add amplitude calculation modes with enhanced RMS processing and improved UI

## New Features

### Amplitude Calculation Modes

- **Peak Mode**: Traditional peak amplitude calculation (default, maintains backward compatibility)
- **RMS Mode**: Root Mean Square calculation for perceptual loudness representation
- **Adaptive Mode**: Dynamic scaling with intelligent gain adjustment for varying audio levels

### Enhanced RMS Processing

- Improved silence detection with smooth noise floor transition
- Natural baseline representation (no abrupt jumps to zero)
- Exponential transition curve for quiet signals (1-9 range)
- Logarithmic scaling for audible signals (10+ range)
- Better representation of real-world acoustic environments

### UI/UX Improvements

- Property-based settings panel with monospace fonts for better alignment
- Instant tooltip display (0ms delay) for faster help access
- Resizable split-pane layout for flexible workspace organization
- Synchronized layout between Web and Electron versions
- Improved accessibility with proper ARIA attributes

## Documentation & Developer Experience

- Enhanced documentation for lazy-loaded audio sources usage patterns
- Clear examples of correct vs incorrect memoization patterns
- Quick reference templates for developers
- Improved type safety (replaced `any` with `unknown`)

## Technical Improvements

- Cleaned up debug console statements for production readiness
- Optimized project structure and build configuration
- Enhanced code formatting and linting compliance
- Better error handling and user feedback

This release significantly improves the audio visualization experience with more accurate amplitude representation, especially for quiet environments and varying audio levels. The new RMS mode provides perceptual loudness calculation that better matches human hearing, while the adaptive mode automatically adjusts to different audio dynamics.
