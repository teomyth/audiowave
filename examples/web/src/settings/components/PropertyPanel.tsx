import type React from 'react';
import { InfoIcon } from '../../components/InfoIcon';
import { NumberSpinner } from '../../components/NumberSpinner';
import { Tooltip } from './Tooltip';

export interface PropertyItem {
  key: string;
  name: string; // Native property name
  type: 'boolean' | 'select' | 'number' | 'color' | 'range';
  value: unknown;
  options?: Array<{ value: unknown; label: string; description?: string }>;
  min?: number;
  max?: number;
  step?: number;
  description: string; // Required detailed description
  tooltip?: string;
}

export interface PropertyGroup {
  title: string;
  items: PropertyItem[];
  collapsed?: boolean;
}

export interface PropertyPanelProps {
  groups: PropertyGroup[];
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
}

const PropertyControl: React.FC<{
  item: PropertyItem;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}> = ({ item, onChange, disabled = false }) => {
  const baseStyle = {
    width: '100%',
    padding: '4px 8px',
    fontSize: '12px',
    border: '1px solid #444',
    borderRadius: '3px',
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
    outline: 'none',
    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", "Consolas", monospace',
  };

  switch (item.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={item.value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            transform: 'scale(1.2)', // Slightly enlarge checkbox
          }}
        />
      );

    case 'select':
      return (
        <select
          value={item.value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            ...baseStyle,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {item.options?.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'number':
      return (
        <NumberSpinner
          value={item.value as number}
          onChange={onChange}
          disabled={disabled}
          min={item.min}
          max={item.max}
          step={item.step || 1}
        />
      );

    case 'range':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            value={item.value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            min={item.min}
            max={item.max}
            step={item.step}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '11px', color: '#a0a0a0', minWidth: '30px' }}>
            {String(item.value)}
          </span>
        </div>
      );

    case 'color':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="color"
            value={item.value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              width: '30px',
              height: '20px',
              border: '1px solid #444',
              borderRadius: '3px',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          <input
            type="text"
            value={item.value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{ ...baseStyle, flex: 1 }}
          />
        </div>
      );

    default:
      return null;
  }
};

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  groups,
  onChange,
  disabled = false,
}) => {
  // Remove collapsing functionality code

  return (
    <div
      style={{
        backgroundColor: 'transparent',
        height: '100%',
        overflowX: 'hidden', // Disable horizontal scrollbar
        overflowY: 'auto', // Only allow vertical scrolling
        fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", "Consolas", monospace',
        fontSize: '12px',
      }}
    >
      {groups.map((group) => {
        // No longer need collapse state

        return (
          <div key={group.title}>
            {/* Group Header */}
            <div
              style={{
                padding: '6px 10px', // Further reduce padding
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444',
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px', // Further reduce font size
                fontWeight: '600',
                color: '#e0e0e0',
                userSelect: 'none',
                borderTop: '1px solid #333',
              }}
            >
              <span>{group.title}</span>
              {/* Remove dropdown arrow */}
            </div>

            {/* Group Content - Always visible, no longer collapsible */}
            <div style={{ padding: '0' }}>
              {group.items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    padding: '4px 8px', // Further reduce padding
                    borderBottom: '1px solid #2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px', // Further reduce spacing
                    minHeight: '24px', // Further reduce minimum height
                    backgroundColor: '#1a1a1a',
                  }}
                >
                  {/* Property Name */}
                  <div
                    style={{
                      minWidth: '120px', // Further compress based on animateCurrentPick
                      width: '120px', // More compact width
                      fontSize: '10px', // Slightly increase font for better readability
                      color: '#c0c0c0',
                      textAlign: 'left',
                      whiteSpace: 'nowrap', // No line wrapping
                      fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                      fontWeight: '500',
                    }}
                  >
                    {item.name}
                  </div>

                  {/* Info Icon with fast tooltip */}
                  <Tooltip content={item.description} position="right">
                    <InfoIcon size={14} color="#888" />
                  </Tooltip>

                  {/* Property Control */}
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <PropertyControl
                      item={item}
                      onChange={(value) => onChange(item.key, value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
