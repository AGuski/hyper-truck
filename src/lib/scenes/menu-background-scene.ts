import Phaser from 'phaser';
import { World, Vec2 } from 'planck';
import { Car, DriveMode } from '../entities/car';
import { ProceduralTerrain } from '../entities/procedural-terrain';
import { PhysicsRenderer } from '../rendering/physics-renderer';
import { PhysicsSystem } from '../physics/physics-system';

/**
 * Scene for the main menu background where the car drives automatically.
 * Shows procedurally generated terrain with an auto-driving car at low speed.
 */
export class MenuBackgroundScene extends Phaser.Scene {
  // --- Simulation & Rendering Properties ---
  private world!: World;
  private graphics!: Phaser.GameObjects.Graphics;
  private phRenderer!: PhysicsRenderer;

  // --- Game entities ---
  private car!: Car;
  private terrain!: ProceduralTerrain;
  
  // --- Simulation state variables ---
  private physicsSystem!: PhysicsSystem;
  
  // --- Auto-drive properties ---
  private readonly AUTO_THROTTLE_MIN_SPEED = 27; // Minimum speed in km/h
  private readonly AUTO_THROTTLE_MAX_SPEED = 30; // Maximum speed in km/h
  
  constructor() {
    super({ key: 'MenuBackgroundScene' });
  }

  preload(): void {
    // Load any assets here if needed
  }

  create(): void {
    // --- Set background color ---
    this.cameras.main.setBackgroundColor('#111111');

    // --- Create a Graphics object for drawing the simulation ---
    this.graphics = this.add.graphics({
      lineStyle: {
        width: 1 / (window.devicePixelRatio || 1),
        color: 0xffffff,
        alpha: 1
      },
      fillStyle: {
        color: 0xffffff,
        alpha: 1
      }
    });
    
    // --- Initialize the physics renderer ---
    this.phRenderer = new PhysicsRenderer(this.graphics);

    // --- Initialize Planck.js world ---
    this.world = new World({ gravity: new Vec2(0, -9.8) });
    
    // --- Initialize physics system ---
    this.physicsSystem = new PhysicsSystem();

    // --- Create procedural terrain with fixed seed for consistency ---
    this.terrain = new ProceduralTerrain(this.world, { maxAngle: 10, maxHeightChange: 3, minSegmentLength: 2, featureProbability: 0 });

    // --- Create the car at position (0, 1) ---
    this.car = new Car(this.world, new Vec2(0, 1));
    
    // --- Set drive mode to ALL_WHEEL_DRIVE for better stability ---
    this.car.setDriveMode(DriveMode.ALL_WHEEL_DRIVE);
    
    // --- Start auto-driving by setting a constant throttle ---
    this.startAutoDriving();
  }

  update(time: number, delta: number): void {
    // Convert delta from ms to seconds
    const deltaSeconds = delta / 1000;
    
    // Update the auto-throttle to maintain a constant low speed
    this.updateAutoThrottle(delta);
    
    // Update physics using the physics system
    this.physicsSystem.update(this.world, this.car, deltaSeconds);
    
    // Get car position for terrain updates
    const carPos = this.car.getPosition();

    // --- Update the procedural terrain based on car position ---
    this.terrain.update(carPos.x);
    
    // --- set Fixed Zoom ---
    this.phRenderer.updateZoom(2);

    // --- Render the physics world ---
    this.phRenderer.clear();
    this.phRenderer.renderWorld(
      this.world,
      this.car,
      this.cameras.main.width,
      this.cameras.main.height
    );
    
    // --- Check if car needs to be reset (if it flips over or gets stuck) ---
    this.checkForCarReset(delta);
  }
  
  /**
   * Starts the auto-driving feature by setting a constant throttle
   */
  private startAutoDriving(): void {
    // Simulate throttle start to begin driving
    this.car.onThrottleStart();
    
    // Reset auto-driving state
    this.isThrottling = true;
    this.timeSinceLastThrottleChange = 0;
    this.timeAtLowSpeed = 0;
    this.timeWhileFlipped = 0;
    this.timeWhileFallen = 0;
  }
  
  /**
   * Checks if the car needs to be reset (if it flips over or gets stuck)
   */
  // Track time for various reset conditions
  private timeAtLowSpeed = 0;
  private timeWhileFlipped = 0;
  private timeWhileFallen = 0;
  private readonly RESET_THRESHOLD = 3000; // ms - used for all reset conditions

  private checkForCarReset(deltaTime: number = 0): void {
    const carAngle = this.car.getCarBody().getAngle();
    const carSpeed = this.car.getForwardSpeed();
    const carPos = this.car.getPosition();
    
    // Check if car is flipped over (angle > 90 degrees or < -90 degrees)
    const carFlipped = Math.abs(carAngle) > Math.PI / 2;
    
    // Check if car falls below terrain
    // Get the approximate terrain height at the car's position
    const terrainHeight = this.terrain.getHeightAt(carPos.x);
    // Car is considered fallen if it's significantly below the terrain
    const carFallen = carPos.y < terrainHeight - 10;
    
    // Check if car has very low speed
    const carStopped = Math.abs(carSpeed) < 0.5;
    
    // Track time for each condition
    if (carFlipped) {
      this.timeWhileFlipped += deltaTime;
    } else {
      this.timeWhileFlipped = 0;
    }
    
    if (carFallen) {
      this.timeWhileFallen += deltaTime;
    } else {
      this.timeWhileFallen = 0;
    }
    
    if (carStopped) {
      this.timeAtLowSpeed += deltaTime;
    } else {
      this.timeAtLowSpeed = 0;
    }
    
    // Check if any condition has persisted long enough to trigger a reset
    const isFlipped = this.timeWhileFlipped > this.RESET_THRESHOLD;
    const isFallen = this.timeWhileFallen > this.RESET_THRESHOLD;
    const isStuck = this.timeAtLowSpeed > this.RESET_THRESHOLD;
    
    if (isFlipped || isFallen || isStuck) {

      console.log('Reset due to:');
      if (isFlipped) console.log('Flipped - time:', this.timeWhileFlipped);
      if (isFallen) console.log('Fallen - time:', this.timeWhileFallen);
      if (isStuck) console.log('Stuck - time:', this.timeAtLowSpeed);


      // Reset car to a position ahead of the current position
      // For menu background, we want to reset further ahead to avoid seeing the reset
      // Calculate reset position
      const resetX = carPos.x + 20;
      // Get the terrain height at the reset position and place the car slightly above it
      const terrainHeight = this.terrain.getHeightAt(resetX);
      const resetY = terrainHeight + 1.5; // Place car 1.5 units above terrain
      
      this.car.resetPosition(new Vec2(resetX, resetY));
      
      // Reset all timers
      this.timeAtLowSpeed = 0;
      this.timeWhileFlipped = 0;
      this.timeWhileFallen = 0;
      this.timeSinceLastThrottleChange = 0;
      this.isThrottling = true;
      
      // Restart auto-driving
      this.startAutoDriving();
    }
  }
  
  // Track time since last throttle change to prevent rapid toggling
  private timeSinceLastThrottleChange = 0;
  private isThrottling = true;
  private readonly THROTTLE_CHANGE_COOLDOWN = 500; // ms

  /**
   * Updates the car's throttle to maintain a constant low speed
   * Called during the scene update cycle
   */
  private updateAutoThrottle(deltaTime: number): void {
    // Update throttle change timer
    this.timeSinceLastThrottleChange += deltaTime;
    
    // Get current speed in km/h
    const speedKmh = this.car.getForwardSpeed() * 3.6;
    
    // Only change throttle state if cooldown has elapsed
    if (this.timeSinceLastThrottleChange >= this.THROTTLE_CHANGE_COOLDOWN) {
      if (this.isThrottling && speedKmh > this.AUTO_THROTTLE_MAX_SPEED) {
        // If we're throttling and speed is too high, stop throttling
        this.car.onThrottleEnd();
        this.isThrottling = false;
        this.timeSinceLastThrottleChange = 0;
      } else if (!this.isThrottling && speedKmh < this.AUTO_THROTTLE_MIN_SPEED) {
        // If we're not throttling and speed is too low, start throttling
        this.car.onThrottleStart();
        this.isThrottling = true;
        this.timeSinceLastThrottleChange = 0;
      }
    }
    
    // Ensure we're always moving forward at the start
    if (speedKmh < 5 && this.timeSinceLastThrottleChange > 1000) {
      this.car.onThrottleStart();
      this.isThrottling = true;
      this.timeSinceLastThrottleChange = 0;
    }
  }
  
  /**
   * Cleans up resources when the scene is shut down
   */
  shutdown(): void {
    // Clean up resources when the scene is shut down
  }
}
