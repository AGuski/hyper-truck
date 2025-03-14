<script lang="ts">
  import {
    GameMode,
    gameState,
    setGameMode,
    setPlayerName,
  } from "$lib/stores/game-state-store";
  import {
    carTuning,
    resetCarTuning,
    updateCarTuningParameter,
    type CarTuningParams,
  } from "$lib/stores/car-tuning-store";
  import GameTitle from "$lib/components/GameTitle.svelte";
  import GameSettings from "$lib/components/GameSettings.svelte";
  import CarTuning from "$lib/components/CarTuning.svelte";

  // State
  let playerName = $state($gameState.playerName);
  let selectedMode = $state<GameMode | null>(null);
  let showSettings = $state(false);
  let showTuning = $state(false);

  // Derived values
  const buttonClass =
    $derived(`px-3 py-1.5 text-base font-bold transition-all duration-300 shadow-lg 
    rounded-lg select-none btn-base text-white/90 cursor-pointer`);

  // Use gradient text/border with dark background for buttons
  const primaryButtonClass = $derived(`${buttonClass} gradient-border-primary`);
  const secondaryButtonClass = $derived(
    `${buttonClass} gradient-border-secondary`,
  );
  const dangerButtonClass = $derived(`${buttonClass} gradient-border-danger`);

  // Methods
  // Handle game mode selection
  function startGame(mode: GameMode): void {
    setGameMode(mode);
  }

  // Handle button clicks
  function handleCarTuningClick(): void {
    alert("Car tuning coming soon!");
  }

  function handleCreditsClick(): void {
    alert("Credits coming soon");
  }

  function toggleSettings(): void {
    showSettings = !showSettings;
  }

  // Handle fullscreen toggle
  function toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
</script>

<div class="fixed inset-0 flex flex-col items-center">
  <!-- Fullscreen Button -->
  <button
    onclick={toggleFullscreen}
    class="fixed top-4 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-md transition-colors shadow-lg cursor-pointer"
  >
    Fullscreen
  </button>

  <!-- Game Title Component -->
  <GameTitle />

  <!-- Menu Container -->
  <div>
    <!-- Game Mode Selection -->
    {#if !showSettings && !showTuning}
      <div class="main-menu flex flex-col items-center space-y-4 mt-8">
        <h2 class="text-2xl font-bold text-gray-200 mb-4 gradient-text">
          Select Game Mode:
        </h2>
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
        onclick={() => {
          showTuning = true;
        }}
        class={`${secondaryButtonClass} fixed bottom-12 left-1/2 -translate-x-1/2 w-48`}
        style="position: fixed"
      >
        <div class="flex flex-col items-center w-full">
          <span class="text-base">Car Tuning</span>
          <span class="text-xs opacity-80">Customize your truck</span>
        </div>
      </button>
    {:else if showSettings}
      <GameSettings
        onBack={() => toggleSettings()}
        {secondaryButtonClass}
        {dangerButtonClass}
      />
    {:else if showTuning}
      <CarTuning
        onBack={() => (showTuning = false)}
        {secondaryButtonClass}
        {dangerButtonClass}
      />
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
    onclick={() => alert("Credits coming soon")}
    class={`${secondaryButtonClass} fixed bottom-4 right-4 w-24`}
    style="position: fixed"
  >
    Credits
  </button>
</div>

<style>
  /* No custom styles at this point */
</style>
