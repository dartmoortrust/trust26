<script lang="ts">
	import { idToBlobUrl } from '$lib/tools';
	const { record, size = 500, crop = false } = $props();
</script>

{#if record}
	<img
		class="w-full"
		src={`/api/image?url=${idToBlobUrl(record.id)}&s=${size}${crop ? '&c=true' : ''}`}
		alt="Resized"
	/>
{:else}
	<div>None</div>
{/if}
