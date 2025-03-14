<script lang="ts">
import { carTuning, resetCarTuning, updateCarTuningParameter } from '$lib/stores/car-tuning-store';

// Props with proper types
const props = $props<{
  onBack: () => void;
  secondaryButtonClass: string;
  dangerButtonClass: string;
}>();
</script>

<!-- Car Tuning Panel -->
<div class="grid grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
  <h2 class="col-span-2 text-2xl font-bold text-gray-200 mb-4">Car Tuning (Not that fun yet)</h2>
  
  <!-- Engine & Performance -->
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-gray-300 gradient-text">Engine & Performance</h3>
    <div class="space-y-3">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="nitroStrength" class="text-gray-300">Nitro Strength ({$carTuning.nitroStrength.toFixed(1)}x)</label>
        </div>
        <input 
          type="range" 
          id="nitroStrength"
          min="1.2" max="2.0" step="0.1"
          value={$carTuning.nitroStrength}
          onchange={(e) => updateCarTuningParameter('nitroStrength', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
    </div>
  </div>

  <!-- Weight & Distribution -->
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-gray-300 gradient-text">Weight & Distribution</h3>
    <div class="space-y-3">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="chassisWeight" class="text-gray-300">Chassis Weight ({$carTuning.chassisWeight} kg)</label>
        </div>
        <input 
          type="range" 
          id="chassisWeight"
          min="600" max="1200" step="50"
          value={$carTuning.chassisWeight}
          onchange={(e) => updateCarTuningParameter('chassisWeight', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="motorWeight" class="text-gray-300">Motor Weight ({$carTuning.motorWeight} kg)</label>
        </div>
        <input 
          type="range" 
          id="motorWeight"
          min="400" max="1000" step="50"
          value={$carTuning.motorWeight}
          onchange={(e) => updateCarTuningParameter('motorWeight', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="frontWeightDistribution" class="text-gray-300">Front Weight Distribution ({Math.round($carTuning.frontWeightDistribution * 100)}%)</label>
        </div>
        <input 
          type="range" 
          id="frontWeightDistribution"
          min="0.5" max="0.9" step="0.05"
          value={$carTuning.frontWeightDistribution}
          onchange={(e) => updateCarTuningParameter('frontWeightDistribution', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
    </div>
  </div>

  <!-- Handling & Traction -->
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-gray-300 gradient-text">Handling & Traction</h3>
    <div class="space-y-3">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="suspensionStiffness" class="text-gray-300">Suspension Stiffness ({$carTuning.suspensionStiffness.toFixed(1)})</label>
        </div>
        <input 
          type="range" 
          id="suspensionStiffness"
          min="1.5" max="4.0" step="0.1"
          value={$carTuning.suspensionStiffness}
          onchange={(e) => updateCarTuningParameter('suspensionStiffness', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="suspensionDamping" class="text-gray-300">Suspension Damping ({$carTuning.suspensionDamping.toFixed(1)})</label>
        </div>
        <input 
          type="range" 
          id="suspensionDamping"
          min="0.3" max="0.8" step="0.1"
          value={$carTuning.suspensionDamping}
          onchange={(e) => updateCarTuningParameter('suspensionDamping', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="wheelGrip" class="text-gray-300">Wheel Grip ({$carTuning.wheelGrip.toFixed(1)})</label>
        </div>
        <input 
          type="range" 
          id="wheelGrip"
          min="8.0" max="15.0" step="0.5"
          value={$carTuning.wheelGrip}
          onchange={(e) => updateCarTuningParameter('wheelGrip', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-gray-300 gradient-text">Controls</h3>
    <div class="space-y-3">
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="throttleIncRate" class="text-gray-300">Throttle Response ({$carTuning.throttleIncRate.toFixed(1)})</label>
        </div>
        <input 
          type="range" 
          id="throttleIncRate"
          min="0.3" max="1.0" step="0.1"
          value={$carTuning.throttleIncRate}
          onchange={(e) => updateCarTuningParameter('throttleIncRate', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="throttleDecRate" class="text-gray-300">Throttle Release ({$carTuning.throttleDecRate.toFixed(1)})</label>
        </div>
        <input 
          type="range" 
          id="throttleDecRate"
          min="1.0" max="5.0" step="0.5"
          value={$carTuning.throttleDecRate}
          onchange={(e) => updateCarTuningParameter('throttleDecRate', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between">
          <label for="brakeStrength" class="text-gray-300">Brake Strength ({$carTuning.brakeStrength.toFixed(1)})</label>
        </div>
        <input 
          type="range" 
          id="brakeStrength"
          min="0.5" max="2.0" step="0.1"
          value={$carTuning.brakeStrength}
          onchange={(e) => updateCarTuningParameter('brakeStrength', +e.currentTarget.value)}
          class="w-full"
        />
      </div>
    </div>
  </div>

  <!-- Control Buttons -->
  <div class="col-span-2 grid grid-cols-2 gap-4 mt-6">
    <button 
      onclick={props.onBack}
      class={props.secondaryButtonClass}
    >
      Back to Menu
    </button>
    <button 
      onclick={resetCarTuning}
      class={props.dangerButtonClass}
    >
      Reset Tuning
    </button>
  </div>
</div>

<style>
  /* Gradient text for section headers */
  :global(.gradient-text) {
    background: linear-gradient(90deg, #4f46e5, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Custom range input styling */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    margin: 10px 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--primary-gradient);
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: var(--primary-gradient);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover,
  input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
</style>
