import Phaser from 'phaser';

/**
 * Input event types that can be triggered by the input controller
 */
export enum InputEvent {
  THROTTLE_START = 'throttle_start',
  THROTTLE_END = 'throttle_end',
  BRAKE_START = 'brake_start',
  BRAKE_END = 'brake_end',
  NITRO_START = 'nitro_start',
  NITRO_END = 'nitro_end'
}

/**
 * Handles player input and converts raw keyboard events into game-specific input events.
 * This decouples the input handling from game entities, making the code more maintainable.
 */
export class InputController {
  private scene: Phaser.Scene;
  private listeners: Map<InputEvent, Array<() => void>> = new Map();
  
  /**
   * Creates a new input controller for the given scene
   * @param scene - The Phaser scene to attach input handling to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboardEvents();
  }
  
  /**
   * Sets up keyboard event listeners
   */
  private setupKeyboardEvents(): void {
    this.scene.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      this.handleKeyDown(e.code);
    });
    
    this.scene.input.keyboard!.on('keyup', (e: KeyboardEvent) => {
      this.handleKeyUp(e.code);
    });
  }
  
  /**
   * Handles key down events and triggers appropriate input events
   * @param keyCode - The code of the key that was pressed
   */
  private handleKeyDown(keyCode: string): void {
    if (keyCode === 'ArrowRight' || keyCode === 'KeyD') {
      this.emit(InputEvent.THROTTLE_START);
    }
    if (keyCode === 'ArrowLeft' || keyCode === 'KeyA') {
      this.emit(InputEvent.BRAKE_START);
    }
    if (keyCode === 'ShiftLeft' || keyCode === 'ShiftRight') {
      this.emit(InputEvent.NITRO_START);
    }
  }
  
  /**
   * Handles key up events and triggers appropriate input events
   * @param keyCode - The code of the key that was released
   */
  private handleKeyUp(keyCode: string): void {
    if (keyCode === 'ArrowRight' || keyCode === 'KeyD') {
      this.emit(InputEvent.THROTTLE_END);
    }
    if (keyCode === 'ArrowLeft' || keyCode === 'KeyA') {
      this.emit(InputEvent.BRAKE_END);
    }
    if (keyCode === 'ShiftLeft' || keyCode === 'ShiftRight') {
      this.emit(InputEvent.NITRO_END);
    }
  }
  
  /**
   * Adds a listener for a specific input event
   * @param event - The input event to listen for
   * @param callback - The function to call when the event is triggered
   */
  public on(event: InputEvent, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
  }
  
  /**
   * Removes a listener for a specific input event
   * @param event - The input event to stop listening for
   * @param callback - The function to remove from the listeners
   */
  public off(event: InputEvent, callback: () => void): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
  
  /**
   * Emits an input event to all registered listeners
   * @param event - The input event to emit
   */
  private emit(event: InputEvent): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const callbacks = this.listeners.get(event)!;
    callbacks.forEach(callback => callback());
  }
  
  /**
   * Cleans up all event listeners when the controller is no longer needed
   */
  public destroy(): void {
    this.listeners.clear();
  }
}
