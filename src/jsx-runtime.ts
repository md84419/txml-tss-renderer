// JSX runtime for TXML generation

import { TXMLElement } from './types.js';

// JSX factory function
export function jsx(type: string, props: any, key?: any): TXMLElement {
  const attributes: Record<string, string> = {};
  const children: (TXMLElement | string)[] = [];

  // Handle children from props.children or key parameter
  if (props && props.children !== undefined) {
    if (Array.isArray(props.children)) {
      children.push(...props.children.filter((child: any) => child !== null && child !== undefined));
    } else if (props.children !== null && props.children !== undefined) {
      children.push(props.children as any);
    }
  } else if (key !== undefined) {
    // JSX passes children as the third parameter (key)
    if (Array.isArray(key)) {
      children.push(...key.filter((child: any) => child !== null && child !== undefined));
    } else if (key !== null && key !== undefined) {
      children.push(key as any);
    }
  }

  // Convert props to attributes
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'children') {
        // Already handled above
        continue;
      } else if (key === 'key') {
        // Skip React key prop
        continue;
      } else {
        // Convert value to string
        attributes[key] = String(value);
      }
    }
  }

  return {
    tag: type,
    attributes,
    children
  };
}

// JSX factory for multiple children
export function jsxs(type: string, props: any, _key?: any): TXMLElement {
  return jsx(type, props, _key);
}

// Fragment support
export const Fragment = Symbol('Fragment');

// Helper function to convert JSX to TXML string
export function jsxToTXML(element: TXMLElement): string {
  if (typeof element === 'string') {
    return element;
  }

  const { tag, attributes, children } = element;
  
  // Build attributes string with proper escaping
  const attrsStr = Object.entries(attributes)
    .map(([key, value]) => {
      const escapedValue = String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `${key}="${escapedValue}"`;
    })
    .join(' ');

  // Build children string
  const childrenStr = children
    .map(child => jsxToTXML(child as any))
    .join('');

  if (children.length === 0) {
    return `<${tag}${attrsStr ? ' ' + attrsStr : ''} />`;
  }

  return `<${tag}${attrsStr ? ' ' + attrsStr : ''}>${childrenStr}</${tag}>`;
}

// Example usage:
/*
// This JSX:
const App = () => (
  <App>
    <Head />
    <Body>
      <Window title="My App">
        <Text>Hello, JSX!</Text>
        <Button onClick="handleClick">Click Me</Button>
      </Window>
    </Body>
  </App>
);

// Compiles to:
const App = () => jsxs("App", null, jsxs("Head", null), jsxs("Body", null, 
  jsxs("Window", { title: "My App" }, 
    jsx("Text", null, "Hello, JSX!"),
    jsx("Button", { onClick: "handleClick" }, "Click Me")
  )
));

// Can be converted to TXML:
const txml = jsxToTXML(App());
*/
