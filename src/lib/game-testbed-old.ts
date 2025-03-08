import { World, Vec2, Edge, Box, Circle, Polygon, RevoluteJoint, WheelJoint, Testbed } from 'planck/with-testbed';

/**
 * Creates a text overlay for displaying game information
 */
function createTextOverlay(): {
  container: HTMLDivElement;
  update: (throttleValue: number, speedValue: number, nitroActive: boolean, timerValue: number | null) => void;
} {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '10px';
  container.style.left = '10px';
  container.style.padding = '8px';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  container.style.color = 'white';
  container.style.fontFamily = 'monospace';
  container.style.fontSize = '14px';
  container.style.borderRadius = '4px';
  container.style.zIndex = '1000';
  container.style.pointerEvents = 'none';
  
  const throttleDisplay = document.createElement('div');
  const speedDisplay = document.createElement('div');
  const nitroDisplay = document.createElement('div');
  const timerDisplay = document.createElement('div');
  
  container.appendChild(throttleDisplay);
  container.appendChild(speedDisplay);
  container.appendChild(nitroDisplay);
  container.appendChild(timerDisplay);
  
  const update = (throttleValue: number, speedValue: number, nitroActive: boolean, timerValue: number | null): void => {
    // Format throttle as percentage
    const throttlePercentage = Math.round(throttleValue * 100);
    throttleDisplay.textContent = `Throttle: ${throttlePercentage}%`;
    
    // Format speed with 2 decimal places
    const speedFormatted = speedValue.toFixed(2);
    speedDisplay.textContent = `Speed: ${speedFormatted} m/s`;
    
    // Format nitro status
    const nitroStatus = nitroActive ? 'Active' : 'Inactive';
    nitroDisplay.textContent = `Nitro: ${nitroStatus}`;
    
    // Format timer
    if (timerValue !== null) {
      const minutes = Math.floor(timerValue / 60);
      const seconds = Math.floor(timerValue % 60);
      const milliseconds = Math.floor((timerValue % 1) * 1000);
      timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      timerDisplay.textContent = 'Time: Not started';
    }
  };
  
  return { container, update };
}

export function initCarSimulation(canvasContainer: HTMLElement): () => void {
  // === TUNING PARAMETERS ===
  const MAX_SPEED            = 80;    // Max linear speed (m/s) at full throttle (forward)
  const ENGINE_TORQUE        = 4000;   // Engine torque (N·m)
  const CHASSIS_WEIGHT       = 900;   // Chassis weight (kg)
  const MOTOR_WEIGHT         = 700;    // Motor weight (kg)
  const SUSPENSION_STIFFNESS = 2.5;   // Suspension spring frequency (Hz)
  const SUSPENSION_DAMPING   = 0.5;   // Suspension damping ratio (0 to 1)
  const WHEEL_GRIP           = 11.0;   // Tire grip (friction coefficient)
  const THROTTLE_INC_RATE    = 0.5;   // Throttle increase rate (per second)
  const THROTTLE_DEC_RATE    = 3.0;   // Throttle decrease rate (per second)
  const BRAKE_STRENGTH       = 1.0;   // Multiplier for braking torque
  const REVERSE_SPEED_FACTOR = 0.5;   // Reverse max speed is 50% of forward max speed
  const REVERSE_TORQUE_FACTOR= 0.7;   // Reverse engine torque is 70% of forward torque

  const totalWeight = CHASSIS_WEIGHT + MOTOR_WEIGHT;

  let nitroActive = false;
  // Nitro multiplier will be calculated dynamically in the step function

  // === SETUP PHYSICS WORLD & TESTBED ===
  const world = new World({
    gravity: new Vec2(0, -9.8)
  });

  const testbed = Testbed.mount(canvasContainer);
  testbed.width = 30;
  testbed.height = 30;
  testbed.y = -6;
  testbed.speed = 1;
  testbed.hz = 50;

  // Create overlay for throttle and speed indicators
  const overlay = createTextOverlay();
  canvasContainer.appendChild(overlay.container);

  // === TERRAIN SETUP (Original Code) ===
  const ground = world.createBody();
  const groundFD = {
    density: 0.0,
    friction: 0.6
  };

  ground.createFixture(Edge(new Vec2(-20, 0), new Vec2(20, 0)), groundFD);

  const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];
  let x = 20;
  let y1 = 0;
  const dx = 5;
  for (let i = 0; i < 10; ++i) {
    const y2 = hs[i];
    ground.createFixture(Edge(new Vec2(x, y1), new Vec2(x + dx, y2)), groundFD);
    y1 = y2;
    x += dx;
  }
  for (let i = 0; i < 10; ++i) {
    const y2 = hs[i];
    ground.createFixture(Edge(new Vec2(x, y1), new Vec2(x + dx, y2)), groundFD);
    y1 = y2;
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
  // ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x, 2)), groundFD);
  
  // Add a flat stretch for high speed
  // x += 20;
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 120, 0)), groundFD);
  x += 120;
  
  // Add a small ramp at the end of the flat stretch
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 15, 3)), groundFD);
  x += 15;
  ground.createFixture(Edge(new Vec2(x, 3), new Vec2(x + 15, 0)), groundFD);
  x += 15;
  
  // Continue with another flat stretch
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 60, 0)), groundFD);
  x += 60;

  // Add a flat stretch for high speed
  // x += 20;
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 120, 0)), groundFD);
  x += 120;
  
  // Add a small ramp at the end of the flat stretch
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 15, 3)), groundFD);
  x += 15;
  ground.createFixture(Edge(new Vec2(x, 3), new Vec2(x + 15, 0)), groundFD);
  x += 15;
  
  // Continue with another flat stretch
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x + 60, 0)), groundFD);
  x += 60;
  
  
  // End wall
  ground.createFixture(Edge(new Vec2(x, 0), new Vec2(x, 20)), groundFD);

  // Teeter
  const teeter = world.createDynamicBody(new Vec2(140, 1));
  teeter.createFixture(Box(10, 0.25), 1.0);
  world.createJoint(new RevoluteJoint({
    lowerAngle: -8 * Math.PI / 180,
    upperAngle: 8 * Math.PI / 180,
    enableLimit: true
  }, ground, teeter, teeter.getPosition()));
  teeter.applyAngularImpulse(100, true);

  // Bridge
  const bridgeFD = {
    density: 150.0,
    friction: 0.6
  };
  let prevBody = ground;
  for (let i = 0; i < 20; ++i) {
    const bridgeBlock = world.createDynamicBody(new Vec2(161 + 2 * i, -0.125));
    bridgeBlock.createFixture(Box(1.0, 0.125), bridgeFD);
    world.createJoint(new RevoluteJoint({}, prevBody, bridgeBlock, new Vec2(160 + 2 * i, -0.125)));
    prevBody = bridgeBlock;
  }
  world.createJoint(new RevoluteJoint({}, prevBody, ground, new Vec2(160 + 2 * 20, -0.125)));

  // Boxes - original stack
  const box = new Box(0.5, 0.5);
  
  // Define box properties
  const boxFixtureDefinition = {
    density: 0.8,       // Density (affects mass)
    friction: 0.4,      // Friction coefficient
    restitution: 0.7    // Bounciness (0 = no bounce, 1 = perfect bounce)
  };
  
  // Create boxes with the specified properties
  world.createDynamicBody(new Vec2(230, 0.5)).createFixture(box, boxFixtureDefinition);
  world.createDynamicBody(new Vec2(230, 1.5)).createFixture(box, boxFixtureDefinition);
  world.createDynamicBody(new Vec2(230, 2.5)).createFixture(box, boxFixtureDefinition);
  world.createDynamicBody(new Vec2(230, 3.5)).createFixture(box, boxFixtureDefinition);
  world.createDynamicBody(new Vec2(230, 4.5)).createFixture(box, boxFixtureDefinition);
  
  // Additional boxes on the flat stretch
  // // Pyramid formation
  // const pyramidX = 350;
  // for (let row = 0; row < 5; row++) {
  //   for (let col = 0; col <= row; col++) {
  //     const xPos = pyramidX + (col - row/2) * 1.1;
  //     const yPos = 0.5 + row * 1.1;
  //     world.createDynamicBody(new Vec2(xPos, yPos)).createFixture(box, 0.5);
  //   }
  // }
  
  // // Wall of boxes
  // const wallX = 420;
  // for (let row = 0; row < 6; row++) {
  //   for (let col = 0; col < 8; col++) {
  //     const xPos = wallX + col * 1.1;
  //     const yPos = 0.5 + row * 1.1;
  //     world.createDynamicBody(new Vec2(xPos, yPos)).createFixture(box, 0.5);
  //   }
  // }
  
  // Random scattered boxes
  const scatterX = 480;
  for (let i = 0; i < 20; i++) {
    const xPos = scatterX + Math.random() * 40;
    const yPos = 0.5 + Math.random() * 3;
    world.createDynamicBody(new Vec2(xPos, yPos)).createFixture(box, boxFixtureDefinition);
  }

  // === CAR SETUP (Original Car Body Shape) ===
  const car = world.createDynamicBody(new Vec2(0, 1));
  const carVertices = [
    new Vec2(-1.5, -0.5),
    new Vec2(1.5, -0.5),
    new Vec2(1.5, 0.0),
    new Vec2(0.0, 0.9),
    new Vec2(-1.15, 0.9),
    new Vec2(-1.5, 0.2)
  ];
  // Approximate area computed via the shoelace formula ~3.4025
  // const carArea = 3.4025;
  const carDensity = CHASSIS_WEIGHT / 3.4025;
  car.createFixture(new Polygon(carVertices), {
    density: carDensity,
    friction: 0.3,
    restitution: 0.1
  });
  car.setLinearDamping(0.2);
  car.setAngularDamping(1.0);


  //=== ENGINE ===
  // Create a small box shape representing a heavy engine.
// The Box function here takes half-width, half-height, an optional center offset, and an optional angle.
const heavyEngineShape = new Box(0.25, 0.25, new Vec2(1.0, 0.0), 0); // centered 1.0 m forward relative to car body
// Attach this fixture to the car with a high density.
car.createFixture(heavyEngineShape, {
  density: MOTOR_WEIGHT, // High density to simulate significant mass.
  friction: 0.3
});

  // === WHEELS (Original Positions) ===
  const wheelRadius = 0.4;
  const wheelFD = {
    density: 1.0, // temporary; will be adjusted below
    friction: WHEEL_GRIP,
    restitution: 0.2
  };

  // Rear wheel (non-driven)
  const wheelBack = world.createDynamicBody(new Vec2(-1.0, 0.35));
  wheelBack.createFixture(Circle(wheelRadius), wheelFD);

  // Front wheel (driven wheel)
  const wheelFront = world.createDynamicBody(new Vec2(1.0, 0.4));
  wheelFront.createFixture(Circle(wheelRadius), wheelFD);

  wheelBack.setAngularDamping(0.4);
  wheelFront.setAngularDamping(0.4);

  // Adjust wheel density for target mass (20% of chassis mass each)
  const targetWheelMass = 0.2 * totalWeight;
  const wheelArea = Math.PI * wheelRadius * wheelRadius;
  const adjustedWheelDensity = targetWheelMass / wheelArea;
  wheelBack.getFixtureList()!.setDensity(adjustedWheelDensity);
  wheelFront.getFixtureList()!.setDensity(adjustedWheelDensity);
  wheelBack.resetMassData();
  wheelFront.resetMassData();

  // === SUSPENSION (WHEEL JOINTS) ===
  const suspensionAxis = new Vec2(0, 1);
  // Rear wheel joint: suspension only
  const springBack = world.createJoint(WheelJoint({
    motorSpeed: 0,
    maxMotorTorque: 10.0,
    enableMotor: false,
    frequencyHz: SUSPENSION_STIFFNESS,
    dampingRatio: SUSPENSION_DAMPING
  }, car, wheelBack, wheelBack.getPosition(), suspensionAxis));
  // Front wheel joint: motorized (driven) as in the original code
  const springFront = world.createJoint(WheelJoint({
    motorSpeed: 0,
    maxMotorTorque: 20.0,
    enableMotor: true,
    frequencyHz: SUSPENSION_STIFFNESS,
    dampingRatio: SUSPENSION_DAMPING
  }, car, wheelFront, wheelFront.getPosition(), suspensionAxis))!;

  // === CONTROLS & THROTTLE / REVERSE ===
  let throttle = 0.0;        // forward throttle (0 to 1)
  let throttleTarget = 0.0;  // desired forward throttle value
  let reverseThrottle = 0.0; // reverse throttle (0 to 1)
  let braking = false;       // whether brake is pressed

  const keyDownHandler = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      throttleTarget = 1.0;
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      braking = true;
      // When braking is pressed, we want to stop forward throttle.
      throttleTarget = 0.0;
    }
  };
  const keyUpHandler = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      throttleTarget = 0.0;
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      braking = false;
      reverseThrottle = 0.0;
    }
  };



window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    nitroActive = true;
  }
});

window.addEventListener('keyup', (e: KeyboardEvent) => {
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    nitroActive = false;
  }
});

  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);

  // === TIMER VARIABLES ===
  let timerStarted = false;
  let timerValue: number | null = null;
  let startTime = 0;
  let endWallHit = false;
  const endWallPosition = x; // The x position of the end wall
  
  // === SIMULATION STEP FUNCTION ===
  testbed.step = () => {
    const dt = 1.0 / testbed.hz;

    // --- Update Forward Throttle ---
    if (!braking) {
      if (throttle < throttleTarget) {
        throttle = Math.min(throttle + THROTTLE_INC_RATE * dt, throttleTarget);
      } else if (throttle > throttleTarget) {
        throttle = Math.max(throttle - THROTTLE_DEC_RATE * dt, throttleTarget);
      }
    } else {
      throttle = 0;
    }

    // Compute car's forward speed.
    const velocity = car.getLinearVelocity();
    const forwardVec = car.getWorldVector(new Vec2(1, 0));
    const forwardSpeed = forwardVec.x * velocity.x + forwardVec.y * velocity.y;

    const totalWeightForce = totalWeight * 9.8;

    // --- Motor Control ---
    if (throttle > 0 && !braking) {
      // Forward drive mode.
      // Calculate nitro multiplier dynamically based on current nitroActive state
      const nitroMultiplier = nitroActive ? 2.0 : 1.0;
      
      let currentEngineTorque = throttle * ENGINE_TORQUE * nitroMultiplier;
      
      const weightFront = 0.8; // weight shifts toward front under acceleration (could be multiplied by throttle)
      const normalForceFront = totalWeightForce * weightFront;
      const tractionForceLimit = normalForceFront * WHEEL_GRIP;
      let driveForce = currentEngineTorque / wheelRadius;
      if (driveForce > tractionForceLimit) {
        driveForce = tractionForceLimit;
        currentEngineTorque = driveForce * wheelRadius;
      }
      const targetAngularSpeed = (MAX_SPEED * nitroMultiplier) / wheelRadius;
      // For forward drive, motor speed is set negative.
      springFront.setMotorSpeed(-targetAngularSpeed * throttle);
      springFront.setMaxMotorTorque(currentEngineTorque);
      springFront.enableMotor(true);
      reverseThrottle = 0; // reset reverse throttle
    } else if (braking) {
      // If braking is pressed...
      if (forwardSpeed < 0.5) {
        // Reverse mode: if nearly stationary or moving backward, ramp reverse throttle.
        reverseThrottle = Math.min(reverseThrottle + THROTTLE_INC_RATE * dt, 1.0);
        const reverseMaxSpeed = MAX_SPEED * REVERSE_SPEED_FACTOR;
        const reverseTorque = ENGINE_TORQUE * REVERSE_TORQUE_FACTOR;
        let currentEngineTorque = reverseThrottle * reverseTorque;
        const normalForceFront = totalWeightForce * 0.5; // assume balanced distribution in reverse
        const tractionForceLimit = normalForceFront * WHEEL_GRIP;
        let driveForce = currentEngineTorque / wheelRadius;
        if (driveForce > tractionForceLimit) {
          driveForce = tractionForceLimit;
          currentEngineTorque = driveForce * wheelRadius;
        }
        const targetAngularSpeed = reverseMaxSpeed / wheelRadius;
        // In reverse mode, motor speed is positive.
        springFront.setMotorSpeed(targetAngularSpeed * reverseThrottle);
        springFront.setMaxMotorTorque(currentEngineTorque);
        springFront.enableMotor(true);
      } else {
        // If the car is moving forward, apply braking torque.
        reverseThrottle = 0;
        springFront.setMotorSpeed(0);
        springFront.setMaxMotorTorque(ENGINE_TORQUE * BRAKE_STRENGTH);
        springFront.enableMotor(true);
      }
    } else {
      // No input: disable motor.
      throttle = 0;
      reverseThrottle = 0;
      springFront.enableMotor(false);
      springFront.setMotorSpeed(0);
    }

    // --- Apply Aerodynamic Nose-Down Force ---
    // This scales with the square of the speed.
    const speed = car.getLinearVelocity().length();
    const downforceCoefficient = 15; // Adjust this value to tune the effect.
    const noseDownForceMagnitude = downforceCoefficient * speed * speed;
    // Determine the front point on the car. Adjust the offset as needed.
    const frontOffset = new Vec2(1.0, 0);
    const frontPoint = car.getWorldPoint(frontOffset);
    car.applyForce(new Vec2(0, -noseDownForceMagnitude), frontPoint);


    // Apply nose-down force if the car is airborne.
    const airborneThreshold = 5.5; // Adjust threshold as needed
    const carPos = car.getPosition();
    if (carPos.y > airborneThreshold) {
      console.log('Applying nose-down force');
      // Get a point near the front of the car (local offset from car center)
      const frontOffset = new Vec2(1.0, 0);
      const frontPoint = car.getWorldPoint(frontOffset);
      // Define the force magnitude; adjust as needed for your simulation
      console.log(totalWeight* 2 );
      const noseDownForceMagnitude = ENGINE_TORQUE; //totalWeight* 2 - 100;//3500; // Newtons
      car.applyForce(new Vec2(0, -noseDownForceMagnitude), frontPoint);
    }


    // Update timer logic
    const pos = car.getPosition();
    
    // Start timer when car first moves
    if (!timerStarted && Math.abs(forwardSpeed) > 0.1) {
      timerStarted = true;
      startTime = performance.now() / 1000; // Convert to seconds
      timerValue = 0;
    }
    
    // Update timer if started but not ended
    if (timerStarted && !endWallHit) {
      timerValue = performance.now() / 1000 - startTime;
      
      // Check if car has hit the end wall
      if (pos.x >= endWallPosition - 2) { // 2 units buffer before the wall
        endWallHit = true;
      }
    }
    
    // Update throttle, speed, and timer indicators
    const displayThrottle = braking ? reverseThrottle * -1 : throttle;
    overlay.update(displayThrottle, forwardSpeed, nitroActive, timerValue);
    
    world.step(dt);
    testbed.x = -pos.x;
  };

  testbed.start(world);

  // Cleanup: remove event listeners on simulation stop.
  return () => {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    
    // Clean up the overlay when simulation stops
    if (overlay.container.parentNode) {
      overlay.container.parentNode.removeChild(overlay.container);
    }
  };
}
