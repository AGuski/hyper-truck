<script lang="ts">
import { deviceInfo, Orientation } from '$lib/stores/device-store';
import { onMount } from 'svelte';

// Track fullscreen state
let isFullscreen = $state(false);

// Function to toggle fullscreen
async function toggleFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      isFullscreen = true;
    } else {
      await document.exitFullscreen();
      isFullscreen = false;
    }
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
  }
}

// Listen for fullscreen change events
function handleFullscreenChange(): void {
  isFullscreen = !!document.fullscreenElement;
}

// Determine if we should show rotation UI
const shouldRotate = $derived(
  $deviceInfo.isMobile && 
  $deviceInfo.orientation === Orientation.PORTRAIT
);

// Set up event listeners
onMount(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  };
});

let { children } = $props();
</script>

<div class="orientation-handler">
  <!-- Fullscreen toggle button -->
  <button 
    class="fullscreen-toggle" 
    onclick={toggleFullscreen}
    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
  >
    {#if isFullscreen}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
      </svg>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
    {/if}
  </button>
  
  <!-- Rotation overlay for mobile portrait mode -->
  {#if shouldRotate}
    <div class="rotation-overlay">
      <div class="rotation-content">
        <div class="rotation-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c-2.5 0-4.9-1-6.7-2.8M3 12a9 9 0 0 1 9-9m-9 9c0-2.5 1-4.9 2.8-6.7"></path>
            <path d="M16 16l-4-4 4-4"></path>
          </svg>
        </div>
        <p class="rotation-message">Please rotate your device</p>
        <p class="rotation-submessage">HYPER TRUCK works best in landscape mode and full screen.</p>
        
        {#if !isFullscreen}
          <button class="fullscreen-button" onclick={toggleFullscreen}>
            Enter Fullscreen
          </button>
        {/if}
      </div>
    </div>
  {/if}
  
  <!-- Apply rotation to the app when in portrait mode and fullscreen -->
  {#if shouldRotate && isFullscreen}
    <div class="app-rotator">
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
</div>

<style>
  .orientation-handler {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .fullscreen-toggle {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1000;
    transition: background-color 0.2s;
  }
  
  .fullscreen-toggle:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  .rotation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .rotation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    color: white;
  }
  
  .rotation-icon {
    animation: rotate 2s infinite;
    margin-bottom: 20px;
  }
  
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(90deg); }
    50% { transform: rotate(90deg); }
    75% { transform: rotate(90deg); }
    100% { transform: rotate(0deg); }
  }
  
  .rotation-message {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .rotation-submessage {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 20px;
  }
  
  .fullscreen-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .fullscreen-button:hover {
    background-color: #45a049;
  }
  
  .app-rotator {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vh;
    height: 100vw;
    transform-origin: top left;
    transform: rotate(90deg) translateY(-100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
</style>
