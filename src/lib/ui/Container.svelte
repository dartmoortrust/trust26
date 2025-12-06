<script lang="ts">
	let { children, py = false } = $props();
</script>

<div class={`container mx-auto ${py && 'py-10'}`}>{@render children()}</div>
