import type React from 'react';

interface WaveformIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const WaveformIcon: React.FC<WaveformIconProps> = ({
  size = 24,
  color = '#00bcd4',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Audio waveform"
  >
    {/* Audio wave bars - centered vertically, more prominent heights */}
    <g transform="translate(3, 16)">
      {/* Bar 1 - height 12, centered around y=0 */}
      <rect x="1" y="-6" width="3" height="12" rx="1.5" fill={color} />
      {/* Bar 2 - height 24, centered around y=0 */}
      <rect x="6" y="-12" width="3" height="24" rx="1.5" fill={color} />
      {/* Bar 3 - height 18, centered around y=0 */}
      <rect x="11" y="-9" width="3" height="18" rx="1.5" fill={color} />
      {/* Bar 4 - height 28, centered around y=0 */}
      <rect x="16" y="-14" width="3" height="28" rx="1.5" fill={color} />
      {/* Bar 5 - height 16, centered around y=0 */}
      <rect x="21" y="-8" width="3" height="16" rx="1.5" fill={color} />
      {/* Bar 6 - height 20, centered around y=0 */}
      <rect x="26" y="-10" width="3" height="20" rx="1.5" fill={color} />
    </g>
  </svg>
);
