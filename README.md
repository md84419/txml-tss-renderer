# TXML/TSS Renderer

A simple XML + CSS-like styling layer for Dear ImGui via jsimgui. Think of it as a way to write UI layouts in XML and style them with CSS, but for ImGui.

## What it does

Instead of writing ImGui code like this:
```cpp
ImGui::Begin("My Window");
ImGui::Text("Hello World");
if (ImGui::Button("Click Me")) {
    // handle click
}
ImGui::End();
```

You can write it like this:
```xml
<App>
    <Body>
        <Window title="My Window">
            <Text>Hello World</Text>
            <Button onClick="handleClick">Click Me</Button>
        </Window>
    </Body>
</App>
```

And style it with CSS:
```css
Button {
    background-color: #4CAF50;
    color: white;
}
```

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000/demo.html to see it in action.

## Basic usage

```typescript
import { TXMLTSSRenderer } from 'txml-tss-renderer';

const renderer = new TXMLTSSRenderer();

// Register event handlers
renderer.registerEventHandler('handleClick', () => {
    console.log('Button was clicked!');
});

// Your UI in XML
const txml = `
<App>
    <Body>
        <Window title="My App">
            <Text>Hello there!</Text>
            <Button onClick="handleClick">Click me</Button>
        </Window>
    </Body>
</App>
`;

// Style it
const tss = `
Button {
    background-color: #4CAF50;
    color: white;
}
`;

// Render it (call this in your ImGui render loop)
renderer.render(txml, tss);
```

## Supported widgets

- `<Text>` - Just displays text
- `<Button>` - Clickable button
- `<InputText>` - Text input field
- `<SliderFloat>` - Float slider
- `<Checkbox>` - Checkbox
- `<Window>` - Window container

## Layout helpers

- `<SameLine>` - Put the next widget on the same line
- `<Spacing>` - Add some vertical space
- `<Separator>` - Draw a line

## Styling with TSS

Works pretty much like CSS:

```css
/* CSS variables */
:root {
    --primary-color: #4CAF50;
    --text-color: white;
}

/* Style by tag name */
Button {
    background-color: var(--primary-color);
    color: white;
}

/* Style by class */
.my-button {
    background-color: red;
}

/* Style by ID */
#special-button {
    background-color: blue;
}

/* Nested selectors */
Window Button {
    background-color: var(--primary-color);
}
```

## Event handling

Register handlers and reference them in your XML:

```typescript
renderer.registerEventHandler('saveData', () => {
    console.log('Saving data...');
});

renderer.registerEventHandler('showAlert', (message) => {
    alert(message);
});
```

Then use them in XML:
```xml
<Button onClick="saveData">Save</Button>
<Button onClick="showAlert">Show Alert</Button>
```

## JSX support

You can also use JSX if you prefer:

```typescript
import { jsx } from 'txml-tss-renderer';

const App = () => jsx('App', null, [
    jsx('Body', null, [
        jsx('Window', { title: 'My App' }, [
            jsx('Text', null, 'Hello from JSX!'),
            jsx('Button', { onClick: 'handleClick' }, 'Click me')
        ])
    ])
]);
```

## State management

The renderer automatically handles widget state between frames. Input values, slider positions, checkbox states - all preserved automatically.

```typescript
// Get current state (for debugging)
const state = renderer.getState();
console.log('Current state:', state);

// Clear all state
renderer.clearState();
```

## Building

```bash
npm run build    # Build the library
npm test         # Run tests
npm run dev      # Start dev server
```

## Requirements

- Node.js 18+
- Modern browser with WebGPU or WebGL2
- @mori2003/jsimgui

## License

MIT

## What's included

- TXML parser (XML → ImGui calls)
- TSS parser (CSS → styling)
- Event system (onClick handlers)
- State management (preserves widget state)
- JSX runtime (alternative to XML)
- Working demo
- Tests

This was built to match the Trema XML/CSS system but for web-based ImGui applications.