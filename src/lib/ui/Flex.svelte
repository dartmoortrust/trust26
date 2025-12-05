<script lang="ts">
	let { children, col = false } = $props();
	let css = $derived(`flex gap-5 ${col && 'flex-col'}`);
</script>

<div class="flex gap-5">{@render children()}</div>
