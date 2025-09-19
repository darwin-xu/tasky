import { renderHook, act } from '@testing-library/react';
import { useViewportState } from '../hooks/useViewportState';

describe('useViewportState Hook', () => {
  test('TC2.1: Initial State Values (Positive Case)', () => {
    const { result } = renderHook(() => useViewportState());
    
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.scale).toBe(1.0);
    expect(result.current.isDragging).toBe(false);
  });

  test('TC2.2: Position Update Functionality (Positive Case)', () => {
    const { result } = renderHook(() => useViewportState());
    
    act(() => {
      result.current.updatePosition(100, -50);
    });
    
    expect(result.current.x).toBe(100);
    expect(result.current.y).toBe(-50);
    expect(result.current.scale).toBe(1.0);
    expect(result.current.isDragging).toBe(false);
  });

  test('TC2.3: Scale Validation - Valid Range (Positive Case)', () => {
    const { result } = renderHook(() => useViewportState());
    
    // Test valid scale values
    act(() => { result.current.updateScale(0.5); });
    expect(result.current.scale).toBe(0.5);
    
    act(() => { result.current.updateScale(2.0); });
    expect(result.current.scale).toBe(2.0);
    
    act(() => { result.current.updateScale(0.1); });
    expect(result.current.scale).toBe(0.1);
    
    act(() => { result.current.updateScale(10.0); });
    expect(result.current.scale).toBe(10.0);
  });

  test('TC2.4: Scale Validation - Invalid Range (Negative Case)', () => {
    const { result } = renderHook(() => useViewportState());
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Test below minimum
    act(() => { result.current.updateScale(0.05); });
    expect(result.current.scale).toBe(0.1); // Should be clamped to minimum
    
    // Test above maximum
    act(() => { result.current.updateScale(15.0); });
    expect(result.current.scale).toBe(10.0); // Should be clamped to maximum
    
    // Test invalid values
    act(() => { result.current.updateScale(0); });
    expect(result.current.scale).toBe(1.0); // Should fallback to default
    
    act(() => { result.current.updateScale(-1); });
    expect(result.current.scale).toBe(1.0); // Should fallback to default
    
    consoleSpy.mockRestore();
  });

  test('TC2.5: Dragging State Management (Positive Case)', () => {
    const { result } = renderHook(() => useViewportState());
    
    act(() => { result.current.setDragging(true); });
    expect(result.current.isDragging).toBe(true);
    
    act(() => { result.current.setDragging(false); });
    expect(result.current.isDragging).toBe(false);
  });

  test('TC2.6: Large Coordinate Values (Stress Test)', () => {
    const { result } = renderHook(() => useViewportState());
    
    // Test large positive coordinates
    act(() => { result.current.updatePosition(1000000, 1000000); });
    expect(result.current.x).toBe(1000000);
    expect(result.current.y).toBe(1000000);
    
    // Test large negative coordinates
    act(() => { result.current.updatePosition(-1000000, -1000000); });
    expect(result.current.x).toBe(-1000000);
    expect(result.current.y).toBe(-1000000);
  });

  test('TC4.6: Invalid Coordinate Handling (Negative Case)', () => {
    const { result } = renderHook(() => useViewportState());
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Test NaN coordinates
    act(() => { result.current.updatePosition(NaN, NaN); });
    expect(result.current.x).toBe(0); // Should fallback to original value
    expect(result.current.y).toBe(0);
    
    // Test Infinity coordinates
    act(() => { result.current.updatePosition(Infinity, -Infinity); });
    expect(result.current.x).toBe(0); // Should fallback to original value
    expect(result.current.y).toBe(0);
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});