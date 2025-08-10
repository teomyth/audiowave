import React, { useCallback, useRef, useState } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  defaultLeftWidth = 320, // Reduce default width for compact design
  minLeftWidth = 300, // Reduce minimum width
  maxLeftWidth = 450, // Reduce maximum width
  className = '',
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = e.clientX - containerRect.left;

      // Clamp the width within bounds
      const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));

      setLeftWidth(clampedWidth);
    },
    [isDragging, minLeftWidth, maxLeftWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }

    // Return undefined when not dragging (satisfies TypeScript)
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`split-pane ${className}`}
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          width: `${leftWidth}px`,
          minWidth: `${minLeftWidth}px`,
          maxWidth: `${maxLeftWidth}px`,
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRight: '2px solid #444',
          boxShadow: '2px 0 4px rgba(0,0,0,0.2)',
        }}
      >
        {left}
      </div>

      {/* Splitter - Hidden divider */}
      {/* biome-ignore lint/a11y/useSemanticElements: Interactive resizable splitter requires div for mouse events */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuenow={leftWidth}
        aria-valuemin={minLeftWidth}
        aria-valuemax={maxLeftWidth}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        style={{
          width: '2px', // Reduce width
          height: '100%',
          backgroundColor: 'transparent', // Default transparent
          cursor: 'col-resize',
          position: 'relative',
          flexShrink: 0,
          transition: isDragging ? 'none' : 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#444'; // Show light color on hover
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {/* Remove obvious indicators */}
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          /* Subtle gradient consistent with body background */
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
        }}
      >
        {right}
      </div>
    </div>
  );
};
