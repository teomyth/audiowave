import type React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export interface TooltipProps {
  /** Tooltip content */
  content: string;
  /** Children to wrap */
  children: React.ReactNode;
  /** Optional ID for accessibility */
  id?: string;
  /** Position of the tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Custom className */
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  id,
  position = 'top',
  className = '',
}) => {
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-content={content}
        className={`ui-tooltip-wrapper ${className}`}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <ReactTooltip
        id={tooltipId}
        place={position}
        style={{
          backgroundColor: '#333',
          color: '#fff',
          fontSize: '12px',
          maxWidth: '320px',
          lineHeight: '1.4',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}
        opacity={1}
        delayShow={0}
        delayHide={100}
      />
    </>
  );
};
