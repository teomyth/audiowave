import type React from 'react';
import { GitHubIcon, NPMIcon } from './Icons';

export interface ExternalLinksProps {
  /** Custom className */
  className?: string;
}

/**
 * ExternalLinks Component
 *
 * Displays links to external resources (GitHub, NPM) in a consistent layout.
 */
export const ExternalLinks: React.FC<ExternalLinksProps> = ({ className = '' }) => {
  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    color: '#fff',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = '#00bcd4';
    e.currentTarget.style.borderColor = '#00bcd4';
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,188,212,0.3)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = '#2a2a2a';
    e.currentTarget.style.borderColor = '#444';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
  };

  return (
    <div
      className={`external-links ${className}`}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '12px',
        zIndex: 10,
      }}
    >
      <a
        href="https://github.com/teomyth/audiowave"
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="View on GitHub"
        title="View on GitHub"
      >
        <GitHubIcon size={32} />
      </a>
      <a
        href="https://www.npmjs.com/package/@audiowave/react"
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="View on NPM"
        title="View on NPM"
      >
        <NPMIcon size={32} />
      </a>
    </div>
  );
};
