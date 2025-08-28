/**
 * Main TXML/TSS renderer
 */

import { TXMLElement, RenderContext, EventHandler } from './types.js';
import { parseTXML } from './xml-parser.js';
import { parseTSS } from './tss-parser.js';
import { StateManager } from './state-manager.js';
import { StyleEngine } from './style-engine.js';
import { WidgetRenderers } from './widget-renderers.js';

export class TXMLTSSRenderer {
  private stateManager: StateManager;
  private widgetRenderers: WidgetRenderers;
  private eventHandlers = new Map<string, EventHandler>();

  constructor() {
    this.stateManager = new StateManager();
    this.widgetRenderers = new WidgetRenderers();
  }

  /**
   * Register an event handler
   */
  registerEventHandler(name: string, callback: (...args: any[]) => void): void {
    this.eventHandlers.set(name, { name, callback });
  }

  /**
   * Parse and render TXML with TSS styling
   */
  render(txml: string, tss: string = ''): void {
    try {
      // Parse TXML
      const xmlElement = parseTXML(txml);
      
      // Parse TSS
      const stylesheet = parseTSS(tss);
      
      // Create style engine
      const styleEngine = new StyleEngine(stylesheet);
      
      // Begin frame
      this.stateManager.beginFrame();
      
      // Create render context
      const context = this.stateManager.createContext(stylesheet, this.eventHandlers);
      
      // Render the XML
      this.renderElement(xmlElement, context, styleEngine);
      
      // End frame
      this.stateManager.endFrame();
      
    } catch (error) {
      console.error('TXML/TSS render error:', error);
    }
  }

  /**
   * Render a single element
   */
  private renderElement(element: TXMLElement, context: RenderContext, styleEngine: StyleEngine): void {
    // Compute styles for this element
    styleEngine.computeStyle(element, context.currentPath);
    
    // Apply styles to ImGui (this would be implemented in the widget renderers)
    // For now, just render the element
    this.widgetRenderers.render(element, context);
  }

  /**
   * Get current state for debugging
   */
  getState(): Map<string, any> {
    return this.stateManager['state'];
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.stateManager['state'].clear();
  }
}

export function createRenderer(): TXMLTSSRenderer {
  return new TXMLTSSRenderer();
}
