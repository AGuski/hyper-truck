<script lang="ts">
	import { initCarSimulation } from '$lib/game';
	
	let canvasContainer = $state<HTMLDivElement | undefined>();
	let cleanup = $state<(() => void) | null>(null);
	
	const canvasContainerClass = $derived('w-[70vh] h-[70vh]');
	
	$effect(() => {
		if (canvasContainer) {
			cleanup = initCarSimulation(canvasContainer);
		}
		
		return () => {
			if (cleanup) {
				cleanup();
			}
		};
	});
</script>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Car Physics Simulation</h1>
	
	<div class="bg-gray-100 rounded-lg p-2 mb-4">
		<p class="text-sm">Controls:</p>
		<ul class="text-sm list-disc pl-5">
			<li>Left/Right Arrow: Accelerate car</li>
			<li>Up/Down Arrow: Change spring frequency</li>
		</ul>
	</div>
	
	<div 
		bind:this={canvasContainer} 
		class={canvasContainerClass}
	></div>
</div>

<style>
	/* Custom styles can be added here */
</style>