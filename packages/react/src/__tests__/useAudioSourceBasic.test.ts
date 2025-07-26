/**
 * useAudioSource Hook Basic Tests
 *
 * Testing our actual useAudioSource hook - only basic functionality that we know works
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioSource } from '../hooks/useAudioSource';

describe('useAudioSource Hook - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null audio source', () => {
    const { result } = renderHook(() => useAudioSource({}));

    expect(result.current.source).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle null source gracefully', () => {
    const { result } = renderHook(() => useAudioSource({ source: null }));

    expect(result.current.source).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle undefined source gracefully', () => {
    const { result } = renderHook(() => useAudioSource({ source: undefined }));

    expect(result.current.source).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
