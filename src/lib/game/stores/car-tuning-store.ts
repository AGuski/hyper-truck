import { writable } from 'svelte/store';

/**
 * Interface defining all tunable car parameters
 */
export interface CarTuningParams {
  // Engine & Performance
  maxSpeed: number;           // Max speed in km/h (Min: 80, Max: 200)
  engineTorque: number;       // Engine power (Min: 3000, Max: 6000)
  nitroStrength: number;      // Nitro boost multiplier (Min: 1.2, Max: 2.0)
  
  // Weight & Distribution
  chassisWeight: number;      // Chassis weight in kg (Min: 600, Max: 1200)
  motorWeight: number;        // Motor weight in kg (Min: 400, Max: 1000)
  frontWeightDistribution: number; // % of weight on front (Min: 0.5, Max: 0.9)
  
  // Handling & Traction
  suspensionStiffness: number; // Suspension stiffness (Min: 1.5, Max: 4.0)
  suspensionDamping: number;   // Suspension damping (Min: 0.3, Max: 0.8)
  wheelGrip: number;           // Wheel grip/traction (Min: 8.0, Max: 15.0)
  
  // Controls
  throttleIncRate: number;     // Throttle increase rate (Min: 0.3, Max: 1.0)
  throttleDecRate: number;     // Throttle decrease rate (Min: 1.0, Max: 5.0)
  brakeStrength: number;       // Brake strength (Min: 0.5, Max: 2.0)
}

/**
 * Default car tuning parameters
 */
const DEFAULT_TUNING: CarTuningParams = {
  // Engine & Performance
  maxSpeed: 130,
  engineTorque: 4500,
  nitroStrength: 1.5,
  
  // Weight & Distribution
  chassisWeight: 900,
  motorWeight: 700,
  frontWeightDistribution: 0.75,
  
  // Handling & Traction
  suspensionStiffness: 2.5,
  suspensionDamping: 0.5,
  wheelGrip: 20.0,
  
  // Controls
  throttleIncRate: 0.5,
  throttleDecRate: 3.0,
  brakeStrength: 1.0
};

/**
 * Global car tuning store using Svelte's state
 * This provides reactive access to car tuning parameters throughout the application
 */
export const carTuning = writable<CarTuningParams>(DEFAULT_TUNING);

/**
 * Reset car tuning to default values
 */
export function resetCarTuning(): void {
  carTuning.set(DEFAULT_TUNING);
}

/**
 * Update a single car tuning parameter
 * @param parameter - The parameter to update
 * @param value - The new value for the parameter
 */
export function updateCarTuningParameter<K extends keyof CarTuningParams>(
  parameter: K, 
  value: CarTuningParams[K]
): void {
  carTuning.update(current => {
    return { ...current, [parameter]: value };
  });
}

/**
 * Update multiple car tuning parameters at once
 * @param params - Partial car tuning parameters to update
 */
export function updateCarTuning(params: Partial<CarTuningParams>): void {
  carTuning.update(current => {
    return { ...current, ...params };
  });
}
