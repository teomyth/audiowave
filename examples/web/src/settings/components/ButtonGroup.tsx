import type React from 'react';

export interface ButtonGroupOption {
  value: string;
  label: string;
  description?: string;
}

export interface ButtonGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: ButtonGroupOption[];
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  style,
}) => {
  return (
    <div style={{ ...style }}>
      <div
        style={{
          display: 'flex',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid #444',
          backgroundColor: '#1a1a1a',
          maxWidth: '280px', // 限制最大宽度，与其他控件保持一致
          width: 'fit-content', // 根据内容调整宽度
        }}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            style={{
              padding: '8px 16px', // 增加左右内边距，减少flex: 1
              border: 'none',
              backgroundColor: value === option.value ? '#00bcd4' : 'transparent',
              color: value === option.value ? '#000' : '#e0e0e0',
              fontSize: '13px',
              fontWeight: value === option.value ? '600' : '400',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              borderRight: index < options.length - 1 ? '1px solid #444' : 'none',
              opacity: disabled ? 0.6 : 1,
              position: 'relative',
              whiteSpace: 'nowrap', // 防止文字换行
            }}
            onMouseEnter={(e) => {
              if (!disabled && value !== option.value) {
                e.currentTarget.style.backgroundColor = '#333';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && value !== option.value) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Show description for selected option */}
      {options.find((opt) => opt.value === value)?.description && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#a0a0a0',
            lineHeight: '1.4',
            textAlign: 'center',
          }}
        >
          {options.find((opt) => opt.value === value)?.description}
        </div>
      )}
    </div>
  );
};
