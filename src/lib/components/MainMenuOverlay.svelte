<script lang="ts">
  import { GameMode, gameState, setGameMode, setPlayerName } from '$lib/stores/game-state-store';
  
  // State
  let playerName = $state($gameState.playerName);
  let selectedMode = $state<GameMode | null>(null);
  let showSettings = $state(false);
  
  // Derived values
  const buttonClass = $derived(`px-6 py-3 text-lg font-bold rounded-md transition-all duration-200 shadow-lg 
    hover:shadow-xl hover:scale-105 active:scale-95`);
  
  // Use the gradient background for all buttons
  const primaryButtonClass = $derived(`${buttonClass} gradient-bg text-white`);
  const secondaryButtonClass = $derived(`${buttonClass} gradient-bg text-white`);
  const dangerButtonClass = $derived(`${buttonClass} gradient-bg text-white`);
  
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
  <div class="rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700 backdrop-blur-sm mb-8"> 
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

<style>
  /* Reusable gradient background for buttons and other elements */
  :global(.gradient-bg) {
    background: linear-gradient(to right, #3b82f6, #8b5cf6);
    transition: all 0.3s ease;
  }
  
  :global(.gradient-bg:hover) {
    background: linear-gradient(to right, #2563eb, #7c3aed);
  }
  
  /* Gradient text for ASCII art title */
  :global(.gradient-text) {
    background: linear-gradient(to right, #3b82f6, #8b5cf6);
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
  
  /* GitHub link glow effect */
  .github-link {
    position: relative;
    transition: all 0.3s ease;
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
