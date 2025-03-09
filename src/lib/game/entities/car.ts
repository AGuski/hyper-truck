import { World, Vec2, Circle, Polygon, Box, WheelJoint, Body } from 'planck';

/**
 * Available drive modes for the car
 */
export enum DriveMode {
  FRONT_WHEEL_DRIVE = 'front',
  REAR_WHEEL_DRIVE = 'rear',
  ALL_WHEEL_DRIVE = 'all'
}

/**
 * Represents a car entity in the game with physics properties and control methods.
 * Handles car creation, physics, and movement controls.
 */
export class Car {
  // Physics bodies
  private car: Body;
  private wheelFront: Body;
  private wheelBack: Body;
  private springFront: WheelJoint;
  private springBack: WheelJoint;
  
  // Drive configuration
  private driveMode: DriveMode = DriveMode.FRONT_WHEEL_DRIVE;

  // Control state
  private throttle = 0.0;
  private throttleTarget = 0.0;
  private reverseThrottle = 0.0;
  private braking = false;
  private nitroActive = false;

  // Constants and tuning parameters
  private readonly MAX_SPEED = 80;
  private readonly ENGINE_TORQUE = 4000;
  private readonly CHASSIS_WEIGHT = 900;
  private readonly MOTOR_WEIGHT = 700;
  private readonly SUSPENSION_STIFFNESS = 2.5; 
  private readonly SUSPENSION_DAMPING = 0.5;
  private readonly WHEEL_GRIP = 11.0;
  private readonly THROTTLE_INC_RATE = 0.5;
  private readonly THROTTLE_DEC_RATE = 3.0;
  private readonly BRAKE_STRENGTH = 1.0;
  private readonly FRONT_WEIGHT_DISTRIBUTION = 0.75; // 75% of weight on front
  private readonly REAR_WEIGHT_DISTRIBUTION = 0.25; // 25% of weight on rear
  private readonly REVERSE_SPEED_FACTOR = 0.5;
  private readonly REVERSE_TORQUE_FACTOR = 0.7;
  private readonly TOTAL_WEIGHT = this.CHASSIS_WEIGHT + this.MOTOR_WEIGHT;

  /**
   * Creates a new Car instance
   * @param world - The physics world the car will be created in
   * @param position - The initial position of the car
   */
  constructor(private world: World, position: Vec2) {
    // Create car body and components
    this.car = this.createCarBody(position);
    
    // Create wheels
    const wheelRadius = 0.4;
    const { wheelFront, wheelBack } = this.createWheels(wheelRadius);
    this.wheelFront = wheelFront;
    this.wheelBack = wheelBack;
    
    // Create suspension
    const suspensionJoints = this.createSuspension();
    this.springFront = suspensionJoints.frontJoint;
    this.springBack = suspensionJoints.backJoint;
  }

  /**
   * Creates the main car body with chassis and engine
   * @param position - Initial position for the car
   * @returns The created car body
   */
  private createCarBody(position: Vec2): Body {
    // Create car chassis
    const car = this.world.createDynamicBody(position);
    
    // Define car shape
    const carVertices = [
      new Vec2(-1.5, -0.5),
      new Vec2(1.5, -0.5),
      new Vec2(1.5, 0.0),
      new Vec2(0.0, 0.9),
      new Vec2(-1.15, 0.9),
      new Vec2(-1.5, 0.2)
    ];
    
    // Compute density so that the chassis weighs CHASSIS_WEIGHT
    const carDensity = this.CHASSIS_WEIGHT / 3.4025;
    car.createFixture(new Polygon(carVertices), {
      density: carDensity,
      friction: 0.3,
      restitution: 0.1
    });
    
    car.setLinearDamping(0.2);
    car.setAngularDamping(1.0);

    // Add engine - a small, heavy box in front of the car
    const heavyEngineShape = new Box(0.25, 0.25, new Vec2(1.0, 0.0), 0);
    car.createFixture(heavyEngineShape, {
      density: this.MOTOR_WEIGHT,
      friction: 0.3
    });

    return car;
  }

  /**
   * Creates the front and back wheels for the car
   * @param wheelRadius - Radius of the wheels
   * @returns Object containing front and back wheel bodies
   */
  private createWheels(wheelRadius: number): { wheelFront: Body, wheelBack: Body } {
    const wheelFD = { density: 1.0, friction: this.WHEEL_GRIP, restitution: 0.2 };

    // Rear wheel (non-driven)
    const wheelBack = this.world.createDynamicBody(new Vec2(-1.0, 0.35));
    wheelBack.createFixture(new Circle(wheelRadius), wheelFD);

    // Front wheel (driven)
    const wheelFront = this.world.createDynamicBody(new Vec2(1.0, 0.4));
    wheelFront.createFixture(new Circle(wheelRadius), wheelFD);

    wheelBack.setAngularDamping(0.4);
    wheelFront.setAngularDamping(0.4);

    // Adjust wheel density so that each wheel is 20% of total weight
    const targetWheelMass = 0.2 * this.TOTAL_WEIGHT;
    const wheelArea = Math.PI * wheelRadius * wheelRadius;
    const adjustedWheelDensity = targetWheelMass / wheelArea;
    wheelBack.getFixtureList()!.setDensity(adjustedWheelDensity);
    wheelFront.getFixtureList()!.setDensity(adjustedWheelDensity);
    wheelBack.resetMassData();
    wheelFront.resetMassData();

    return { wheelFront, wheelBack };
  }

  /**
   * Creates the suspension joints connecting the wheels to the car body
   * @returns Object containing front and back wheel joints
   */
  private createSuspension(): { frontJoint: WheelJoint, backJoint: WheelJoint } {
    const suspensionAxis = new Vec2(0, 1);
    
    // Rear suspension (potentially motorized based on drive mode)
    const backJoint = this.world.createJoint(new WheelJoint({
      motorSpeed: 0,
      maxMotorTorque: 10.0,
      enableMotor: false,
      frequencyHz: this.SUSPENSION_STIFFNESS,
      dampingRatio: this.SUSPENSION_DAMPING
    }, this.car, this.wheelBack, this.wheelBack.getPosition(), suspensionAxis))!;

    // Front suspension (potentially motorized based on drive mode)
    const frontJoint = this.world.createJoint(new WheelJoint({
      motorSpeed: 0,
      maxMotorTorque: 20.0,
      enableMotor: true,
      frequencyHz: this.SUSPENSION_STIFFNESS,
      dampingRatio: this.SUSPENSION_DAMPING
    }, this.car, this.wheelFront, this.wheelFront.getPosition(), suspensionAxis))!;
    
    return { frontJoint, backJoint };
  }

  /**
   * Updates the car physics based on current controls
   * @param dt - Time delta for physics update
   */
  public update(dt: number): void {
    // Update throttle
    if (!this.braking) {
      if (this.throttle < this.throttleTarget) {
        this.throttle = Math.min(this.throttle + this.THROTTLE_INC_RATE * dt, this.throttleTarget);
      } else if (this.throttle > this.throttleTarget) {
        this.throttle = Math.max(this.throttle - this.THROTTLE_DEC_RATE * dt, this.throttleTarget);
      }
    } else {
      this.throttle = 0;
    }

    // Compute car forward speed
    const velocity = this.car.getLinearVelocity();
    const forwardVec = this.car.getWorldVector(new Vec2(1, 0));
    const forwardSpeed = forwardVec.x * velocity.x + forwardVec.y * velocity.y;
    const totalWeightForce = this.TOTAL_WEIGHT * 9.8;

    // Motor Control
    if (this.throttle > 0 && !this.braking) {
      const nitroMultiplier = this.nitroActive ? 2.0 : 1.0;
      const targetAngularSpeed = (this.MAX_SPEED * nitroMultiplier) / 0.4;
      const totalEngineTorque = this.throttle * this.ENGINE_TORQUE * nitroMultiplier;
      
      // Apply drive based on selected drive mode
      switch (this.driveMode) {
        case DriveMode.FRONT_WHEEL_DRIVE:
          this.applyDriveToWheel(
            this.springFront, 
            totalEngineTorque, 
            targetAngularSpeed, 
            this.FRONT_WEIGHT_DISTRIBUTION,
            totalWeightForce
          );
          this.springBack.enableMotor(false);
          break;
          
        case DriveMode.REAR_WHEEL_DRIVE:
          this.applyDriveToWheel(
            this.springBack, 
            totalEngineTorque, 
            targetAngularSpeed, 
            this.REAR_WEIGHT_DISTRIBUTION,
            totalWeightForce
          );
          this.springFront.enableMotor(false);
          break;
          
        case DriveMode.ALL_WHEEL_DRIVE:
          {
          // Split torque between front and rear (60/40)
          const frontTorque = totalEngineTorque * 0.6;
          const rearTorque = totalEngineTorque * 0.4;
          
          this.applyDriveToWheel(
            this.springFront, 
            frontTorque, 
            targetAngularSpeed, 
            this.FRONT_WEIGHT_DISTRIBUTION,
            totalWeightForce
          );
          
          this.applyDriveToWheel(
            this.springBack, 
            rearTorque, 
            targetAngularSpeed, 
            this.REAR_WEIGHT_DISTRIBUTION,
            totalWeightForce
          );
          break;
        }
      }
      
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
        // Apply reverse drive based on selected drive mode
        switch (this.driveMode) {
          case DriveMode.FRONT_WHEEL_DRIVE:
            this.springFront.setMotorSpeed(targetAngularSpeed * this.reverseThrottle);
            this.springFront.setMaxMotorTorque(currentEngineTorque);
            this.springFront.enableMotor(true);
            this.springBack.enableMotor(false);
            break;
            
          case DriveMode.REAR_WHEEL_DRIVE:
            this.springBack.setMotorSpeed(targetAngularSpeed * this.reverseThrottle);
            this.springBack.setMaxMotorTorque(currentEngineTorque);
            this.springBack.enableMotor(true);
            this.springFront.enableMotor(false);
            break;
            
          case DriveMode.ALL_WHEEL_DRIVE:
            {
            // Split torque between front and rear (60/40)
            const frontTorque = currentEngineTorque * 0.6;
            const rearTorque = currentEngineTorque * 0.4;
            
            this.springFront.setMotorSpeed(targetAngularSpeed * this.reverseThrottle);
            this.springFront.setMaxMotorTorque(frontTorque);
            this.springFront.enableMotor(true);
            
            this.springBack.setMotorSpeed(targetAngularSpeed * this.reverseThrottle);
            this.springBack.setMaxMotorTorque(rearTorque);
            this.springBack.enableMotor(true);
            break;
            }
        }
      } else {
        this.reverseThrottle = 0;
        // Apply braking based on selected drive mode
        switch (this.driveMode) {
          case DriveMode.FRONT_WHEEL_DRIVE:
            this.springFront.setMotorSpeed(0);
            this.springFront.setMaxMotorTorque(this.ENGINE_TORQUE * this.BRAKE_STRENGTH);
            this.springFront.enableMotor(true);
            break;
            
          case DriveMode.REAR_WHEEL_DRIVE:
            this.springBack.setMotorSpeed(0);
            this.springBack.setMaxMotorTorque(this.ENGINE_TORQUE * this.BRAKE_STRENGTH);
            this.springBack.enableMotor(true);
            break;
            
          case DriveMode.ALL_WHEEL_DRIVE:
            this.springFront.setMotorSpeed(0);
            this.springFront.setMaxMotorTorque(this.ENGINE_TORQUE * this.BRAKE_STRENGTH * 0.6);
            this.springFront.enableMotor(true);
            
            this.springBack.setMotorSpeed(0);
            this.springBack.setMaxMotorTorque(this.ENGINE_TORQUE * this.BRAKE_STRENGTH * 0.4);
            this.springBack.enableMotor(true);
            break;
        }
      }
    } else {
      this.throttle = 0;
      this.reverseThrottle = 0;
      this.springFront.enableMotor(false);
      this.springFront.setMotorSpeed(0);
      this.springBack.enableMotor(false);
      this.springBack.setMotorSpeed(0);
    }

    // Apply Aerodynamic Nose-Down Force
    const speed = this.car.getLinearVelocity().length();
    const downforceCoefficient = 12;
    const noseDownForceMagnitude = downforceCoefficient * speed * speed;
    const frontOffset = new Vec2(1.0, 0);
    const frontPoint = this.car.getWorldPoint(frontOffset);
    this.car.applyForce(new Vec2(0, -noseDownForceMagnitude), frontPoint);

    // If the car is airborne, apply extra nose-down force
    const airborneThreshold = 5.5;
    const carPos = this.car.getPosition();
    if (carPos.y > airborneThreshold) {
      const extraForce = this.ENGINE_TORQUE;
      const frontPt = this.car.getWorldPoint(new Vec2(1.0, 0));
      this.car.applyForce(new Vec2(0, -extraForce), frontPt);
    }
  }

  /**
   * Handles throttle start event
   */
  public onThrottleStart(): void {
    this.throttleTarget = 1.0;
  }
  
  /**
   * Handles throttle end event
   */
  public onThrottleEnd(): void {
    this.throttleTarget = 0.0;
  }
  
  /**
   * Handles brake start event
   */
  public onBrakeStart(): void {
    this.braking = true;
    this.throttleTarget = 0.0;
  }
  
  /**
   * Handles brake end event
   */
  public onBrakeEnd(): void {
    this.braking = false;
    this.reverseThrottle = 0.0;
  }
  
  /**
   * Handles nitro start event
   */
  public onNitroStart(): void {
    this.nitroActive = true;
  }
  
  /**
   * Handles nitro end event
   */
  public onNitroEnd(): void {
    this.nitroActive = false;
  }
  
  /**
   * Sets the drive mode of the car
   * @param mode - The drive mode to set
   */
  public setDriveMode(mode: DriveMode): void {
    this.driveMode = mode;
  }
  
  /**
   * Gets the current drive mode of the car
   * @returns The current drive mode
   */
  public getDriveMode(): DriveMode {
    return this.driveMode;
  }
  
  /**
   * Applies drive force to a wheel
   * @param wheelJoint - The wheel joint to apply force to
   * @param engineTorque - The engine torque to apply
   * @param targetAngularSpeed - The target angular speed
   * @param weightDistribution - The weight distribution for this wheel
   * @param totalWeightForce - The total weight force of the car
   */
  private applyDriveToWheel(
    wheelJoint: WheelJoint, 
    engineTorque: number, 
    targetAngularSpeed: number,
    weightDistribution: number,
    totalWeightForce: number
  ): void {
    const normalForce = totalWeightForce * weightDistribution;
    const tractionForceLimit = normalForce * this.WHEEL_GRIP;
    let driveForce = engineTorque / 0.4; // wheelRadius = 0.4
    
    if (driveForce > tractionForceLimit) {
      driveForce = tractionForceLimit;
      engineTorque = driveForce * 0.4;
    }
    
    // For forward drive, set motor speed negative
    wheelJoint.setMotorSpeed(-targetAngularSpeed * this.throttle);
    wheelJoint.setMaxMotorTorque(engineTorque);
    wheelJoint.enableMotor(true);
  }

  /**
   * Gets the current position of the car body
   * @returns The position vector of the car
   */
  public getPosition(): Vec2 {
    return this.car.getPosition();
  }

  /**
   * Gets the car's forward speed
   * @returns The forward speed in m/s
   */
  public getForwardSpeed(): number {
    const velocity = this.car.getLinearVelocity();
    const forward = this.car.getWorldVector(new Vec2(1, 0));
    return Vec2.dot(velocity, forward);
  }

  /**
   * Gets the car's main body
   * @returns The car body
   */
  public getCarBody(): Body {
    return this.car;
  }

  /**
   * Gets the front wheel body
   * @returns The front wheel body
   */
  public getFrontWheel(): Body {
    return this.wheelFront;
  }

  /**
   * Gets the back wheel body
   * @returns The back wheel body
   */
  public getBackWheel(): Body {
    return this.wheelBack;
  }

  /**
   * Gets the current throttle value
   * @returns The throttle value (0 to 1)
   */
  public getThrottle(): number {
    return this.throttle;
  }

  /**
   * Gets the current reverse throttle value
   * @returns The reverse throttle value (0 to 1)
   */
  public getReverseThrottle(): number {
    return this.reverseThrottle;
  }

  /**
   * Checks if braking is active
   * @returns True if braking is active
   */
  public isBraking(): boolean {
    return this.braking;
  }

  /**
   * Checks if nitro is active
   * @returns True if nitro is active
   */
  public isNitroActive(): boolean {
    return this.nitroActive;
  }

  /**
   * Resets the car to a new position
   * @param position - The new position to place the car at
   */
  public resetPosition(position: Vec2): void {
    // Reset car position and velocity
    this.car.setPosition(position);
    this.car.setLinearVelocity(new Vec2(0, 0));
    this.car.setAngularVelocity(0);
    
    // Reset wheel positions relative to car
    const wheelFrontPos = new Vec2(position.x + 1.0, position.y - 0.6);
    const wheelBackPos = new Vec2(position.x - 1.0, position.y - 0.6);
    
    this.wheelFront.setPosition(wheelFrontPos);
    this.wheelFront.setLinearVelocity(new Vec2(0, 0));
    this.wheelFront.setAngularVelocity(0);
    
    this.wheelBack.setPosition(wheelBackPos);
    this.wheelBack.setLinearVelocity(new Vec2(0, 0));
    this.wheelBack.setAngularVelocity(0);
    
    // Reset control state
    this.throttle = 0.0;
    this.throttleTarget = 0.0;
    this.reverseThrottle = 0.0;
    this.braking = false;
    this.nitroActive = false;
  }
}
