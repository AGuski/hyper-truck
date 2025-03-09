import { World } from 'planck';
import { Car } from '../entities/car';

/**
 * PhysicsSystem handles the fixed-rate physics updates for the game.
 * It encapsulates the physics update logic that was previously duplicated
 * across different scene classes.
 * 
 * This implementation follows Planck.js best practices for fixed timestep simulation
 * with a proper accumulator pattern to ensure consistent physics regardless of frame rate.
 */
export class PhysicsSystem {
  private readonly dt: number;
  private readonly velocityIterations: number = 6;
  private readonly positionIterations: number = 2;
  private readonly maxSteps: number = 5; // Safety limit to prevent spiral of death
  private accumulator: number = 0;
  private readonly gameSpeedMultiplier: number;

  /**
   * Creates a new PhysicsSystem with a fixed timestep.
   * @param dt - The fixed timestep duration in seconds (default: 1/60 for 60Hz physics)
   * @param gameSpeedMultiplier - Multiplier to adjust game speed (default: 2.0 to match original game speed)
   * @param velocityIterations - Number of velocity constraint solver iterations (default: 6)
   * @param positionIterations - Number of position constraint solver iterations (default: 2)
   */
  constructor(
    dt: number = 1 / 60, 
    gameSpeedMultiplier: number = 2.0,
    velocityIterations: number = 6,
    positionIterations: number = 2
  ) {
    this.dt = dt;
    this.gameSpeedMultiplier = gameSpeedMultiplier;
    this.velocityIterations = velocityIterations;
    this.positionIterations = positionIterations;
  }

  /**
   * Updates the physics world with a fixed timestep.
   * Uses a time accumulator to ensure consistent physics regardless of frame rate.
   * 
   * @param world - The physics world to update
   * @param car - The car entity to update
   * @param deltaTime - The time elapsed since the last frame in seconds
   * @returns The number of physics steps performed
   */
  public update(world: World, car: Car, deltaTime: number): number {
    // Apply game speed multiplier to simulate at the desired speed
    // This maintains the original game feel while using proper time accumulation
    this.accumulator += deltaTime * this.gameSpeedMultiplier;
    
    // Safety check: if accumulator gets too large (e.g., during debugging or severe lag),
    // cap it to prevent the "spiral of death"
    if (this.accumulator > this.dt * this.maxSteps) {
      console.warn(`Physics accumulator exceeded safety limit (${this.accumulator.toFixed(4)}s). Capping to prevent spiral of death.`);
      this.accumulator = this.dt * this.maxSteps;
    }
    
    // Track how many steps we perform
    let steps = 0;
    
    // Perform fixed timestep updates until we've consumed the accumulated time
    while (this.accumulator >= this.dt && steps < this.maxSteps) {
      // Update car physics
      car.update(this.dt);
      
      // Step the physics world with proper iteration counts as per Planck.js recommendations
      world.step(this.dt, this.velocityIterations, this.positionIterations);
      
      // Decrease the accumulator by the timestep
      this.accumulator -= this.dt;
      steps++;
    }
    
    // Clear forces after all steps are complete
    // This is recommended by Planck.js to prevent force accumulation
    world.clearForces();
    
    return steps;
  }
  
  /**
   * Gets the fixed timestep duration.
   * @returns The fixed timestep in seconds
   */
  public getTimestep(): number {
    return this.dt;
  }
  
  /**
   * Gets the current game speed multiplier.
   * @returns The game speed multiplier
   */
  public getGameSpeedMultiplier(): number {
    return this.gameSpeedMultiplier;
  }
  
  /**
   * Gets the velocity iterations used for constraint solving.
   * @returns The number of velocity iterations
   */
  public getVelocityIterations(): number {
    return this.velocityIterations;
  }
  
  /**
   * Gets the position iterations used for constraint solving.
   * @returns The number of position iterations
   */
  public getPositionIterations(): number {
    return this.positionIterations;
  }
  
  /**
   * Resets the accumulator to zero.
   * Useful when transitioning between scenes or resetting the game state.
   */
  public resetAccumulator(): void {
    this.accumulator = 0;
  }
}
