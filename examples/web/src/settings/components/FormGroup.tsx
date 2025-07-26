import type React from 'react';

export interface FormGroupProps {
  /** Group title */
  title: string;
  /** Children components */
  children: React.ReactNode;
  /** Number of columns in grid layout */
  columns?: number;
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  children,
  columns = 2,
  className = '',
  disabled = false,
}) => {
  return (
    <fieldset
      className={`ui-form-group ${className}`}
      disabled={disabled}
      style={{
        border: '1px dashed #444',
        borderRadius: '6px',
        padding: '10px 6px 6px 6px', // 减少内边距
        margin: '0',
        backgroundColor: disabled ? '#0f0f0f' : '#1a1a1a',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        position: 'relative',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <legend
        style={{
          color: disabled ? '#666' : '#00bcd4',
          fontSize: '11px',
          fontWeight: '600',
          padding: '0 6px',
          backgroundColor: disabled ? '#0f0f0f' : '#1a1a1a',
          border: 'none',
          margin: '0',
          marginLeft: '0',
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </legend>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '8px',
          marginTop: '6px',
          maxWidth: '100%',
          alignItems: 'start',
        }}
      >
        {children}
      </div>
    </fieldset>
  );
};
