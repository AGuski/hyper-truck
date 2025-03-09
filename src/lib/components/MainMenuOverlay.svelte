<script lang="ts">
  import { GameMode, gameState, setGameMode, setPlayerName } from '$lib/stores/game-state-store';
  import { carTuning, resetCarTuning, updateCarTuningParameter, type CarTuningParams } from '$lib/stores/car-tuning-store';
  
  // State
  let playerName = $state($gameState.playerName);
  let selectedMode = $state<GameMode | null>(null);
  let showSettings = $state(false);
  let showTuning = $state(false);
  
  // Derived values
  const buttonClass = $derived(`px-3 py-1.5 text-base font-bold transition-all duration-300 shadow-lg 
    rounded-lg select-none btn-base text-white/90 cursor-pointer`);
  
  // Use gradient text/border with dark background for buttons
  const primaryButtonClass = $derived(`${buttonClass} gradient-border-primary`);
  const secondaryButtonClass = $derived(`${buttonClass} gradient-border-secondary`);
  const dangerButtonClass = $derived(`${buttonClass} gradient-border-danger`);
  
  // Methods
  // Handle game mode selection
  function startGame(mode: GameMode): void {
    setGameMode(mode);
  }

  // Handle button clicks
  function handleCarTuningClick(): void {
    alert('Car tuning coming soon!');
  }

  function handleCreditsClick(): void {
    alert('Credits coming soon');
  }
  
  function toggleSettings(): void {
    showSettings = !showSettings;
  }
</script>

<div class="fixed inset-0 flex flex-col items-center">
  <!-- ASCII Art Title -->
  <pre class="ascii-title text-center mt-16 mb-6 text-transparent bg-clip-text gradient-text">

 ██╗  ██╗██╗   ██╗██████╗ ███████╗██████╗     ████████╗██████╗ ██╗   ██╗ ██████╗██╗  ██╗
 ██║  ██║╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗    ╚══██╔══╝██╔══██╗██║   ██║██╔════╝██║ ██╔╝
 ███████║ ╚████╔╝ ██████╔╝█████╗  ██████╔╝       ██║   ██████╔╝██║   ██║██║     █████╔╝ 
 ██╔══██║  ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗       ██║   ██╔══██╗██║   ██║██║     ██╔═██╗ 
 ██║  ██║   ██║   ██║     ███████╗██║  ██║       ██║   ██║  ██║╚██████╔╝╚██████╗██║  ██╗
 ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝       ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝
                                                                                  
🔥🔥🔥 THE PHYSICS-DEFYING DRIVING EXPERIENCE 🔥🔥🔥
  <a href="https://github.com/AGuski/hyper-truck" target="_blank" rel="noopener noreferrer" class="github-link flex items-center justify-center transition-all">
    <svg class="w-5 h-5 mr-3" fill="#3b82f6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
    <span class="gradient-text font-bold">Visit on GitHub</span>
  </a>
  </pre>
  
  <!-- Menu Container -->
  <div>
    <!-- Game Mode Selection -->
    {#if !showSettings && !showTuning}
    <div class="main-menu flex flex-col items-center space-y-4 mt-8">
      <h2 class="text-2xl font-bold text-gray-200 mb-4 gradient-text">Select Game Mode:</h2>
      <div class="flex justify-center space-x-4">
        <button 
          onclick={() => startGame(GameMode.TIME_TRIAL)}
          class={`${primaryButtonClass} w-72`}
        >
          <div class="flex flex-col items-center w-full">
            <span class="text-lg">Time Trial</span>
            <span class="text-xs opacity-80">Race against the clock</span>
          </div>
        </button>

        <button 
          onclick={() => startGame(GameMode.INFINITE)}
          class={`${primaryButtonClass} w-72`}
        >
          <div class="flex flex-col items-center w-full">
            <span class="text-lg">Infinite Mode</span>
            <span class="text-xs opacity-80">Drive as far as you can</span>
          </div>
        </button>
      </div>
    </div>

    <button 
      onclick={() => {showTuning = true;}}
      class={`${secondaryButtonClass} fixed bottom-12 left-1/2 -translate-x-1/2 w-48`}
      style="position: fixed"
    >
      <div class="flex flex-col items-center w-full">
        <span class="text-base">Car Tuning</span>
        <span class="text-xs opacity-80">Customize your truck</span>
      </div>
    </button>
    {:else if showSettings}
      <!-- Settings Panel -->
      <div class="space-y-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-200 mb-4">Game Settings</h2>
        <!-- Sound Settings -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label for="soundToggle" class="text-gray-300">Sound Effects</label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="soundToggle"
                checked={$gameState.soundEnabled}
                onclick={() => gameState.update(state => ({ ...state, soundEnabled: !state.soundEnabled }))}
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <label for="musicToggle" class="text-gray-300">Background Music</label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="musicToggle"
                checked={$gameState.musicEnabled}
                onclick={() => gameState.update(state => ({ ...state, musicEnabled: !state.musicEnabled }))}
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <label for="savePrefsToggle" class="text-gray-300">Save Preferences</label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="savePrefsToggle"
                checked={$gameState.savePreferences}
                onclick={() => gameState.update(state => ({ ...state, savePreferences: !state.savePreferences }))}
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <!-- Back Button -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <button 
            onclick={toggleSettings}
            class={secondaryButtonClass}
          >
            Back to Menu
          </button>
          <!-- Reset Settings Button -->
          <button 
            onclick={() => gameState.update(state => ({ 
              ...state, 
              soundEnabled: true,
              musicEnabled: true,
              savePreferences: true
            }))}
            class={dangerButtonClass}
          >
            Reset Settings
          </button>
        </div>
      </div>

    {:else if showTuning}
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
            onclick={() => showTuning = false}
            class={secondaryButtonClass}
          >
            Back to Menu
          </button>
          <button 
            onclick={resetCarTuning}
            class={dangerButtonClass}
          >
            Reset Tuning
          </button>
        </div>
      </div>
    {/if}
  </div>
  <!-- Settings Button at Bottom Left -->
  <button 
    onclick={toggleSettings}
    class={`${secondaryButtonClass} fixed bottom-4 left-4`}
    style="position: fixed"
  >
    Settings
  </button>
  <!-- Credits Button at Bottom Right -->
  <button 
    onclick={() => alert('Credits coming soon')}
    class={`${secondaryButtonClass} fixed bottom-4 right-4 w-24`}
    style="position: fixed"
  >
    Credits
  </button>
</div>

<style>
  /* Custom range input styling */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    background: rgb(17 24 39 / 0.9);
    border-radius: 4px;
    outline: none;
    border: 2px solid transparent;
    background-clip: padding-box;
    position: relative;
  }

  input[type="range"]::before {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    bottom: -2px;
    left: -2px;
    z-index: -1;
    margin: -2px;
    border-radius: 6px;
    background: var(--secondary-gradient);
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

  /* CSS Variables for consistent theming */
  :root {
    /* Colors */
    --primary-color-from: #3b82f6;
    --primary-color-to: #8b5cf6;
    --secondary-color-from: #64748b;
    --secondary-color-to: #94a3b8;
    --danger-color-from: #ef4444;
    --danger-color-to: #f97316;
    --bg-dark: rgb(17 24 39 / 0.9);
    
    /* Gradients */
    --primary-gradient: linear-gradient(to right, var(--primary-color-from), var(--primary-color-to));
    --secondary-gradient: linear-gradient(to right, var(--secondary-color-from), var(--secondary-color-to));
    --danger-gradient: linear-gradient(to right, var(--danger-color-from), var(--danger-color-to));
    
    /* Shadows */
    --text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    --hover-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2);
    --active-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    
    /* Border radius */
    --border-radius-outer: 0.5rem;
    --border-radius-inner: 0.375rem;
    
    /* Transitions */
    --transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-fast: all 0.2s ease;
    
    /* Effects */
    --hover-brightness: brightness(1.3) contrast(1.1);
    --active-brightness: brightness(0.9);
    --blur-amount: blur(8px);
  }

  /* Button base styles */
  :global(.btn-base) {
    position: relative;
    border: 2px solid transparent;
    background-clip: padding-box;
    background-color: var(--bg-dark);
    transition: var(--transition-normal);
    backdrop-filter: var(--blur-amount);
    text-shadow: var(--text-shadow);
    letter-spacing: 0.025em;
  }

  /* Common pseudo-element for all buttons */
  :global(.btn-base::before) {
    content: '';
    position: absolute;
    inset: -2px;
    z-index: -1;
    border-radius: var(--border-radius-outer);
    transition: var(--transition-fast);
  }

  /* Button type-specific gradients */
  :global(.gradient-border-primary::before) {
    background: var(--primary-gradient);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.3);
  }

  :global(.gradient-border-secondary::before) {
    background: var(--secondary-gradient);
    box-shadow: 0 0 20px rgba(100, 116, 139, 0.5), inset 0 0 20px rgba(100, 116, 139, 0.3);
  }

  :global(.gradient-border-danger::before) {
    background: var(--danger-gradient);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.3);
  }

  /* Common hover state */
  :global(.btn-base:hover) {
    transform: translateY(-2px);
    box-shadow: var(--hover-shadow);
  }

  /* Button type-specific hover states */
  :global(.gradient-border-primary:hover::before) {
    filter: var(--hover-brightness);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.7), inset 0 0 30px rgba(59, 130, 246, 0.4);
  }

  :global(.gradient-border-secondary:hover::before) {
    filter: var(--hover-brightness);
    box-shadow: 0 0 30px rgba(100, 116, 139, 0.7), inset 0 0 30px rgba(100, 116, 139, 0.4);
  }

  :global(.gradient-border-danger:hover::before) {
    filter: var(--hover-brightness);
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.7), inset 0 0 30px rgba(239, 68, 68, 0.4);
  }

  /* Common active state */
  :global(.btn-base:active) {
    transform: translateY(1px);
    box-shadow: var(--active-shadow);
  }

  /* Button type-specific active states */
  :global(.gradient-border-primary:active::before) {
    filter: var(--active-brightness);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.2);
  }

  :global(.gradient-border-secondary:active::before) {
    filter: var(--active-brightness);
    box-shadow: 0 0 15px rgba(100, 116, 139, 0.4), inset 0 0 15px rgba(100, 116, 139, 0.2);
  }

  :global(.gradient-border-danger:active::before) {
    filter: var(--active-brightness);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 15px rgba(239, 68, 68, 0.2);
  }
  
  /* Gradient text for ASCII art title */
  :global(.gradient-text) {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  /* Gradient fill for SVG icons */
  :global(.gradient-fill) {
    fill: url(#gradient);
  }
  
  /* ASCII art title styling */
  .ascii-title {
    font-family: monospace;
    font-size: 0.6rem;
    line-height: 1.2;
    white-space: pre;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    font-weight: bold;
  }
  
  /* GitHub link styles */
  .github-link {
    position: relative;
    transition: var(--transition-fast);
  }

  .github-link:hover {
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
    transform: scale(1.05);
  }

  .github-link:hover svg {
    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.8));
  }

  .github-link:hover span {
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
  }

  /* Make ASCII art responsive */
  @media (min-width: 640px) {
    .ascii-title {
      font-size: 0.7rem;
    }
  }
  
  @media (min-width: 768px) {
    .ascii-title {
      font-size: 0.8rem;
    }
  }
</style>
