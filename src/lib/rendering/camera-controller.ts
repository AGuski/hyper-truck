import { Vec2 } from 'planck';

/**
 * Handles camera positioning, zooming, and coordinate transformations
 * for the game's rendering system.
 */
export class CameraController {
  private readonly SCALE: number = 50; // Pixels per meter
  private currentZoom: number = 0.5;   // Current camera zoom level
  private targetCameraY: number = 0;   // Target Y position for camera
  private currentCameraY: number = 0;  // Current Y position for camera
  private currentCameraXOffset: number = 0; // Current X offset for camera (for speed-based positioning)
  private readonly MAX_SPEED_FOR_OFFSET: number = 50; // Speed at which max offset is reached (in km/h)
  private readonly MIN_SPEED_FOR_OFFSET: number = 30; // Speed at which offset starts (in km/h)
  
  /**
   * Creates a new CameraController instance
   */
  constructor() {
    this.targetCameraY = 0;
    this.currentCameraY = 0;
    this.currentCameraXOffset = 0;
  }
  
  /**
   * Updates the zoom level for rendering
   * @param zoom - New zoom level
   */
  public setZoom(zoom: number): void {
    this.currentZoom = zoom;
  }
  
  /**
   * Gets the current zoom level
   * @returns Current zoom level
   */
  public getZoom(): number {
    return this.currentZoom;
  }
  
  /**
   * Gets the current scale factor (pixels per meter)
   * @returns The scale factor
   */
  public getScale(): number {
    return this.SCALE;
  }
  
  /**
   * Gets the current camera Y position
   * @returns Current camera Y position
   */
  public getCurrentCameraY(): number {
    return this.currentCameraY;
  }
  
  /**
   * Updates camera position based on car position, speed, and viewport dimensions
   * @param carPosition - The car's current position
   * @param carSpeed - The car's current speed in km/h
   * @param cameraWidth - Width of the camera viewport
   * @param cameraHeight - Height of the camera viewport
   */
  public updateCamera(
    carPosition: Vec2,
    cameraWidth: number,
    cameraHeight: number,
    carSpeed: number = 0
  ): void {
    // Update target camera Y position based on car's Y position
    this.targetCameraY = carPosition.y;
    
    // Calculate the vertical distance between the car and the camera in screen space
    const centerY = Math.round(cameraHeight / 2);
    const carScreenY = centerY - (carPosition.y - this.currentCameraY) * this.SCALE * this.currentZoom + cameraHeight * 0.2;
    
    // Define the inner and outer margins for smooth transition
    const innerMargin = cameraHeight * 0.15; // 15% of screen height
    const outerMargin = cameraHeight * 0.05; // 5% of screen height
    
    // Calculate how far the car is from the edge as a normalized value (0-1)
    // 0 = at the inner margin, 1 = at or beyond the outer margin
    let distanceFromCenter = 0;
    
    if (carScreenY < innerMargin) {
      // Car is too high on screen
      distanceFromCenter = Math.min(1, (innerMargin - carScreenY) / outerMargin);
    } else if (carScreenY > cameraHeight - innerMargin) {
      // Car is too low on screen
      distanceFromCenter = Math.min(1, (carScreenY - (cameraHeight - innerMargin)) / outerMargin);
    }
    
    // Use a smooth transition between slow and fast lerp factors
    // Minimum lerp = 0.015 (normal smooth camera)
    // Maximum lerp = 0.2 (fast catch-up but not too abrupt)
    const minLerpFactor = 0.015;
    const maxLerpFactor = 0.2;
    const lerpFactor = minLerpFactor + distanceFromCenter * (maxLerpFactor - minLerpFactor);
    
    // Smoothly interpolate current camera Y position towards target
    this.updateCameraY(lerpFactor);
    
    // Update camera X offset based on car speed
    this.updateCameraXOffset(carSpeed);
  }
  
  /**
   * Updates the camera's horizontal offset based on car speed
   * @param carSpeed - The car's current speed in km/h
   * @param lerpFactor - Interpolation factor (0-1, higher = faster transition)
   */
  private updateCameraXOffset(carSpeed: number, lerpFactor: number = 0.0025): void {
    // Calculate the target offset based on speed
    // At MIN_SPEED_FOR_OFFSET km/h or below: no offset (centered)
    // At MAX_SPEED_FOR_OFFSET km/h or above: maximum offset (1/4 of screen width)
    
    // If speed is below the minimum threshold, target offset is 0
    if (carSpeed < this.MIN_SPEED_FOR_OFFSET) {
      const targetOffset = 0;
      this.currentCameraXOffset = this.currentCameraXOffset + (targetOffset - this.currentCameraXOffset) * lerpFactor;
      return;
    }
    
    // Calculate normalized speed factor only for speeds above the minimum threshold
    const adjustedSpeed = carSpeed - this.MIN_SPEED_FOR_OFFSET;
    const adjustedMaxSpeed = this.MAX_SPEED_FOR_OFFSET - this.MIN_SPEED_FOR_OFFSET;
    const speedFactor = Math.min(1, adjustedSpeed / adjustedMaxSpeed);
    const targetOffset = speedFactor * 0.25; // 0.25 represents the maximum offset (1/4 of screen width)
    
    // Smoothly interpolate towards the target offset
    this.currentCameraXOffset = this.currentCameraXOffset + (targetOffset - this.currentCameraXOffset) * lerpFactor;
  }
  
  /**
   * Creates a world-to-screen coordinate transformation function
   * @param carPosition - The car's current position
   * @param cameraWidth - Width of the camera viewport
   * @param cameraHeight - Height of the camera viewport
   * @returns A function that transforms world coordinates to screen coordinates
   */
  public getWorldToScreenTransform(
    carPosition: Vec2,
    cameraWidth: number,
    cameraHeight: number
  ): (vec: Vec2) => { x: number, y: number } {
    // Calculate the center X position with the speed-based offset
    // As offset increases (with speed), centerX moves towards 1/4 of the screen width
    const baseX = Math.round(cameraWidth / 2);
    const offsetX = Math.round(cameraWidth * this.currentCameraXOffset);
    const centerX = baseX - offsetX;
    
    const centerY = Math.round(cameraHeight / 2);
    
    // Return the transformation function
    return (vec: Vec2) => ({
      // Round to exact pixels for sharper rendering
      // Only follow the car on X axis, apply zoom factor
      x: Math.round(centerX + (vec.x - carPosition.x) * this.SCALE * this.currentZoom),
      // Smooth Y follow with offset - interpolate towards car's Y position
      y: Math.round(centerY - (vec.y - this.currentCameraY) * this.SCALE * this.currentZoom + cameraHeight * 0.2)
    });
  }
  
  /**
   * Calculates the target zoom level based on car speed
   * @param speed - Current car speed
   * @returns Target zoom level
   */
  public calculateTargetZoom(speed: number): number {
    const minZoom: number = 0.25;
    const maxZoom: number = 1;
    const maxSpeed: number = 80;
    const speedFactor = Math.abs(speed) / (maxSpeed - 40);
    return maxZoom - (maxZoom - minZoom) * speedFactor;
  }
  
  /**
   * Smoothly updates the current zoom level towards a target zoom
   * @param targetZoom - The target zoom level to approach
   * @param lerpFactor - Interpolation factor (0-1, higher = faster transition)
   * @returns The new current zoom level
   */
  public updateZoom(targetZoom: number, lerpFactor: number = 0.02): number {
    this.currentZoom = this.currentZoom + (targetZoom - this.currentZoom) * lerpFactor;
    return this.currentZoom;
  }
  
  /**
   * Smoothly updates the current camera Y position towards the target Y position
   * @param lerpFactor - Interpolation factor (0-1, higher = faster transition)
   * @returns The new current camera Y position
   */
  private updateCameraY(lerpFactor: number = 0.02): number {
    this.currentCameraY = this.currentCameraY + (this.targetCameraY - this.currentCameraY) * lerpFactor;
    return this.currentCameraY;
  }
}
