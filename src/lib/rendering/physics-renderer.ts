import Phaser from 'phaser';
import { World, Vec2, Body } from 'planck';
import type { PolygonShape, CircleShape, EdgeShape } from 'planck';
import { Car } from '../entities/car';

/**
 * Handles rendering of physics bodies and game elements using Phaser graphics.
 * Encapsulates all drawing logic to keep scene classes focused on game logic.
 */
export class PhysicsRenderer {
  private readonly SCALE: number = 50;// Pixels per meter
  private currentZoom: number = 0.5;   // Current camera zoom level
  private graphics: Phaser.GameObjects.Graphics;
  private targetCameraY: number = 0;   // Target Y position for camera
  private currentCameraY: number = 0;  // Current Y position for camera
  
  /**
   * Creates a new PhysicsRenderer instance
   * @param graphics - The Phaser graphics object to draw with
   */
  constructor(graphics: Phaser.GameObjects.Graphics) {
    this.graphics = graphics;
    this.targetCameraY = 0;
    this.currentCameraY = 0;
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
   * Clears the graphics context and prepares for new rendering
   */
  public clear(): void {
    this.graphics.clear();
    // Use thinner line width based on device pixel ratio for sharper lines
    this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
  }
  
  /**
   * Renders all physics bodies in the world
   * @param world - The physics world to render
   * @param car - The player's car (used for camera centering)
   * @param cameraWidth - Width of the camera viewport
   * @param cameraHeight - Height of the camera viewport
   * @param distanceFilter - Optional max distance from car to render bodies (for optimization)
   */
  public renderWorld(
    world: World, 
    car: Car, 
    cameraWidth: number, 
    cameraHeight: number,
    distanceFilter?: number
  ): void {
    // Simple camera: we'll center drawing on the car.
    const centerX = Math.round(cameraWidth / 2);
    const centerY = Math.round(cameraHeight / 2);
    const carWorldPos = car.getPosition();
    
    // Update target camera Y position based on car's Y position
    this.targetCameraY = carWorldPos.y;
    
    // Calculate the vertical distance between the car and the camera in screen space
    const carScreenY = centerY - (carWorldPos.y - this.currentCameraY) * this.SCALE * this.currentZoom + cameraHeight * 0.2;
    
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
    
    // Create a world-to-screen coordinate transformation function
    const worldToScreen = (vec: Vec2) => ({
      // Round to exact pixels for sharper rendering
      // Only follow the car on X axis, apply zoom factor
      x: Math.round(centerX + (vec.x - carWorldPos.x) * this.SCALE * this.currentZoom),
      // Smooth Y follow with offset - interpolate towards car's Y position
      y: Math.round(centerY - (vec.y - this.currentCameraY) * this.SCALE * this.currentZoom + cameraHeight * 0.2)
    });

    // Render each body in the world
    for (let body = world.getBodyList(); body; body = body.getNext()) {
      // Skip bodies that are too far away from the camera view if distance filter is set
      if (distanceFilter !== undefined) {
        const bodyPos = body.getPosition();
        const distanceFromCar = Math.abs(bodyPos.x - carWorldPos.x);
        if (distanceFromCar > distanceFilter) {
          continue;
        }
      }
      
      // Different color for static vs. dynamic bodies
      if (body.getType() === 'static') {
        this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
      } else {
        this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0x00ff00, 1);
      }
      
      this.renderBody(body, worldToScreen, car);
    }
  }
  
  /**
   * Renders a single physics body
   * @param body - The physics body to render
   * @param worldToScreen - Function to convert world coordinates to screen coordinates
   * @param car - The player's car (used to identify wheels)
   */
  private renderBody(
    body: Body, 
    worldToScreen: (vec: Vec2) => { x: number, y: number },
    car: Car
  ): void {
    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      const shape = fixture.getShape();
      const type = shape.getType();

      if (type === 'polygon') {
        this.renderPolygon(body, shape as PolygonShape, worldToScreen);
      } else if (type === 'circle') {
        this.renderCircle(body, shape as CircleShape, worldToScreen, car);
      } else if (type === 'edge') {
        this.renderEdge(body, shape as EdgeShape, worldToScreen);
      }
    }
  }
  
  /**
   * Renders a polygon shape
   * @param body - The body the polygon belongs to
   * @param shape - The polygon shape to render
   * @param worldToScreen - Function to convert world coordinates to screen coordinates
   */
  private renderPolygon(
    body: Body, 
    shape: PolygonShape, 
    worldToScreen: (vec: Vec2) => { x: number, y: number }
  ): void {
    const vertices = shape.m_vertices;
    const screenVertices = vertices.map(v => {
      const worldPoint = body.getWorldPoint(v);
      return worldToScreen(worldPoint);
    });

    // Fill with semi-transparent white for better visibility
    this.graphics.fillStyle(0xffffff, 0.07);
    
    this.graphics.beginPath();
    this.graphics.moveTo(screenVertices[0].x, screenVertices[0].y);
    for (let i = 1; i < screenVertices.length; i++) {
      this.graphics.lineTo(screenVertices[i].x, screenVertices[i].y);
    }
    this.graphics.closePath();
    this.graphics.fillPath();
    this.graphics.strokePath();
  }
  
  /**
   * Renders a circle shape
   * @param body - The body the circle belongs to
   * @param shape - The circle shape to render
   * @param worldToScreen - Function to convert world coordinates to screen coordinates
   * @param car - The player's car (used to identify wheels)
   */
  private renderCircle(
    body: Body, 
    shape: CircleShape, 
    worldToScreen: (vec: Vec2) => { x: number, y: number },
    car: Car
  ): void {
    const center = body.getWorldPoint(shape.m_p);
    const radius = shape.getRadius();
    const screenCenter = worldToScreen(center);
    
    // Fill with semi-transparent white for better visibility
    this.graphics.fillStyle(0xffffff, 0.07);
    
    // Apply zoom factor to the circle radius
    const scaledRadius = radius * this.SCALE * this.currentZoom;
    
    // Draw filled circle with stroke for better visibility
    this.graphics.fillCircle(screenCenter.x, screenCenter.y, scaledRadius);
    this.graphics.strokeCircle(screenCenter.x, screenCenter.y, scaledRadius);
    
    // Draw a line to show rotation for wheels
    if (body === car.getFrontWheel() || body === car.getBackWheel()) {
      const angle = body.getAngle();
      const lineEndX = screenCenter.x + Math.cos(angle) * scaledRadius;
      const lineEndY = screenCenter.y + Math.sin(angle) * scaledRadius;
      
      this.graphics.beginPath();
      this.graphics.moveTo(screenCenter.x, screenCenter.y);
      this.graphics.lineTo(lineEndX, lineEndY);
      this.graphics.strokePath();
      
      // Reset line style
      if (body.getType() === 'static') {
        this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
      }
    }
  }
  
  /**
   * Renders an edge shape
   * @param body - The body the edge belongs to
   * @param shape - The edge shape to render
   * @param worldToScreen - Function to convert world coordinates to screen coordinates
   */
  private renderEdge(
    body: Body, 
    shape: EdgeShape, 
    worldToScreen: (vec: Vec2) => { x: number, y: number }
  ): void {
    const v1 = body.getWorldPoint(shape.m_vertex1);
    const v2 = body.getWorldPoint(shape.m_vertex2);
    const p1 = worldToScreen(v1);
    const p2 = worldToScreen(v2);
    
    // Use slightly thicker lines for terrain edges for better visibility
    if (body.getType() === 'static') {
      this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
    }
    
    this.graphics.beginPath();
    this.graphics.moveTo(p1.x, p1.y);
    this.graphics.lineTo(p2.x, p2.y);
    this.graphics.strokePath();
    
    // Reset line style
    if (body.getType() === 'static') {
      this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
    }
  }
  
  /**
   * Calculates the target zoom level based on car speed
   * @param speed - Current car speed
   * @param minZoom - Minimum zoom level (maximum zoom out)
   * @param maxZoom - Maximum zoom level (maximum zoom in)
   * @param maxSpeed - Speed reference for zoom calculation
   * @returns Target zoom level
   */
  public calculateTargetZoom(
    speed: number,
    minZoom: number = 0.6,
    maxZoom: number = 1.5,
    maxSpeed: number = 80
  ): number {
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
