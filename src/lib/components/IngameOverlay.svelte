<script lang="ts">
import { deviceInfo } from '$lib/stores/device-store';
import { onMount } from 'svelte';
import { InputEvent } from '$lib/input/input-controller';

// Function to dispatch throttle events
function dispatchThrottleStart(): void {
  const event = new KeyboardEvent('keydown', {
    code: 'ArrowRight',
    key: 'ArrowRight',
    bubbles: true
  });
  document.dispatchEvent(event);
}

function dispatchThrottleEnd(): void {
  const event = new KeyboardEvent('keyup', {
    code: 'ArrowRight',
    key: 'ArrowRight',
    bubbles: true
  });
  document.dispatchEvent(event);
}

// Function to dispatch brake events
function dispatchBrakeStart(): void {
  const event = new KeyboardEvent('keydown', {
    code: 'ArrowLeft',
    key: 'ArrowLeft',
    bubbles: true
  });
  document.dispatchEvent(event);
}

function dispatchBrakeEnd(): void {
  const event = new KeyboardEvent('keyup', {
    code: 'ArrowLeft',
    key: 'ArrowLeft',
    bubbles: true
  });
  document.dispatchEvent(event);
}

// Track button press states
let throttlePressed = $state(false);
let brakePressed = $state(false);

// Handle touch events for mobile throttle button
function handleThrottleTouchStart(): void {
  throttlePressed = true;
  dispatchThrottleStart();
}

function handleThrottleTouchEnd(): void {
  throttlePressed = false;
  dispatchThrottleEnd();
}

// Handle touch events for mobile brake button
function handleBrakeTouchStart(): void {
  brakePressed = true;
  dispatchBrakeStart();
}

function handleBrakeTouchEnd(): void {
  brakePressed = false;
  dispatchBrakeEnd();
}

// Ensure events are properly cleaned up when component is destroyed
onMount(() => {
  return () => {
    // If buttons are still pressed when component unmounts, release them
    if (throttlePressed) {
      dispatchThrottleEnd();
    }
    if (brakePressed) {
      dispatchBrakeEnd();
    }
  };
});
</script>

<div class="ingame-overlay">
  <!-- Only show mobile controls on mobile devices -->
  {#if $deviceInfo.isMobile}
    <div class="mobile-controls">
      <!-- Throttle button (right side) -->
      <button
        class="control-button throttle-button {throttlePressed ? 'active' : ''}"
        onpointerdown={handleThrottleTouchStart}
        onpointerup={handleThrottleTouchEnd}
        onpointercancel={handleThrottleTouchEnd}
        onpointerleave={handleThrottleTouchEnd}
      >
        <span class="control-icon">▶</span>
      </button>
      
      <!-- Brake button (left side) -->
      <button
        class="control-button brake-button {brakePressed ? 'active' : ''}"
        onpointerdown={handleBrakeTouchStart}
        onpointerup={handleBrakeTouchEnd}
        onpointercancel={handleBrakeTouchEnd}
        onpointerleave={handleBrakeTouchEnd}
      >
        <span class="control-icon">◀</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .ingame-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
  }
  
  .mobile-controls {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    pointer-events: none;
  }
  
  .control-button {
    position: fixed;
    bottom: 20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: white;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.1s, transform 0.1s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  .throttle-button {
    right: 20px;
  }
  
  .brake-button {
    left: 20px;
  }
  
  .control-button.active {
    transform: scale(0.95);
  }
  
  .throttle-button.active {
    background-color: rgba(76, 175, 80, 0.7);
  }
  
  .brake-button.active {
    background-color: rgba(244, 67, 54, 0.7);
  }
  
  .control-icon {
    font-size: 32px;
  }
</style>