<script lang="ts">
	import Image from './Image.svelte';

	const { record } = $props();
</script>

<a href={`/archive/record/${record.id}`} class="shadow" data-sveltekit-preload-data="tap">
	<div class="p-1">
		<Image {record} crop={true} />
		<!-- {record.title} -->
	</div>
</a>
