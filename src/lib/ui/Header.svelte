<script lang="ts">
	import { getRandomGradient } from '$lib/tools';
	const { text, level = 1, underline = false } = $props();
	let borderCss = getRandomGradient();
</script>

{#if text}
	<div>
		{#if level === 1}
			<h1 class="text-5xl font-bold">{text}</h1>
		{:else if level === 2}
			<h2 class="text-3xl font-bold">{text}</h2>
		{:else if level === 3}
			<h3 class="text-xl">{text}</h3>
		{/if}
		{#if underline}
			<div class={`${borderCss} h-0.5`}></div>
		{/if}
	</div>
{/if}
