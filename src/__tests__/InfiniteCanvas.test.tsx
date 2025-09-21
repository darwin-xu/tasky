import React from 'react';
import { render } from '@testing-library/react';

// Mock Konva for testing environment
jest.mock('react-konva', () => ({
  Stage: ({ children, width, height, x, y, ...props }: any) => (
    <div data-testid="konva-stage" data-width={width} data-height={height} data-x={x} data-y={y} {...props}>
      {children}
    </div>
  ),
  Layer: ({ children, ...props }: any) => (
    <div data-testid="konva-layer" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('konva/lib/Node', () => ({
  KonvaEventObject: {},
}));

import InfiniteCanvas from '../components/InfiniteCanvas';

describe('InfiniteCanvas Component', () => {
  test('TC1.1: Component Initialization (Positive Case)', () => {
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    const { getByTestId } = render(<InfiniteCanvas />, { container });
    
    // Component renders without throwing errors
    const stage = getByTestId('konva-stage');
    expect(stage).toBeInTheDocument();
    
    const layer = getByTestId('konva-layer');
    expect(layer).toBeInTheDocument();
    
    // Clean up
    document.body.removeChild(container);
  });

  test('TC1.2: Component with Custom Props (Positive Case)', () => {
    const { getByTestId, container } = render(
      <InfiniteCanvas width={1200} height={900} className="custom-canvas" />
    );
    
    // Check if custom className is applied
    const canvasContainer = container.querySelector('.custom-canvas');
    expect(canvasContainer).toBeInTheDocument();
    
    // Stage should exist
    const stage = getByTestId('konva-stage');
    expect(stage).toBeInTheDocument();
  });

  test('TC1.3: Component in Zero-Size Container (Edge Case)', () => {
    const container = document.createElement('div');
    container.style.width = '0px';
    container.style.height = '0px';
    document.body.appendChild(container);

    // Component should not crash
    expect(() => {
      render(<InfiniteCanvas />, { container });
    }).not.toThrow();
    
    // Clean up
    document.body.removeChild(container);
  });
});