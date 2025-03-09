import { World, Vec2, Edge, Box, RevoluteJoint } from 'planck';
import type { Body } from 'planck';

/**
 * Represents procedurally generated terrain that creates new segments as the player advances.
 */
export class ProceduralTerrain {
  /** The main ground body */
  private ground: Body;
  
  /** The last generated x position */
  private lastX = 0;
  
  /** The last generated y position */
  private lastY = 0;
  
  /** The current terrain seed - used for reproducible randomness */
  private seed: number;
  
  /** The initial seed value - stored for reset operations */
  private readonly initialSeed: number;
  
  /** Terrain chunks that have been generated */
  private chunks: { startX: number; endX: number }[] = [];
  
  /** The maximum angle (in degrees) for terrain generation */
  private readonly MAX_ANGLE = 20;
  
  /** The minimum segment length */
  private readonly MIN_SEGMENT_LENGTH = 5;
  
  /** The maximum segment length */
  private readonly MAX_SEGMENT_LENGTH = 20;
  
  /** The maximum height change between segments */
  private readonly MAX_HEIGHT_CHANGE = 3;
  
  /** The view distance ahead of the player where terrain should exist */
  private readonly GENERATION_DISTANCE = 300;
  
  /** The distance behind the player where terrain can be removed */
  private readonly CLEANUP_DISTANCE = 100;
  
  /** The friction of the ground */
  private readonly GROUND_FRICTION = 0.6;
  
  /** Probability of generating a special feature (0-1) */
  private readonly FEATURE_PROBABILITY = 0.1;
  
  /**
   * Creates a new procedural terrain in the given physics world.
   * @param world - The physics world to create the terrain in
   * @param seed - Optional seed for terrain generation. If not provided, a random seed will be used.
   */
  constructor(private world: World, seed?: number) {
    // Initialize with provided seed or generate a random one
    this.initialSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000);
    this.seed = this.initialSeed;
    
    this.ground = this.world.createBody();
    
    // Create initial flat ground
    this.createInitialTerrain();
  }
  
  /**
   * Gets the current seed used for terrain generation.
   * @returns The current terrain generation seed
   */
  public getSeed(): number {
    return this.initialSeed;
  }
  
  /**
   * Resets the terrain with the current or a new seed.
   * This removes all existing terrain and generates new terrain.
   * @param seed - Optional new seed to use. If not provided, the initial seed will be used.
   */
  public reset(seed?: number): void {
    // Update seed if provided, otherwise use the initial seed
    this.seed = seed !== undefined ? seed : this.initialSeed;
    
    // Remove all fixtures from the ground body
    let fixture = this.ground.getFixtureList();
    while (fixture) {
      const next = fixture.getNext();
      this.ground.destroyFixture(fixture);
      fixture = next;
    }
    
    // Reset position tracking
    this.lastX = 0;
    this.lastY = 0;
    this.chunks = [];
    
    // Recreate initial terrain
    this.createInitialTerrain();
  }
  
  /**
   * Creates the initial flat terrain for the player to start on.
   */
  private createInitialTerrain(): void {
    const groundFD = { density: 0.0, friction: this.GROUND_FRICTION };
    
    // Initial flat ground (-20 to 50)
    this.ground.createFixture(new Edge(new Vec2(-20, 0), new Vec2(50, 0)), groundFD);
    
    this.lastX = 50;
    this.lastY = 0;
    
    // Add first chunk to the list
    this.chunks.push({ startX: -20, endX: 50 });
    
    // Generate some terrain ahead
    this.generateTerrain(200);
  }
  
  /**
   * Generates terrain up to the specified distance from the current position.
   * @param distance - How far ahead to generate terrain
   */
  private generateTerrain(distance: number): void {
    const groundFD = { density: 0.0, friction: this.GROUND_FRICTION };
    
    // Generate terrain segments until we reach the desired distance
    while (this.lastX < distance) {
      // Use a seeded random function for reproducible terrain
      const segmentLength = this.seededRandom(this.MIN_SEGMENT_LENGTH, this.MAX_SEGMENT_LENGTH);
      
      // Calculate a height change that's not too steep
      // We want to limit the angle to make it navigable by the car
      const maxHeightChange = Math.min(
        this.MAX_HEIGHT_CHANGE,
        Math.tan((this.MAX_ANGLE * Math.PI) / 180) * segmentLength
      );
      
      // Generate a new height using seeded random
      // We use a bias to tend toward zero to avoid going too high or too low
      const heightBias = -this.lastY * 0.1; // Bias toward y=0
      const heightChange = this.seededRandom(-maxHeightChange, maxHeightChange) + heightBias;
      
      const newY = this.lastY + heightChange;
      
      // Create the new segment
      this.ground.createFixture(
        new Edge(new Vec2(this.lastX, this.lastY), new Vec2(this.lastX + segmentLength, newY)),
        groundFD
      );
      
      // Update the last position
      this.lastX += segmentLength;
      this.lastY = newY;
      
      // Add this segment to our chunks list
      this.chunks.push({ startX: this.lastX - segmentLength, endX: this.lastX });
      
      // Occasionally add a special feature
      if (this.seededRandom(0, 1) < this.FEATURE_PROBABILITY) {
        this.addRandomFeature(this.lastX, this.lastY);
      }
    }
  }
  
  /**
   * Adds a random terrain feature at the specified position.
   * @param x - The x position for the feature
   * @param y - The y position for the feature
   */
  private addRandomFeature(x: number, y: number): void {
    const featureType = Math.floor(this.seededRandom(0, 2));
    
    switch (featureType) {
      case 0:
        // Small ramp
        this.addRamp(x, y);
        break;
      case 1:
        // Boxes
        this.addBoxes(x, y);
        break;
      // case 2:
      //   // Teeter-totter
      //   this.addTeeter(x, y);
      //   break;
    }
  }
  
  /**
   * Adds a ramp feature at the specified position.
   * @param x - The x position for the ramp
   * @param y - The y position for the ramp
   */
  private addRamp(x: number, y: number): void {
    const groundFD = { density: 0.0, friction: this.GROUND_FRICTION };
    const rampHeight = this.seededRandom(1, 3);
    const rampLength = rampHeight * 5; // Ensure a reasonable slope
    
    // Create the up-ramp
    this.ground.createFixture(
      new Edge(new Vec2(x, y), new Vec2(x + rampLength, y + rampHeight)),
      groundFD
    );
    
    // Create the down-ramp
    this.ground.createFixture(
      new Edge(new Vec2(x + rampLength, y + rampHeight), new Vec2(x + rampLength * 2, y)),
      groundFD
    );
    
    // Update the last position
    this.lastX = x + rampLength * 2;
    this.lastY = y;
    
    // Add this feature to our chunks list
    this.chunks.push({ startX: x, endX: this.lastX });
  }
  
  /**
   * Adds box obstacles at the specified position.
   * @param x - The x position for the boxes
   * @param y - The y position for the boxes
   */
  private addBoxes(x: number, y: number): void {
    const box = new Box(0.5, 0.5);
    const boxFD = { density: 0.8, friction: 0.4, restitution: 0.7 };
    
    // Add a flat section for the boxes
    const groundFD = { density: 0.0, friction: this.GROUND_FRICTION };
    const platformLength = 15;
    
    this.ground.createFixture(
      new Edge(new Vec2(x, y), new Vec2(x + platformLength, y)),
      groundFD
    );
    
    // Add some boxes
    const numBoxes = Math.floor(this.seededRandom(3, 8));
    
    for (let i = 0; i < numBoxes; i++) {
      const boxX = x + this.seededRandom(2, platformLength - 2);
      const boxY = y + 0.5 + this.seededRandom(0, 2);
      this.world.createDynamicBody(new Vec2(boxX, boxY)).createFixture(box, boxFD);
    }
    
    // Update the last position
    this.lastX = x + platformLength;
    this.lastY = y;
    
    // Add this feature to our chunks list
    this.chunks.push({ startX: x, endX: this.lastX });
  }
  
  /**
   * Adds a teeter-totter at the specified position.
   * @param x - The x position for the teeter
   * @param y - The y position for the teeter
   */
  private addTeeter(x: number, y: number): void {
    // Add a flat section for the teeter
    const groundFD = { density: 0.0, friction: this.GROUND_FRICTION };
    const platformLength = 25;
    
    this.ground.createFixture(
      new Edge(new Vec2(x, y), new Vec2(x + platformLength, y)),
      groundFD
    );
    
    // Create the teeter in the middle of the platform
    const teeterX = x + platformLength / 2;
    const teeter = this.world.createDynamicBody(new Vec2(teeterX, y + 1));
    teeter.createFixture(new Box(5, 0.25), 1.0);
    
    this.world.createJoint(new RevoluteJoint({
      lowerAngle: -8 * Math.PI / 180,
      upperAngle: 8 * Math.PI / 180,
      enableLimit: true
    }, this.ground, teeter, teeter.getPosition()));
    
    // Give it a little initial impulse
    teeter.applyAngularImpulse(this.seededRandom(-100, 100), true);
    
    // Update the last position
    this.lastX = x + platformLength;
    this.lastY = y;
    
    // Add this feature to our chunks list
    this.chunks.push({ startX: x, endX: this.lastX });
  }
  
  /**
   * Updates the terrain based on the player's position.
   * Generates new terrain ahead and removes old terrain behind.
   * @param playerX - The player's x position
   */
  public update(playerX: number): void {
    // Generate more terrain if needed
    if (this.lastX < playerX + this.GENERATION_DISTANCE) {
      this.generateTerrain(playerX + this.GENERATION_DISTANCE);
    }
    
    // Clean up old terrain chunks that are far behind the player
    this.cleanupOldTerrain(playerX);
  }
  
  /**
   * Removes terrain chunks that are far behind the player.
   * @param playerX - The player's x position
   */
  private cleanupOldTerrain(playerX: number): void {
    // In a real implementation, we would remove fixtures from the ground body
    // For simplicity in this example, we'll just track which chunks are active
    // but won't actually remove them to avoid complexity with the physics engine
    
    // Mark chunks as inactive if they're far behind the player
    const cleanupX = playerX - this.CLEANUP_DISTANCE;
    
    // Filter out chunks that are completely behind the cleanup threshold
    this.chunks = this.chunks.filter(chunk => chunk.endX >= cleanupX);
  }
  
  /**
   * A seeded random function to ensure reproducible terrain generation.
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (exclusive)
   * @returns A random number between min and max
   */
  private seededRandom(min: number, max: number): number {
    // Simple seeded random function
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const rnd = this.seed / 233280;
    
    return min + rnd * (max - min);
  }
}
