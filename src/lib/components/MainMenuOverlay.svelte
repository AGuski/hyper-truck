<script lang="ts">
  import { GameMode, gameState, setGameMode, setPlayerName } from '$lib/stores/game-state-store';
  
  // State
  let playerName = $state($gameState.playerName);
  let selectedMode = $state<GameMode | null>(null);
  let showSettings = $state(false);
  
  // Derived values
  const buttonClass = $derived(`px-6 py-3 text-lg font-bold rounded-md transition-all duration-200 shadow-lg 
    hover:shadow-xl hover:scale-105 active:scale-95`);
  
  const primaryButtonClass = $derived(`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`);
  const secondaryButtonClass = $derived(`${buttonClass} bg-gray-700 hover:bg-gray-800 text-white`);
  const dangerButtonClass = $derived(`${buttonClass} bg-red-600 hover:bg-red-700 text-white`);
  
  // Methods
  function startGame(mode: GameMode): void {
    // Save player name
    if (playerName.trim() !== $gameState.playerName) {
      setPlayerName(playerName.trim() || 'Player');
    }
    
    // Set game
    setGameMode(mode);
  }
  
  function toggleSettings(): void {
    showSettings = !showSettings;
  }
</script>

<div class="fixed inset-0 flex items-center justify-center z-50">
  <div class="rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700 backdrop-blur-sm">
    <!-- Title -->
    <div class="text-center mb-8">
      <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
        HYPER TRUCK
      </h1>
      <p class="text-gray-400 italic">The physics-defying driving experience</p>
    </div>
    
    <!-- Player Name Input -->
    <div class="mb-6">
      <label for="playerName" class="block text-gray-300 mb-2 font-medium">Driver Name:</label>
      <input 
        type="text" 
        id="playerName" 
        bind:value={playerName}
        class="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your name"
      />
    </div>
    
    <!-- Game Mode Selection -->
    {#if !showSettings}
      <div class="space-y-4 mb-8">
        <h2 class="text-xl font-bold text-gray-200 mb-3">Select Game Mode:</h2>
        
        <button 
          onclick={() => startGame(GameMode.TIME_TRIAL)}
          class={primaryButtonClass}
        >
          <div class="flex flex-col items-start">
            <span class="text-xl">Time Trial</span>
            <span class="text-sm opacity-80">Race against the clock on fixed tracks</span>
          </div>
        </button>
        
        <button 
          onclick={() => startGame(GameMode.INFINITE)}
          class={primaryButtonClass}
        >
          <div class="flex flex-col items-start">
            <span class="text-xl">Infinite Mode</span>
            <span class="text-sm opacity-80">Drive as far as you can on endless terrain</span>
          </div>
        </button>
      </div>
      
      <!-- Settings Button -->
      <div class="flex justify-between">
        <button 
          onclick={toggleSettings}
          class={secondaryButtonClass}
        >
          Settings
        </button>
        
        <!-- Credits Button - Can be expanded later -->
        <button 
          class={secondaryButtonClass}
        >
          Credits
        </button>
      </div>
    {:else}
      <!-- Settings Panel -->
      <div class="space-y-6 mb-8">
        <h2 class="text-xl font-bold text-gray-200 mb-3">Game Settings</h2>
        
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
        <div class="flex justify-between">
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
    {/if}
  </div>
</div>
