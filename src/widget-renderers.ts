/**
 * Widget renderers for TXML elements to ImGui calls
 */

import { ImGui, ImVec2, ImVec4 } from '@mori2003/jsimgui';
import { TXMLElement, RenderContext, WidgetRenderer, ComputedStyle } from './types.js';

export class WidgetRenderers {
  private renderers = new Map<string, WidgetRenderer>();

  constructor() {
    this.setupRenderers();
  }

  private setupRenderers(): void {
    this.renderers.set('App', this.renderApp.bind(this));
    this.renderers.set('Head', this.renderHead.bind(this));
    this.renderers.set('Body', this.renderBody.bind(this));
    this.renderers.set('Window', this.renderWindow.bind(this));
    this.renderers.set('Text', this.renderText.bind(this));
    this.renderers.set('Button', this.renderButton.bind(this));
    this.renderers.set('InputText', this.renderInputText.bind(this));
    this.renderers.set('SliderFloat', this.renderSliderFloat.bind(this));
    this.renderers.set('Checkbox', this.renderCheckbox.bind(this));
    this.renderers.set('SameLine', this.renderSameLine.bind(this));
    this.renderers.set('Spacing', this.renderSpacing.bind(this));
    this.renderers.set('Separator', this.renderSeparator.bind(this));
  }

  render(element: TXMLElement, context: RenderContext): void {
    const renderer = this.renderers.get(element.tag);
    if (renderer) {
      renderer(element, context);
    } else {
      console.warn(`No renderer for tag: ${element.tag}`);
    }
  }

  private renderApp(element: TXMLElement, context: RenderContext): void {
    // App is the root container, just render children
    this.renderChildren(element, context);
  }

  private renderHead(_element: TXMLElement, _context: RenderContext): void {
    // Head contains metadata, skip rendering for now
  }

  private renderBody(element: TXMLElement, context: RenderContext): void {
    // Body is the main content area, render children
    this.renderChildren(element, context);
  }

  private renderWindow(element: TXMLElement, context: RenderContext): void {
    const title = element.attributes.title || 'Window';
    const style = this.getComputedStyle(element, context);
    
    // Apply window styling if needed
    if (style.width && style.width.type === 'number') {
      ImGui.SetNextWindowSize(new ImVec2(style.width.value, style.height?.value || 200), ImGui.Cond.Once);
    }
    
    const opened = ImGui.Begin(title);
    if (opened) {
      this.renderChildren(element, context);
    }
    ImGui.End();
  }

  private renderText(element: TXMLElement, context: RenderContext): void {
    const text = this.getTextContent(element);
    const style = this.getComputedStyle(element, context);
    
    if (style.color && style.color.type === 'color') {
      const color = this.intToImVec4(style.color.value);
      ImGui.TextColored(color, text);
    } else {
      ImGui.Text(text);
    }
  }

  private renderButton(element: TXMLElement, context: RenderContext): void {
    const text = this.getTextContent(element);
    const style = this.getComputedStyle(element, context);
    
    // Apply button styling
    if (style.width && style.width.type === 'number') {
      ImGui.SetNextItemWidth(style.width.value);
    }
    
    const clicked = ImGui.Button(text);
    
    if (clicked && element.attributes.onClick) {
      this.handleEvent(element.attributes.onClick, context);
    }
  }

  private renderInputText(element: TXMLElement, context: RenderContext): void {
    const id = this.generateId(element, context);
    const state = context.state.get(id) || { id, value: '', lastFrame: context.frameNumber };
    
    const label = element.attributes.label || '';
    const hint = element.attributes.hint || '';
    const style = this.getComputedStyle(element, context);
    
    // Apply input styling
    if (style.width && style.width.type === 'number') {
      ImGui.SetNextItemWidth(style.width.value);
    }
    
    let value = state.value || '';
    const valueArray = [value];
    const changed = ImGui.InputTextWithHint(label, hint, valueArray, 256);
    
    if (changed) {
      state.value = valueArray[0];
      state.lastFrame = context.frameNumber;
      context.state.set(id, state);
    }
  }

  private renderSliderFloat(element: TXMLElement, context: RenderContext): void {
    const id = this.generateId(element, context);
    const state = context.state.get(id) || { id, value: 0.5, lastFrame: context.frameNumber };
    
    const label = element.attributes.label || '';
    const min = parseFloat(element.attributes.min || '0');
    const max = parseFloat(element.attributes.max || '1');
    const style = this.getComputedStyle(element, context);
    
    // Apply slider styling
    if (style.width && style.width.type === 'number') {
      ImGui.SetNextItemWidth(style.width.value);
    }
    
    let value = state.value || 0.5;
    const changed = ImGui.SliderFloat(label, value, min, max);
    
    if (changed) {
      state.value = value;
      state.lastFrame = context.frameNumber;
      context.state.set(id, state);
    }
  }

  private renderCheckbox(element: TXMLElement, context: RenderContext): void {
    const id = this.generateId(element, context);
    const state = context.state.get(id) || { id, value: false, lastFrame: context.frameNumber };
    
    const label = element.attributes.label || '';
    let checked = state.value || false;
    const changed = ImGui.Checkbox(label, checked);
    
    if (changed) {
      state.value = checked;
      state.lastFrame = context.frameNumber;
      context.state.set(id, state);
    }
  }

  private renderSameLine(element: TXMLElement, _context: RenderContext): void {
    const offset = parseFloat(element.attributes.offset || '0');
    const spacing = parseFloat(element.attributes.spacing || '-1');
    ImGui.SameLine(offset, spacing);
  }

  private renderSpacing(_element: TXMLElement, _context: RenderContext): void {
    ImGui.Spacing();
  }

  private renderSeparator(_element: TXMLElement, _context: RenderContext): void {
    ImGui.Separator();
  }

  private renderChildren(element: TXMLElement, context: RenderContext): void {
    const oldPath = [...context.currentPath];
    context.currentPath.push(element.tag);
    
    for (const child of element.children) {
      if (typeof child === 'string') {
        // Text content - render as text
        if (child.trim()) {
          ImGui.Text(child.trim());
        }
      } else {
        // Element - render recursively
        this.render(child, context);
      }
    }
    
    context.currentPath = oldPath;
  }

  private getTextContent(element: TXMLElement): string {
    return element.children
      .filter(child => typeof child === 'string')
      .join('')
      .trim();
  }

  private getComputedStyle(_element: TXMLElement, _context: RenderContext): ComputedStyle {
    // This would use the style engine to compute styles
    // For now, return empty style
    return {};
  }

  private generateId(element: TXMLElement, context: RenderContext): string {
    // Generate stable ID based on element path
    const path = [...context.currentPath, element.tag];
    return path.join('/');
  }

  private handleEvent(eventName: string, context: RenderContext): void {
    const handler = context.eventHandlers.get(eventName);
    if (handler) {
      handler.callback();
    } else {
      console.warn(`No event handler found for: ${eventName}`);
    }
  }

  private intToImVec4(color: number): ImVec4 {
    const r = ((color >> 16) & 0xff) / 255;
    const g = ((color >> 8) & 0xff) / 255;
    const b = (color & 0xff) / 255;
    const a = ((color >> 24) & 0xff) / 255;
    return new ImVec4(r, g, b, a);
  }
}

export function createWidgetRenderers(): WidgetRenderers {
  return new WidgetRenderers();
}
