<script>
	import Icon from '@iconify/svelte';
	const { icon, text, href = '' } = $props();
</script>

{#if href !== ''}
	<a {href} class="flex items-center gap-2 underline transition-all hover:decoration-pink-800">
		<Icon {icon} class="text-xl" />
		{text}
	</a>
{:else}
	<div class="flex items-center gap-2">
		<Icon {icon} class="text-xl" />
		{text}
	</div>
{/if}
