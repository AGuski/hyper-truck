import Phaser from 'phaser';
import { World, Vec2 } from 'planck';
import { Car, DriveMode } from '../entities/car';
import { ProceduralTerrain } from '../entities/procedural-terrain';
import { PhysicsRenderer } from '../rendering/physics-renderer';
import { InputController, InputEvent } from '../input/input-controller';
import { PhysicsSystem } from '../physics/physics-system';

/**
 * Scene for the infinite mode where terrain is procedurally generated as the player drives.
 */
export class InfiniteModeScene extends Phaser.Scene {
  // --- Simulation & Rendering Properties ---
  private world!: World;
  private graphics!: Phaser.GameObjects.Graphics;
  private phRenderer!: PhysicsRenderer;
  private overlayText!: Phaser.GameObjects.Text;

  // --- Game entities ---
  private car!: Car;
  private terrain!: ProceduralTerrain;
  private inputController!: InputController;
  
  // --- Simulation state variables ---
  private distanceTraveled = 0;
  private startPosition = new Vec2(0, 0);
  private gameStarted = false;

  private physicsSystem!: PhysicsSystem;
  
  constructor() {
    super({ key: 'InfiniteModeScene' });
  }

  preload(): void {
    // Load any assets here if needed
  }

  create(): void {
    // --- Set background color ---
    this.cameras.main.setBackgroundColor('#111111');
    
    // --- Configure camera for high-DPI displays ---
    this.cameras.main.setRoundPixels(true);

    // --- Create overlay text (to display throttle, speed, nitro, distance) ---
    this.overlayText = this.add.text(10, 10, '', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      resolution: window.devicePixelRatio || 1
    });
    this.overlayText.setResolution(window.devicePixelRatio || 1);

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

    // --- Create procedural terrain ---
    this.terrain = new ProceduralTerrain(this.world);

    // === CAR SETUP ===
    // Create the car at position (0, 1)
    this.car = new Car(this.world, new Vec2(0, 1));
    this.startPosition = this.car.getPosition().clone();

    // --- Initialize the input controller ---
    this.inputController = new InputController(this);
    
    // --- Connect input events to car controls ---
    this.inputController.on(InputEvent.THROTTLE_START, () => this.car.onThrottleStart());
    this.inputController.on(InputEvent.THROTTLE_END, () => this.car.onThrottleEnd());
    this.inputController.on(InputEvent.BRAKE_START, () => this.car.onBrakeStart());
    this.inputController.on(InputEvent.BRAKE_END, () => this.car.onBrakeEnd());
    this.inputController.on(InputEvent.NITRO_START, () => this.car.onNitroStart());
    this.inputController.on(InputEvent.NITRO_END, () => this.car.onNitroEnd());
    
    // Drive mode switching
    this.inputController.on(InputEvent.TOGGLE_FRONT_WHEEL_DRIVE, () => this.setDriveMode(DriveMode.FRONT_WHEEL_DRIVE));
    this.inputController.on(InputEvent.TOGGLE_REAR_WHEEL_DRIVE, () => this.setDriveMode(DriveMode.REAR_WHEEL_DRIVE));
    this.inputController.on(InputEvent.TOGGLE_ALL_WHEEL_DRIVE, () => this.setDriveMode(DriveMode.ALL_WHEEL_DRIVE));
    
    // Show initial instructions
    this.showInstructions();
  }

  update(time: number, delta: number): void {
    // Convert delta from ms to seconds
    const deltaSeconds = delta / 1000;
    
    // Update physics using the physics system
    this.physicsSystem.update(this.world, this.car, deltaSeconds);
    
    // Get car position and speed for other game logic
    const carPos = this.car.getPosition();
    const forwardSpeed = this.car.getForwardSpeed();

    // --- Game start logic ---
    if (!this.gameStarted && Math.abs(forwardSpeed) > 0.1) {
      this.gameStarted = true;
      this.startPosition = carPos.clone();
    }

    // --- Update the procedural terrain based on car position ---
    this.terrain.update(carPos.x);
    
    // --- Calculate distance traveled ---
    if (this.gameStarted) {
      this.distanceTraveled = carPos.x - this.startPosition.x;
    }

    // --- Update overlay text ---
    const displayThrottle = this.car.isBraking() ? this.car.getReverseThrottle() * -1 : this.car.getThrottle();
    const throttlePercentage = Math.round(displayThrottle * 100);
    
    // Convert speed from m/s to km/h (multiply by 3.6)
    // Use Math.abs for very small values to prevent -0.0 display
    const speedKmh = Math.abs(forwardSpeed) < 0.05 ? 0 : forwardSpeed * 3.6;
    const speedFormatted = speedKmh.toFixed(1);
    
    const nitroStatus = this.car.isNitroActive() ? 'Active' : 'Inactive';
    const distanceFormatted = this.distanceTraveled.toFixed(1);
    const driveMode = this.getDriveModeText(this.car.getDriveMode());
    
    this.overlayText.setText(
      `Throttle: ${throttlePercentage}%\nSpeed: ${speedFormatted} km/h\nNitro: ${nitroStatus}\nDistance: ${distanceFormatted} m\nDrive: ${driveMode}`
    );
    
    // --- Update camera zoom based on speed ---
    // Calculate target zoom using the renderer
    const targetZoom = this.phRenderer.calculateTargetZoom(forwardSpeed);
    
    // Smoothly update the zoom
    this.phRenderer.updateZoom(targetZoom);

    // --- Render the physics world ---
    this.phRenderer.clear();
    this.phRenderer.renderWorld(
      this.world,
      this.car,
      this.cameras.main.width,
      this.cameras.main.height
    );
  }
  
  /**
   * Sets the drive mode of the car and updates the UI
   * @param mode - The drive mode to set
   */
  private setDriveMode(mode: DriveMode): void {
    this.car.setDriveMode(mode);
    
    // Update UI to show current drive mode
    const driveModeText = this.getDriveModeText(mode);
    
    // Display a temporary message showing the drive mode change
    const text = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 4,
      driveModeText,
      { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff' }
    );
    text.setOrigin(0.5);
    text.setShadow(2, 2, '#000000', 2);
    
    // Make the text fade out after 2 seconds
    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
  }
  
  /**
   * Gets the display text for a drive mode
   * @param mode - The drive mode
   * @returns The display text for the drive mode
   */
  private getDriveModeText(mode: DriveMode): string {
    return {
      [DriveMode.FRONT_WHEEL_DRIVE]: 'FRONT-WHEEL DRIVE',
      [DriveMode.REAR_WHEEL_DRIVE]: 'REAR-WHEEL DRIVE',
      [DriveMode.ALL_WHEEL_DRIVE]: 'ALL-WHEEL DRIVE'
    }[mode];
  }
  
  /**
   * Shows the game instructions at the start
   */
  private showInstructions(): void {
    const instructions = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2.5,
      'INFINITE MODE\n\nDrive as far as you can on procedurally generated terrain.\n\nUse RIGHT ARROW or D to accelerate\nUse LEFT ARROW or A to brake\nUse SHIFT for nitro boost\nPress 1-3 to change drive modes\n\nPress any key to start!',
      { 
        fontFamily: 'Arial', 
        fontSize: '24px', 
        color: '#ffffff',
        align: 'center'
      }
    );
    instructions.setOrigin(0.5);
    instructions.setShadow(2, 2, '#000000', 2);
    
    // Make the instructions fade out when the game starts
    this.events.once('update', () => {
      const checkStart = () => {
        if (this.gameStarted) {
          this.tweens.add({
            targets: instructions,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
              instructions.destroy();
            }
          });
        } else {
          this.events.once('update', checkStart);
        }
      };
      this.events.once('update', checkStart);
    });
  }
  
  /**
   * Cleans up resources when the scene is shut down
   */
  shutdown(): void {
    // Clean up resources when the scene is shut down
    this.inputController.destroy();
  }
}
