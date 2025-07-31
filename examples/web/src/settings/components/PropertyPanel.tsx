import type React from 'react';
import { InfoIcon } from '../../components/InfoIcon';
import { NumberSpinner } from '../../components/NumberSpinner';
import { Tooltip } from './Tooltip';

export interface PropertyItem {
  key: string;
  name: string; // 原生属性名
  type: 'boolean' | 'select' | 'number' | 'color' | 'range';
  value: unknown;
  options?: Array<{ value: unknown; label: string; description?: string }>;
  min?: number;
  max?: number;
  step?: number;
  description: string; // 必需的详细描述
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
  };

  switch (item.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={item.value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            transform: 'scale(1.2)', // 稍微放大复选框
          }}
        />
      );

    case 'select':
      return (
        <select
          value={item.value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            ...baseStyle,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {item.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'number':
      return (
        <NumberSpinner
          value={item.value}
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
            value={item.value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            min={item.min}
            max={item.max}
            step={item.step}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '11px', color: '#a0a0a0', minWidth: '30px' }}>{item.value}</span>
        </div>
      );

    case 'color':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="color"
            value={item.value}
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
            value={item.value}
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
  // 移除折叠功能相关代码

  return (
    <div
      style={{
        backgroundColor: 'transparent',
        height: '100%',
        overflowX: 'hidden', // 禁用水平滚动条
        overflowY: 'auto', // 只允许垂直滚动
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
      }}
    >
      {groups.map((group) => {
        // 不再需要折叠状态

        return (
          <div key={group.title}>
            {/* Group Header */}
            <div
              style={{
                padding: '6px 10px', // 进一步减少内边距
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444',
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px', // 进一步减小字体
                fontWeight: '600',
                color: '#e0e0e0',
                userSelect: 'none',
                borderTop: '1px solid #333',
              }}
            >
              <span>{group.title}</span>
              {/* 移除下拉箭头 */}
            </div>

            {/* Group Content - 始终显示，不再折叠 */}
            <div style={{ padding: '0' }}>
              {group.items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    padding: '4px 8px', // 进一步减少内边距
                    borderBottom: '1px solid #2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px', // 进一步减少间距
                    minHeight: '24px', // 进一步减少最小高度
                    backgroundColor: '#1a1a1a',
                  }}
                >
                  {/* Property Name */}
                  <div
                    style={{
                      minWidth: '120px', // 以 animateCurrentPick 为基准再紧缩
                      width: '120px', // 更紧凑的宽度
                      fontSize: '10px', // 稍微增大字体，提高可读性
                      color: '#c0c0c0',
                      textAlign: 'left',
                      whiteSpace: 'nowrap', // 不换行
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
