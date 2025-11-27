<script lang="ts">
	import Icon from '@iconify/svelte';
	let { message, type = 'success' } = $props();
</script>

<!-- TODO - Animate the messages -->
<!-- TODO - Close the message -->
{#if type === 'success'}
	<div role="alert" class="alert alert-success">
		<Icon icon="lucide:info" class="text-xl" />
		<span>{message}</span>
	</div>
{:else if type === 'error'}
	<div class="flex items-center gap-2 bg-red-800 p-2 text-white">
		<Icon icon="lucide:message-square-warning" class="text-2xl" />
		<span class="grow p-1">{message}</span>
		<!-- <Icon icon="lucide:circle-x" class="text-2xl" /> -->
	</div>
{/if}
