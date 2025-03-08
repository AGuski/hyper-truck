import Phaser from 'phaser';
import { World, Vec2 } from 'planck';
import { Car, DriveMode } from '../entities/car';
import { Terrain } from '../entities/terrain';
import { PhysicsRenderer } from '../rendering/physics-renderer';
import { InputController, InputEvent } from '../input/input-controller';

export class TruckScene extends Phaser.Scene {
  // --- Simulation & Rendering Properties ---
  private world!: World;
  private graphics!: Phaser.GameObjects.Graphics;
  private phRenderer!: PhysicsRenderer;
  private overlayText!: Phaser.GameObjects.Text;

  // --- Game entities ---
  private car!: Car;
  private terrain!: Terrain;
  private inputController!: InputController;
  
  // --- Simulation state variables ---
  private timerStarted = false;
  private timerValue: number | null = null;
  private startTime = 0;
  private endWallHit = false;
  private endWallPosition = 0;   // x position of the end wall

  private readonly dt = 1 / 50; // Simulation timestep (50 Hz)
  

  constructor() {
    super({ key: 'TruckScene' });
  }

  preload(): void {
    // Load any assets here if needed
  }

  create(): void {
    // --- Set background color ---
    this.cameras.main.setBackgroundColor('#111111');
    
    // --- Configure camera for high-DPI displays ---
    this.cameras.main.setRoundPixels(true);

    // --- Create overlay text (to display throttle, speed, nitro, timer) ---
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

    // --- Create terrain ---
    this.terrain = new Terrain(this.world);

    // === CAR SETUP ===
    // Create the car at position (0, 1)
    this.car = new Car(this.world, new Vec2(0, 1));

    // --- TIMER VARIABLES ---
    this.timerStarted = false;
    this.timerValue = null;
    this.endWallHit = false;
    this.endWallPosition = this.terrain.getEndWallPosition();

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
  }

  update(): void {
    // --- Use a fixed timestep ---
    const dt = this.dt;
    
    // Update car physics
    this.car.update(dt);
    
    // Get car position and speed for other game logic
    const carPos = this.car.getPosition();
    const forwardSpeed = this.car.getForwardSpeed();

    // --- Timer logic ---
    if (!this.timerStarted && Math.abs(forwardSpeed) > 0.1) {
      this.timerStarted = true;
      this.startTime = performance.now() / 1000;
      this.timerValue = 0;
    }
    if (this.timerStarted && !this.endWallHit) {
      this.timerValue = performance.now() / 1000 - this.startTime;
      if (carPos.x >= this.endWallPosition - 2) {
        this.endWallHit = true;
      }
    }

    // --- Step the physics world ---
    this.world.step(dt);

    // --- Update overlay text ---
    const displayThrottle = this.car.isBraking() ? this.car.getReverseThrottle() * -1 : this.car.getThrottle();
    const throttlePercentage = Math.round(displayThrottle * 100);
    const speedFormatted = forwardSpeed.toFixed(2);
    const nitroStatus = this.car.isNitroActive() ? 'Active' : 'Inactive';
    let timerStr = 'Not started';
    if (this.timerValue !== null) {
      const minutes = Math.floor(this.timerValue / 60);
      const seconds = Math.floor(this.timerValue % 60);
      const milliseconds = Math.floor((this.timerValue % 1) * 1000);
      timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    this.overlayText.setText(
      `Throttle: ${throttlePercentage}%\nSpeed: ${speedFormatted} m/s\nNitro: ${nitroStatus}\nTime: ${timerStr}`
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
    this.currentDriveMode = mode;
    this.car.setDriveMode(mode);
    
    // Update UI to show current drive mode
    const driveModeText = {
      [DriveMode.FRONT_WHEEL_DRIVE]: 'FRONT-WHEEL DRIVE',
      [DriveMode.REAR_WHEEL_DRIVE]: 'REAR-WHEEL DRIVE',
      [DriveMode.ALL_WHEEL_DRIVE]: 'ALL-WHEEL DRIVE'
    }[mode];
    
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
   * Cleans up resources when the scene is shut down
   */
  shutdown(): void {
    // Clean up resources when the scene is shut down
    this.inputController.destroy();
  }
}
