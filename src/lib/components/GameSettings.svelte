<script lang="ts">
import { gameState } from '$lib/stores/game-state-store';

// Props with proper types
const props = $props<{
  onBack: () => void;
  secondaryButtonClass: string;
  dangerButtonClass: string;
}>();
</script>

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
      onclick={props.onBack}
      class={props.secondaryButtonClass}
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
      class={props.dangerButtonClass}
    >
      Reset Settings
    </button>
  </div>
</div>
