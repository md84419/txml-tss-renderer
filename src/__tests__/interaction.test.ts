// Interaction tests for event handling

import { describe, it, expect, vi } from 'vitest';
import { TXMLTSSRenderer } from '../renderer.js';

// Mock jsimgui
vi.mock('@mori2003/jsimgui', () => ({
  ImGui: {
    Begin: vi.fn(() => true),
    End: vi.fn(),
    Text: vi.fn(),
    Button: vi.fn(() => true), // Return true to simulate button click
    InputTextWithHint: vi.fn(() => false),
    SliderFloat: vi.fn(() => false),
    Checkbox: vi.fn(() => false),
    SameLine: vi.fn(),
    Spacing: vi.fn(),
    Separator: vi.fn(),
    SetNextItemWidth: vi.fn(),
    SetNextWindowSize: vi.fn(),
    TextColored: vi.fn(),
    Cond: { Once: 0 }
  },
  ImVec2: vi.fn(),
  ImVec4: vi.fn(),
  ImGuiImplWeb: {
    BeginRender: vi.fn(),
    EndRender: vi.fn(),
    Init: vi.fn()
  }
}));

describe('Interaction Tests', () => {
  it('should invoke onClick handler when button is clicked', () => {
    const renderer = new TXMLTSSRenderer();
    const clickHandler = vi.fn();
    
    // Register event handler
    renderer.registerEventHandler('handleClick', clickHandler);
    
    const txml = `
      <App>
        <Body>
          <Button onClick="handleClick">Click Me</Button>
        </Body>
      </App>
    `;
    
    // Render the TXML (this should trigger the button click simulation)
    renderer.render(txml);
    
    // Verify the handler was called
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should handle multiple button clicks', () => {
    const renderer = new TXMLTSSRenderer();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    // Register multiple handlers
    renderer.registerEventHandler('handler1', handler1);
    renderer.registerEventHandler('handler2', handler2);
    
    const txml = `
      <App>
        <Body>
          <Button onClick="handler1">Button 1</Button>
          <Button onClick="handler2">Button 2</Button>
        </Body>
      </App>
    `;
    
    // Render the TXML
    renderer.render(txml);
    
    // Verify both handlers were called
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should handle button click with parameters', () => {
    const renderer = new TXMLTSSRenderer();
    const handler = vi.fn();
    
    // Register handler that expects parameters
    renderer.registerEventHandler('handleClick', handler);
    
    const txml = `
      <App>
        <Body>
          <Button onClick="handleClick">Click Me</Button>
        </Body>
      </App>
    `;
    
    // Render the TXML
    renderer.render(txml);
    
    // Verify handler was called (parameters would be passed in real implementation)
    expect(handler).toHaveBeenCalled();
  });

  it('should not crash when onClick handler is not registered', () => {
    const renderer = new TXMLTSSRenderer();
    
    const txml = `
      <App>
        <Body>
          <Button onClick="nonexistentHandler">Click Me</Button>
        </Body>
      </App>
    `;
    
    // This should not throw an error
    expect(() => renderer.render(txml)).not.toThrow();
  });

  it('should maintain state between button clicks', () => {
    const renderer = new TXMLTSSRenderer();
    let clickCount = 0;
    
    const handler = vi.fn(() => {
      clickCount++;
    });
    
    renderer.registerEventHandler('handleClick', handler);
    
    const txml = `
      <App>
        <Body>
          <Button onClick="handleClick">Click Me</Button>
        </Body>
      </App>
    `;
    
    // Render multiple times (simulating multiple frames)
    renderer.render(txml);
    renderer.render(txml);
    renderer.render(txml);
    
    // Verify handler was called multiple times
    expect(handler).toHaveBeenCalledTimes(3);
    expect(clickCount).toBe(3);
  });

  it('should handle complex interaction scenarios', () => {
    const renderer = new TXMLTSSRenderer();
    const saveHandler = vi.fn();
    const cancelHandler = vi.fn();
    const resetHandler = vi.fn();
    
    // Register multiple handlers
    renderer.registerEventHandler('save', saveHandler);
    renderer.registerEventHandler('cancel', cancelHandler);
    renderer.registerEventHandler('reset', resetHandler);
    
    const txml = `
      <App>
        <Body>
          <Window title="Settings">
            <Text>Application Settings</Text>
            <Button onClick="save">Save</Button>
            <SameLine />
            <Button onClick="cancel">Cancel</Button>
            <Button onClick="reset">Reset</Button>
          </Window>
        </Body>
      </App>
    `;
    
    // Render the complex UI
    renderer.render(txml);
    
    // Verify all handlers were called
    expect(saveHandler).toHaveBeenCalled();
    expect(cancelHandler).toHaveBeenCalled();
    expect(resetHandler).toHaveBeenCalled();
  });
});

