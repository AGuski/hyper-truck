<script lang="ts">
	import { createPhaserGame } from '$lib/phaser-game';
	import { GameMode, gameState, setGameMode } from '$lib/stores/game-state-store';
	import MainMenuOverlay from '$lib/components/MainMenuOverlay.svelte';
	import { onMount } from 'svelte';
    import DeviceInfoDisplay from '$lib/components/DeviceInfoDisplay.svelte';
    import IngameOverlay from '$lib/components/IngameOverlay.svelte';

	// Button styles matching MainMenuOverlay
	const buttonClass = $derived(`px-3 py-1.5 text-base font-bold transition-all duration-300 shadow-lg 
		rounded-lg select-none btn-base text-white/90 cursor-pointer`);
	const secondaryButtonClass = $derived(`${buttonClass} gradient-border-secondary`);
	
	let gameContainer = $state<HTMLDivElement | undefined>();
	let cleanup = $state<(() => void) | null>(null);
	let showControls = $state(false);
	
	const gameContainerClass = $derived('w-screen h-screen bg-gray-900 relative');
	
	// Restart the game when mode changes
	function restartGame(): void {
		// Clean up existing game if any
		if (cleanup) {
			cleanup();
			cleanup = null;
		}
		
		// Start new game with selected mode
		if (gameContainer) {
			cleanup = createPhaserGame({
				parent: gameContainer,
				width: gameContainer.clientWidth,
				height: gameContainer.clientHeight,
				mode: $gameState.currentMode
			});
		}
	}
	
	// Toggle controls visibility
	function toggleControls(): void {
		showControls = !showControls;
	}
	
	onMount(() => {
		if (gameContainer) {
			// Initialize Phaser game with the container element
			cleanup = createPhaserGame({
				parent: gameContainer,
				width: gameContainer.clientWidth,
				height: gameContainer.clientHeight,
				mode: $gameState.currentMode
			});
		}
		
		return () => {
			if (cleanup) {
				cleanup();
			}
		};
	});
</script>

<div 
	bind:this={gameContainer} 
	class={gameContainerClass}
>	
	<!-- Game UI Overlay -->
	<div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
		<button 
			onclick={toggleControls}
			class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-md transition-colors shadow-lg"
		>
			{showControls ? 'Hide Controls' : 'Show Controls'}
		</button>
		
		<!-- Only show menu button when not in menu mode -->
		{#if $gameState.currentMode !== GameMode.MENU}
			<button 
				onclick={() => setGameMode(GameMode.MENU)}
				class={secondaryButtonClass}
			>
				Main Menu
			</button>
		{/if}
	</div>
	
	<!-- Controls Panel -->
	{#if showControls}
		<div class="absolute bottom-4 left-4 bg-gray-900 bg-opacity-80 p-4 rounded-md text-white shadow-lg z-10">
			<h3 class="font-bold text-lg mb-2">Controls</h3>
			<ul class="list-disc pl-5 space-y-1">
				<li>Right Arrow / D Key: Accelerate</li>
				<li>Left Arrow / A Key: Brake/Reverse</li>
				<li>Shift: Nitro Boost</li>
				<li class="mt-2 font-semibold">Drive Modes (Number Keys):</li>
				<li>1: Front-Wheel Drive</li>
				<li>2: Rear-Wheel Drive</li>
				<li>3: All-Wheel Drive</li>
			</ul>
			<div class="mt-4 text-sm">
				<p><strong>Infinite Mode:</strong> Drive as far as you can on procedurally generated terrain.</p>
				<p><strong>Time Trial Mode:</strong> Complete the track in the fastest time possible.</p>
			</div>
		</div>
	{/if}
	
	<!-- Main Menu Overlay -->
	{#if $gameState.currentMode === GameMode.MENU}
		<MainMenuOverlay />
	{:else}
		<IngameOverlay />
	{/if}
</div>

<style>
	/* Ensure the game container takes up the full viewport */
	:global(body, html) {
		overflow: hidden;
		margin: 0;
		padding: 0;
		height: 100%;
		width: 100%;
	}

	/* Button gradient styles matching MainMenuOverlay */
	:global(.gradient-border-secondary) {
		background: rgb(17 24 39 / 0.9);
		border: 2px solid transparent;
		background-clip: padding-box;
		position: relative;
	}

	:global(.gradient-border-secondary::before) {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		margin: -2px;
		border-radius: inherit;
		background: linear-gradient(to right, #64748b, #94a3b8);
	}
</style>