// TSS parser tests

import { describe, it, expect, vi } from 'vitest';
import { parseTSS, TSSParseError } from '../tss-parser.js';

describe('TSS Parser', () => {
  it('should parse simple CSS rules', () => {
    const tss = `
      Window {
        color: white;
        background-color: #333;
      }
      
      Button {
        background-color: #4CAF50;
        color: white;
      }
    `;
    
    const result = parseTSS(tss);
    
    expect(result.rules).toHaveLength(2);
    expect(result.rules[0].selector).toBe('Window');
    expect(result.rules[0].properties.color).toBe('white');
    expect(result.rules[0].properties['background-color']).toBe('#333');
  });

  it('should parse CSS variables', () => {
    const tss = `
      :root {
        --primary-color: #4CAF50;
        --secondary-color: #2196F3;
        --text-color: #ffffff;
      }
      
      Button {
        background-color: var(--primary-color);
        color: var(--text-color);
      }
    `;
    
    const result = parseTSS(tss);
    
    expect(result.variables.size).toBe(3);
    expect(result.variables.get('primary-color')).toBe('#4CAF50');
    expect(result.variables.get('secondary-color')).toBe('#2196F3');
    expect(result.variables.get('text-color')).toBe('#ffffff');
    
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].properties['background-color']).toBe('var(--primary-color)');
  });

  it('should calculate specificity correctly', () => {
    const tss = `
      Window { color: white; }
      .my-class { color: red; }
      #my-id { color: blue; }
    `;
    
    const result = parseTSS(tss);
    
    expect(result.rules[0].specificity).toBe(1); // tag
    expect(result.rules[1].specificity).toBe(10); // class
    expect(result.rules[2].specificity).toBe(100); // id
  });

  it('should handle descendant selectors', () => {
    const tss = `
      Window Button {
        background-color: #4CAF50;
      }
      
      .container .item {
        color: red;
      }
    `;
    
    const result = parseTSS(tss);
    
    expect(result.rules).toHaveLength(2);
    expect(result.rules[0].selector).toBe('Window Button');
    expect(result.rules[1].selector).toBe('.container .item');
  });

  it('should warn on unknown properties', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const tss = `
      Window {
        unknown-property: value;
        color: white;
      }
    `;
    
    parseTSS(tss);
    
    expect(consoleSpy).toHaveBeenCalledWith('Unknown property: unknown-property', expect.any(Number), expect.any(Number));
    
    consoleSpy.mockRestore();
  });

  it('should handle empty stylesheet', () => {
    const result = parseTSS('');
    
    expect(result.variables.size).toBe(0);
    expect(result.rules).toHaveLength(0);
  });

  it('should handle malformed CSS', () => {
    const tss = `
      Window {
        color: white
        background-color: #333;
      }
    `;
    
    expect(() => parseTSS(tss)).toThrow(TSSParseError);
  });

  it('should handle nested selectors', () => {
    const tss = `
      Window {
        color: white;
      }
      
      Window Button {
        background-color: #4CAF50;
      }
      
      Window Button:hover {
        background-color: #45a049;
      }
    `;
    
    const result = parseTSS(tss);
    
    expect(result.rules).toHaveLength(3);
    expect(result.rules[0].selector).toBe('Window');
    expect(result.rules[1].selector).toBe('Window Button');
    expect(result.rules[2].selector).toBe('Window Button:hover');
  });

  it('should handle quoted values', () => {
    const tss = `
      Text {
        font-family: "Arial, sans-serif";
        content: 'Hello World';
      }
    `;
    
    const result = parseTSS(tss);
    
    expect(result.rules[0].properties['font-family']).toBe('Arial, sans-serif');
    expect(result.rules[0].properties.content).toBe('Hello World');
  });

  it('should handle at-rules', () => {
    const tss = `
      @media screen {
        Window {
          color: white;
        }
      }
      
      Window {
        background-color: #333;
      }
    `;
    
    const result = parseTSS(tss);
    
    // At-rules should be skipped
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].selector).toBe('Window');
    expect(result.rules[0].properties['background-color']).toBe('#333');
  });
});
