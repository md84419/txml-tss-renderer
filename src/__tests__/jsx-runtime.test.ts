// JSX runtime tests

import { describe, it, expect } from 'vitest';
import { jsx, jsxs, jsxToTXML } from '../jsx-runtime.js';

describe('JSX Runtime', () => {
  it('should create simple JSX element', () => {
    const element = jsx('Text', { color: 'white' }, 'Hello World');
    
    expect(element.tag).toBe('Text');
    expect(element.attributes.color).toBe('white');
    expect(element.children).toEqual(['Hello World']);
  });

  it('should create element with multiple children', () => {
    const element = jsxs('Window', { title: 'Test' }, [
      jsx('Text', null, 'Hello'),
      jsx('Button', { onClick: 'handleClick' }, 'Click Me')
    ]);
    
    expect(element.tag).toBe('Window');
    expect(element.attributes.title).toBe('Test');
    expect(element.children).toHaveLength(2);
    expect(element.children[0]).toMatchObject({ tag: 'Text' });
    expect(element.children[1]).toMatchObject({ tag: 'Button' });
  });

  it('should handle null and undefined children', () => {
    const element = jsx('Window', { 
      children: [null, 'Hello', undefined, 'World'] 
    });
    
    expect(element.children).toEqual(['Hello', 'World']);
  });

  it('should convert JSX to TXML string', () => {
    const element = jsx('Window', { title: 'Test' }, [
      jsx('Text', null, 'Hello World'),
      jsx('Button', { onClick: 'handleClick' }, 'Click Me')
    ]);
    
    const txml = jsxToTXML(element);
    
    expect(txml).toContain('<Window title="Test">');
    expect(txml).toContain('<Text>Hello World</Text>');
    expect(txml).toContain('<Button onClick="handleClick">Click Me</Button>');
    expect(txml).toContain('</Window>');
  });

  it('should handle self-closing elements', () => {
    const element = jsx('Spacing', {}, []);
    
    const txml = jsxToTXML(element);
    
    expect(txml).toBe('<Spacing />');
  });

  it('should handle elements with attributes but no children', () => {
    const element = jsx('InputText', { 
      label: 'Name', 
      hint: 'Enter your name' 
    }, []);
    
    const txml = jsxToTXML(element);
    
    expect(txml).toBe('<InputText label="Name" hint="Enter your name" />');
  });

  it('should handle nested JSX structures', () => {
    const element = jsxs('App', null, [
      jsx('Head', {}, []),
      jsxs('Body', null, [
        jsxs('Window', { title: 'Main' }, [
          jsx('Text', null, 'Welcome'),
          jsx('Button', { onClick: 'handleClick' }, 'Click Me')
        ])
      ])
    ]);
    
    const txml = jsxToTXML(element);
    
    expect(txml).toContain('<App>');
    expect(txml).toContain('<Head />');
    expect(txml).toContain('<Body>');
    expect(txml).toContain('<Window title="Main">');
    expect(txml).toContain('<Text>Welcome</Text>');
    expect(txml).toContain('<Button onClick="handleClick">Click Me</Button>');
    expect(txml).toContain('</Window>');
    expect(txml).toContain('</Body>');
    expect(txml).toContain('</App>');
  });

  it('should handle string children', () => {
    const element = jsx('Text', null, 'Simple text content');
    
    const txml = jsxToTXML(element);
    
    expect(txml).toBe('<Text>Simple text content</Text>');
  });

  it('should handle mixed children types', () => {
    const element = jsxs('Window', { title: 'Mixed' }, [
      'Text content',
      jsx('Button', { onClick: 'handleClick' }, 'Button'),
      'More text'
    ]);
    
    const txml = jsxToTXML(element);
    
    expect(txml).toContain('<Window title="Mixed">');
    expect(txml).toContain('Text content');
    expect(txml).toContain('<Button onClick="handleClick">Button</Button>');
    expect(txml).toContain('More text');
    expect(txml).toContain('</Window>');
  });

  it('should handle special characters in attributes', () => {
    const element = jsx('Text', { 
      content: 'Hello "World" & <Special>',
      className: 'test-class'
    }, []);
    
    const txml = jsxToTXML(element);
    
    expect(txml).toContain('content="Hello &quot;World&quot; &amp; &lt;Special&gt;"');
    expect(txml).toContain('className="test-class"');
  });
});
