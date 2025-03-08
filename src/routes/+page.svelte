<script lang="ts">
	import { createPhaserGame } from '$lib/game/phaser-game';
	
	let gameContainer = $state<HTMLDivElement | undefined>();
	let cleanup = $state<(() => void) | null>(null);
	let gameMode = $state<'normal' | 'infinite'>('normal');
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
				mode: gameMode
			});
		}
	}
	
	// Toggle game mode
	function toggleGameMode(): void {
		gameMode = gameMode === 'normal' ? 'infinite' : 'normal';
		restartGame();
	}
	
	// Toggle controls visibility
	function toggleControls(): void {
		showControls = !showControls;
	}
	
	$effect(() => {
		if (gameContainer) {
			// Initialize Phaser game with the container element
			cleanup = createPhaserGame({
				parent: gameContainer,
				width: gameContainer.clientWidth,
				height: gameContainer.clientHeight,
				mode: gameMode
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
		<!-- <button 
			onclick={toggleGameMode}
			class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors shadow-lg"
		>
			{gameMode === 'normal' ? 'Switch to Infinite Mode' : 'Switch to Normal Mode'}
		</button> -->
		
		<button 
			onclick={toggleControls}
			class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-md transition-colors shadow-lg"
		>
			{showControls ? 'Hide Controls' : 'Show Controls'}
		</button>
	</div>
	
	<!-- Controls Panel -->
	{#if showControls}
		<div class="absolute bottom-4 left-4 bg-gray-900 bg-opacity-80 p-4 rounded-md text-white shadow-lg z-10">
			<h3 class="font-bold text-lg mb-2">Controls</h3>
			<ul class="list-disc pl-5 space-y-1">
				<li>Right Arrow: Accelerate</li>
				<li>Left Arrow: Brake/Reverse</li>
				<li>Space: Nitro Boost</li>
			</ul>
			<div class="mt-4 text-sm">
				<p><strong>Infinite Mode:</strong> Drive as far as you can on procedurally generated terrain.</p>
				<p><strong>Normal Mode:</strong> Complete the track in the fastest time possible.</p>
			</div>
		</div>
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
</style>