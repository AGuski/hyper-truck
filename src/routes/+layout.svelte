<script lang="ts">
	import '../app.css';
	import OrientationHandler from '$lib/components/OrientationHandler.svelte';
	let { children } = $props();
</script>

<OrientationHandler>
	{@render children()}
</OrientationHandler>
