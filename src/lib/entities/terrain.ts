import { World, Vec2, Edge, Box, RevoluteJoint } from 'planck';
import type { Body } from 'planck';

/**
 * Represents the terrain in the game, including ground, obstacles, and special elements.
 */
export class Terrain {
  /** The main ground body */
  private ground: Body;
  /** Position of the end wall */
  private endWallPosition: number;

  /**
   * Creates a new terrain in the given physics world.
   * @param world - The physics world to create the terrain in
   */
  constructor(private world: World) {
    this.ground = this.world.createBody();
    this.endWallPosition = this.createTerrain();
  }

  /**
   * Creates the terrain elements including ground, teeter, bridge, and boxes.
   * @returns The x-position of the end wall
   */
  private createTerrain(): number {
    const groundFD = { density: 0.0, friction: 0.6 };

    // Initial flat ground
    this.ground.createFixture(new Edge(new Vec2(-20, 0), new Vec2(20, 0)), groundFD);

    // Hills
    const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];
    let x = 20;
    let y = 0;
    const dx = 5;
    
    // First set of hills
    for (let i = 0; i < 10; ++i) {
      const y2 = hs[i];
      this.ground.createFixture(new Edge(new Vec2(x, y), new Vec2(x + dx, y2)), groundFD);
      y = y2;
      x += dx;
    }
    
    // Second set of hills
    for (let i = 0; i < 10; ++i) {
      const y2 = hs[i];
      this.ground.createFixture(new Edge(new Vec2(x, y), new Vec2(x + dx, y2)), groundFD);
      y = y2;
      x += dx;
    }
    
    // Flat sections and ramps
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 40, 0)), groundFD);
    x += 80;
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 40, 0)), groundFD);
    x += 40;
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 10, 5)), groundFD);
    x += 20;
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 40, 0)), groundFD);
    x += 40;
    
    // Flat stretch for high speed
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 120, 0)), groundFD);
    x += 120;
    
    // Small ramp
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 15, 3)), groundFD);
    x += 15;
    this.ground.createFixture(new Edge(new Vec2(x, 3), new Vec2(x + 15, 0)), groundFD);
    x += 15;
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 60, 0)), groundFD);
    x += 60;
    
    // Another flat stretch
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 120, 0)), groundFD);
    x += 120;
    
    // Small ramp
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 15, 3)), groundFD);
    x += 15;
    this.ground.createFixture(new Edge(new Vec2(x, 3), new Vec2(x + 15, 0)), groundFD);
    x += 15;
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x + 60, 0)), groundFD);
    x += 60;
    
    // End wall
    this.ground.createFixture(new Edge(new Vec2(x, 0), new Vec2(x, 20)), groundFD);

    // Create special terrain elements
    this.createTeeter();
    this.createBridge();
    this.createBoxes();

    return x;
  }

  /**
   * Creates a teeter-totter element in the terrain.
   */
  private createTeeter(): void {
    const teeter = this.world.createDynamicBody(new Vec2(140, 1));
    teeter.createFixture(new Box(10, 0.25), 1.0);
    this.world.createJoint(new RevoluteJoint({
      lowerAngle: -8 * Math.PI / 180,
      upperAngle: 8 * Math.PI / 180,
      enableLimit: true
    }, this.ground, teeter, teeter.getPosition()));
    teeter.applyAngularImpulse(100, true);
  }

  /**
   * Creates a bridge element in the terrain.
   */
  private createBridge(): void {
    const bridgeFD = { density: 150.0, friction: 0.6 };
    let prevBody = this.ground;
    
    for (let i = 0; i < 20; ++i) {
      const bridgeBlock = this.world.createDynamicBody(new Vec2(161 + 2 * i, -0.125));
      bridgeBlock.createFixture(new Box(1.0, 0.125), bridgeFD);
      this.world.createJoint(new RevoluteJoint({}, prevBody, bridgeBlock, new Vec2(160 + 2 * i, -0.125)));
      prevBody = bridgeBlock;
    }
    
    this.world.createJoint(new RevoluteJoint({}, prevBody, this.ground, new Vec2(160 + 2 * 20, -0.125)));
  }

  /**
   * Creates box obstacles in the terrain.
   */
  private createBoxes(): void {
    const box = new Box(0.5, 0.5);
    const boxFD = { density: 0.8, friction: 0.4, restitution: 0.7 };
    
    // Vertical stack
    this.world.createDynamicBody(new Vec2(230, 0.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 1.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 2.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 3.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 4.5)).createFixture(box, boxFD);

    // Scattered boxes
    const scatterX = 480;
    for (let i = 0; i < 20; i++) {
      const xPos = scatterX + Math.random() * 40;
      const yPos = 0.5 + Math.random() * 3;
      this.world.createDynamicBody(new Vec2(xPos, yPos)).createFixture(box, boxFD);
    }
  }

  /**
   * Gets the position of the end wall.
   * @returns The x-coordinate of the end wall
   */
  getEndWallPosition(): number {
    return this.endWallPosition;
  }
}
