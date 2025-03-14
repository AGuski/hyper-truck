<script lang="ts">
import { deviceInfo, Orientation } from '$lib/stores/device-store';

// Optional props for customization
const props = $props<{
  showDetails?: boolean;
}>();

// Local state
let showDetails = $state(props.showDetails ?? false);

// Toggle details visibility
function toggleDetails(): void {
  showDetails = !showDetails;
}
</script>

<div class="device-info-display">
  {#if $deviceInfo.isMobile}
    <div class="device-badge mobile">
      <span>Mobile Device</span>
      <span class="orientation-indicator">
        {$deviceInfo.orientation === Orientation.PORTRAIT ? '📱' : '📱↔️'}
      </span>
    </div>
  {:else}
    <div class="device-badge desktop">
      <span>Desktop Device</span>
      <span class="orientation-indicator">🖥️</span>
    </div>
  {/if}
  
  {#if showDetails}
    <div class="device-details">
      <p><strong>Device Type:</strong> {$deviceInfo.isMobile ? 'Mobile' : 'Desktop'}</p>
      <p><strong>Orientation:</strong> {$deviceInfo.orientation}</p>
      <p><strong>Screen Size:</strong> {$deviceInfo.width}x{$deviceInfo.height}</p>
    </div>
  {/if}
  
  <button onclick={toggleDetails} class="details-toggle">
    {showDetails ? 'Hide Details' : 'Show Details'}
  </button>
</div>

<style>
  .device-info-display {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    padding: 10px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 200px;
  }
  
  .device-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .mobile {
    color: #4ade80;
  }
  
  .desktop {
    color: #60a5fa;
  }
  
  .orientation-indicator {
    font-size: 18px;
  }
  
  .device-details {
    font-size: 12px;
    margin: 8px 0;
    width: 100%;
  }
  
  .device-details p {
    margin: 4px 0;
  }
  
  .details-toggle {
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }
  
  .details-toggle:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
</style>
