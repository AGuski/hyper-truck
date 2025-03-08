import Phaser from 'phaser';
import { World, Vec2, Edge, Box, Circle, Polygon, RevoluteJoint, WheelJoint } from 'planck';
import type { Body, PolygonShape } from 'planck';

export class TruckScene extends Phaser.Scene {
  // --- Simulation & Rendering Properties ---
  private world!: World;
  private graphics!: Phaser.GameObjects.Graphics;
  private overlayText!: Phaser.GameObjects.Text;
  private currentZoom: number = 0.5; // Current camera zoom level

  // --- Key simulation bodies ---
  private car!: Body;
  private wheelFront!: Body;
  private wheelBack!: Body;
  private springFront!: WheelJoint;

  // --- Control & simulation state variables ---
  private throttle = 0.0;        // forward throttle (0 to 1)
  private throttleTarget = 0.0;  // desired forward throttle value
  private reverseThrottle = 0.0; // reverse throttle (0 to 1)
  private braking = false;       // whether brake is pressed
  private nitroActive = false;
  private timerStarted = false;
  private timerValue: number | null = null;
  private startTime = 0;
  private endWallHit = false;
  private endWallPosition = 0;   // x position of the end wall

  // --- Tuning / Constants ---
  private readonly MAX_SPEED = 80;    // Max linear speed (m/s) at full throttle (forward)
  private readonly ENGINE_TORQUE = 4000;   // Engine torque (N·m)
  private readonly CHASSIS_WEIGHT = 900;   // Chassis weight (kg)
  private readonly MOTOR_WEIGHT = 700;    // Motor weight (kg)
  private readonly SUSPENSION_STIFFNESS = 2.5;   // Suspension spring frequency (Hz)
  private readonly SUSPENSION_DAMPING = 0.5;   // Suspension damping ratio (0 to 1)
  private readonly WHEEL_GRIP = 11.0;   // Tire grip (friction coefficient)
  private readonly THROTTLE_INC_RATE = 0.5; // Throttle increase rate (per second)
  private readonly THROTTLE_DEC_RATE = 3.0; // Throttle decrease rate (per second)
  private readonly BRAKE_STRENGTH = 1.0; // Multiplier for braking torque
  private readonly REVERSE_SPEED_FACTOR = 0.5; // Reverse max speed is 50% of forward max speed
  private readonly REVERSE_TORQUE_FACTOR = 0.7; // Reverse engine torque is 70% of forward torque
  private readonly TOTAL_WEIGHT = this.CHASSIS_WEIGHT + this.MOTOR_WEIGHT;

  private readonly dt = 1 / 50; // Simulation timestep (50 Hz)
  private readonly SCALE = 50;  // Pixels per meter
  

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

    // --- Initialize Planck.js world ---
    this.world = new World({ gravity: new Vec2(0, -9.8) });

    // === TERRAIN SETUP (Copied from the original simulation) ===
    const ground = this.world.createBody();
    const groundFD = { density: 0.0, friction: 0.6 };

    ground.createFixture(Edge(new Vec2(-20, 0), new Vec2(20, 0)), groundFD);

    const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];
    let x = 20;
    let y = 0;
    const dx = 5;
    for (let i = 0; i < 10; ++i) {
      const y2 = hs[i];
      ground.createFixture(Edge(new Vec2(x, y), new Vec2(x + dx, y2)), groundFD);
      y = y2;
      x += dx;
    }
    for (let i = 0; i < 10; ++i) {
      const y2 = hs[i];
      ground.createFixture(Edge(new Vec2(x, y), new Vec2(x + dx, y2)), groundFD);
      y = y2;
      x += dx;
    }
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 40, 0)), groundFD);
    x += 80;
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 40, 0)), groundFD);
    x += 40;
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 10, 5)), groundFD);
    x += 20;
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 40, 0)), groundFD);
    x += 40;
    // Flat stretch for high speed
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 120, 0)), groundFD);
    x += 120;
    // Small ramp
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 15, 3)), groundFD);
    x += 15;
    ground.createFixture(Edge(new Vec2(x, 3), new Vec2(x + 15, 0)), groundFD);
    x += 15;
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 60, 0)), groundFD);
    x += 60;
    // Another flat stretch
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 120, 0)), groundFD);
    x += 120;
    // Small ramp
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 15, 3)), groundFD);
    x += 15;
    ground.createFixture(Edge(new Vec2(x, 3), new Vec2(x + 15, 0)), groundFD);
    x += 15;
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 60, 0)), groundFD);
    x += 60;
    // End wall
    ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x, 20)), groundFD);

    // Teeter
    const teeter = this.world.createDynamicBody(new Vec2(140, 1));
    teeter.createFixture(Box(10, 0.25), 1.0);
    this.world.createJoint(new RevoluteJoint({
      lowerAngle: -8 * Math.PI / 180,
      upperAngle: 8 * Math.PI / 180,
      enableLimit: true
    }, ground, teeter, teeter.getPosition()));
    teeter.applyAngularImpulse(100, true);

    // Bridge
    const bridgeFD = { density: 150.0, friction: 0.6 };
    let prevBody = ground;
    for (let i = 0; i < 20; ++i) {
      const bridgeBlock = this.world.createDynamicBody(new Vec2(161 + 2 * i, -0.125));
      bridgeBlock.createFixture(Box(1.0, 0.125), bridgeFD);
      this.world.createJoint(new RevoluteJoint({}, prevBody, bridgeBlock, new Vec2(160 + 2 * i, -0.125)));
      prevBody = bridgeBlock;
    }
    this.world.createJoint(new RevoluteJoint({}, prevBody, ground, new Vec2(160 + 2 * 20, -0.125)));

    // Boxes – a vertical stack and some scattered boxes.
    const box = new Box(0.5, 0.5);
    const boxFD = { density: 0.8, friction: 0.4, restitution: 0.7 };
    this.world.createDynamicBody(new Vec2(230, 0.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 1.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 2.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 3.5)).createFixture(box, boxFD);
    this.world.createDynamicBody(new Vec2(230, 4.5)).createFixture(box, boxFD);

    const scatterX = 480;
    for (let i = 0; i < 20; i++) {
      const xPos = scatterX + Math.random() * 40;
      const yPos = 0.5 + Math.random() * 3;
      this.world.createDynamicBody(new Vec2(xPos, yPos)).createFixture(box, boxFD);
    }

    // === CAR SETUP ===
    this.car = this.world.createDynamicBody(new Vec2(0, 1));
    const carVertices = [
      new Vec2(-1.5, -0.5),
      new Vec2(1.5, -0.5),
      new Vec2(1.5, 0.0),
      new Vec2(0.0, 0.9),
      new Vec2(-1.15, 0.9),
      new Vec2(-1.5, 0.2)
    ];
    // Compute density so that the chassis weighs CHASSIS_WEIGHT.
    const carDensity = this.CHASSIS_WEIGHT / 3.4025;
    this.car.createFixture(new Polygon(carVertices), {
      density: carDensity,
      friction: 0.3,
      restitution: 0.1
    });
    this.car.setLinearDamping(0.2);
    this.car.setAngularDamping(1.0);

    // Engine – a small, heavy box in front of the car.
    const heavyEngineShape = new Box(0.25, 0.25, new Vec2(1.0, 0.0), 0);
    this.car.createFixture(heavyEngineShape, {
      density: this.MOTOR_WEIGHT,
      friction: 0.3
    });

    // --- WHEELS ---
    const wheelRadius = 0.4;
    const wheelFD = { density: 1.0, friction: this.WHEEL_GRIP, restitution: 0.2 };

    // Rear wheel (non-driven)
    this.wheelBack = this.world.createDynamicBody(new Vec2(-1.0, 0.35));
    this.wheelBack.createFixture(Circle(wheelRadius), wheelFD);

    // Front wheel (driven)
    this.wheelFront = this.world.createDynamicBody(new Vec2(1.0, 0.4));
    this.wheelFront.createFixture(Circle(wheelRadius), wheelFD);

    this.wheelBack.setAngularDamping(0.4);
    this.wheelFront.setAngularDamping(0.4);

    // Adjust wheel density so that each wheel is 20% of total weight.
    const targetWheelMass = 0.2 * this.TOTAL_WEIGHT;
    const wheelArea = Math.PI * wheelRadius * wheelRadius;
    const adjustedWheelDensity = targetWheelMass / wheelArea;
    this.wheelBack.getFixtureList()!.setDensity(adjustedWheelDensity);
    this.wheelFront.getFixtureList()!.setDensity(adjustedWheelDensity);
    this.wheelBack.resetMassData();
    this.wheelFront.resetMassData();

    // --- SUSPENSION JOINTS ---
    const suspensionAxis = new Vec2(0, 1);
    // Rear suspension (non-motorized)
    this.world.createJoint(WheelJoint({
      motorSpeed: 0,
      maxMotorTorque: 10.0,
      enableMotor: false,
      frequencyHz: this.SUSPENSION_STIFFNESS,
      dampingRatio: this.SUSPENSION_DAMPING
    }, this.car, this.wheelBack, this.wheelBack.getPosition(), suspensionAxis));

    // Front suspension (motorized)
    this.springFront = this.world.createJoint(new WheelJoint({
      motorSpeed: 0,
      maxMotorTorque: 20.0,
      enableMotor: true,
      frequencyHz: this.SUSPENSION_STIFFNESS,
      dampingRatio: this.SUSPENSION_DAMPING
    }, this.car, this.wheelFront, this.wheelFront.getPosition(), suspensionAxis))!;

    // --- TIMER VARIABLES ---
    this.timerStarted = false;
    this.timerValue = null;
    this.endWallHit = false;
    this.endWallPosition = x; // from terrain

    // --- KEYBOARD EVENTS ---
    this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.throttleTarget = 1.0;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.braking = true;
        this.throttleTarget = 0.0;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.nitroActive = true;
      }
    });
    this.input.keyboard.on('keyup', (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.throttleTarget = 0.0;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.braking = false;
        this.reverseThrottle = 0.0;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.nitroActive = false;
      }
    });
  }

  update(time: number, delta: number): void {
    // --- Use a fixed timestep ---
    const dt = this.dt;

    // --- Update throttle ---
    if (!this.braking) {
      if (this.throttle < this.throttleTarget) {
        this.throttle = Math.min(this.throttle + this.THROTTLE_INC_RATE * dt, this.throttleTarget);
      } else if (this.throttle > this.throttleTarget) {
        this.throttle = Math.max(this.throttle - this.THROTTLE_DEC_RATE * dt, this.throttleTarget);
      }
    } else {
      this.throttle = 0;
    }

    // --- Compute car forward speed ---
    const velocity = this.car.getLinearVelocity();
    const forwardVec = this.car.getWorldVector(new Vec2(1, 0));
    const forwardSpeed = forwardVec.x * velocity.x + forwardVec.y * velocity.y;
    const totalWeightForce = this.TOTAL_WEIGHT * 9.8;

    // --- Motor Control ---
    if (this.throttle > 0 && !this.braking) {
      const nitroMultiplier = this.nitroActive ? 2.0 : 1.0;
      let currentEngineTorque = this.throttle * this.ENGINE_TORQUE * nitroMultiplier;
      const weightFront = 0.8;
      const normalForceFront = totalWeightForce * weightFront;
      const tractionForceLimit = normalForceFront * this.WHEEL_GRIP;
      let driveForce = currentEngineTorque / 0.4; // wheelRadius = 0.4
      if (driveForce > tractionForceLimit) {
        driveForce = tractionForceLimit;
        currentEngineTorque = driveForce * 0.4;
      }
      const targetAngularSpeed = (this.MAX_SPEED * nitroMultiplier) / 0.4;
      // For forward drive, set motor speed negative.
      this.springFront.setMotorSpeed(-targetAngularSpeed * this.throttle);
      this.springFront.setMaxMotorTorque(currentEngineTorque);
      this.springFront.enableMotor(true);
      this.reverseThrottle = 0;
    } else if (this.braking) {
      if (forwardSpeed < 0.5) {
        this.reverseThrottle = Math.min(this.reverseThrottle + this.THROTTLE_INC_RATE * dt, 1.0);
        const reverseMaxSpeed = this.MAX_SPEED * this.REVERSE_SPEED_FACTOR;
        const reverseTorque = this.ENGINE_TORQUE * this.REVERSE_TORQUE_FACTOR;
        let currentEngineTorque = this.reverseThrottle * reverseTorque;
        const normalForceFront = totalWeightForce * 0.5;
        const tractionForceLimit = normalForceFront * this.WHEEL_GRIP;
        let driveForce = currentEngineTorque / 0.4;
        if (driveForce > tractionForceLimit) {
          driveForce = tractionForceLimit;
          currentEngineTorque = driveForce * 0.4;
        }
        const targetAngularSpeed = reverseMaxSpeed / 0.4;
        this.springFront.setMotorSpeed(targetAngularSpeed * this.reverseThrottle);
        this.springFront.setMaxMotorTorque(currentEngineTorque);
        this.springFront.enableMotor(true);
      } else {
        this.reverseThrottle = 0;
        this.springFront.setMotorSpeed(0);
        this.springFront.setMaxMotorTorque(this.ENGINE_TORQUE * this.BRAKE_STRENGTH);
        this.springFront.enableMotor(true);
      }
    } else {
      this.throttle = 0;
      this.reverseThrottle = 0;
      this.springFront.enableMotor(false);
      this.springFront.setMotorSpeed(0);
    }

    // --- Apply Aerodynamic Nose-Down Force ---
    const speed = this.car.getLinearVelocity().length();
    const downforceCoefficient = 15;
    const noseDownForceMagnitude = downforceCoefficient * speed * speed;
    const frontOffset = new Vec2(1.0, 0);
    const frontPoint = this.car.getWorldPoint(frontOffset);
    this.car.applyForce(new Vec2(0, -noseDownForceMagnitude), frontPoint);

    // If the car is airborne, apply extra nose-down force.
    const airborneThreshold = 5.5;
    const carPos = this.car.getPosition();
    if (carPos.y > airborneThreshold) {
      const extraForce = this.ENGINE_TORQUE;
      const frontPt = this.car.getWorldPoint(new Vec2(1.0, 0));
      this.car.applyForce(new Vec2(0, -extraForce), frontPt);
    }

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
    const displayThrottle = this.braking ? this.reverseThrottle * -1 : this.throttle;
    const throttlePercentage = Math.round(displayThrottle * 100);
    const speedFormatted = forwardSpeed.toFixed(2);
    const nitroStatus = this.nitroActive ? 'Active' : 'Inactive';
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
    // Calculate target zoom: zoom in when slow, zoom out when fast
    const minZoom = 0.6;  // Maximum zoom out (when at max speed)
    const maxZoom = 1.5;  // Maximum zoom in (when standing still)
    const speedFactor = Math.abs(forwardSpeed) / (this.MAX_SPEED - 40);
    const targetZoom = maxZoom - (maxZoom - minZoom) * speedFactor;
    
    // Smoothly interpolate current zoom toward target zoom
    const zoomLerpFactor = 0.02; // Adjust for smoother/faster transitions
    this.currentZoom = this.currentZoom + (targetZoom - this.currentZoom) * zoomLerpFactor;

    // --- Redraw all physics bodies ---
    this.graphics.clear();
    // Use thinner line width based on device pixel ratio for sharper lines
    this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);

    // Simple camera: we’ll center drawing on the car.
    const centerX = Math.round(this.cameras.main.width / 2);
    const centerY = Math.round(this.cameras.main.height / 2);
    const carWorldPos = this.car.getPosition();
    const worldToScreen = (vec: Vec2) => ({
      // Round to exact pixels for sharper rendering
      // Only follow the car on X axis, apply zoom factor
      x: Math.round(centerX + (vec.x - carWorldPos.x) * this.SCALE * this.currentZoom),
      // Fixed Y position - use absolute world coordinates, apply zoom factor
      y: Math.round(centerY - vec.y * this.SCALE * this.currentZoom + this.cameras.main.height * 0.25)
    });

    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        const shape = fixture.getShape();
        const type = shape.getType();
        if (type === 'polygon') {
          const polygonShape = shape as PolygonShape;
          const vertices = polygonShape.m_vertices;
          const worldVertices = vertices.map((v) => body.getWorldPoint(v));
          
          // Fill with semi-transparent white for better visibility
          this.graphics.fillStyle(0xffffff, 0.07);
          
          this.graphics.beginPath();
          const first = worldToScreen(worldVertices[0]);
          this.graphics.moveTo(first.x, first.y);
          for (let i = 1; i < worldVertices.length; i++) {
            const pt = worldToScreen(worldVertices[i]);
            this.graphics.lineTo(pt.x, pt.y);
          }
          this.graphics.closePath();
          this.graphics.fillPath();
          this.graphics.strokePath();
        } else if (type === 'circle') {
          const center = body.getWorldPoint((shape as any).m_p);
          const radius = shape.getRadius();
          const screenCenter = worldToScreen(center);
          
          // Fill with semi-transparent white for better visibility
          this.graphics.fillStyle(0xffffff, 0.07);
          
          // Draw filled circle with stroke for better visibility
          // Apply zoom factor to the wheel radius
          const scaledRadius = radius * this.SCALE * this.currentZoom;
          this.graphics.fillCircle(screenCenter.x, screenCenter.y, scaledRadius);
          this.graphics.strokeCircle(screenCenter.x, screenCenter.y, scaledRadius);
          
          // Draw a line to show rotation for wheels
          if (body === this.wheelFront || body === this.wheelBack) {
            const angle = body.getAngle();
            // Apply zoom factor to the rotation indicator line
            const scaledRadius = radius * this.SCALE * this.currentZoom;
            const lineEndX = screenCenter.x + Math.cos(angle) * scaledRadius;
            const lineEndY = screenCenter.y + Math.sin(angle) * scaledRadius;
            
            this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
            this.graphics.beginPath();
            this.graphics.moveTo(screenCenter.x, screenCenter.y);
            this.graphics.lineTo(lineEndX, lineEndY);
            this.graphics.strokePath();
            
            // Reset line style
            this.graphics.lineStyle(2 / (window.devicePixelRatio || 1), 0xffffff, 1);
          }
        } else if (type === 'edge') {
          const v1 = body.getWorldPoint((shape as any).m_vertex1);
          const v2 = body.getWorldPoint((shape as any).m_vertex2);
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
      }
    }
  }
}
