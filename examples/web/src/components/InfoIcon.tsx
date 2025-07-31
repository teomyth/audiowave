import type React from 'react';

interface InfoIconProps {
  size?: number;
  color?: string;
  title?: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ size = 14, color = '#666', title }) => {
  return (
    <div
      title={title}
      style={{
        display: 'inline-flex',
        cursor: 'help',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        role="img"
        aria-label="Information"
      >
        <title>Information</title>
        <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1" fill="none" />
        <circle cx="8" cy="5" r="1" fill={color} />
        <path d="M8 7v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
