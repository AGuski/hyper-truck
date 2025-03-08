<script lang="ts">
	import { createPhaserGame } from '$lib/game/phaser-game';
	
	let gameContainer = $state<HTMLDivElement | undefined>();
	let cleanup = $state<(() => void) | null>(null);
	
	const gameContainerClass = $derived('w-screen h-screen bg-gray-900');
	
	$effect(() => {
		if (gameContainer) {
			// Initialize Phaser game with the container element
			cleanup = createPhaserGame({
				parent: gameContainer,
				width: gameContainer.clientWidth,
				height: gameContainer.clientHeight
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
></div>

<style>
	/* Custom styles can be added here */
</style>