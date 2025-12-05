<script lang="ts">
	import { idToBlobUrl } from '$lib/tools';

	const imgproxy = 'https://cloud.uksouth.cloudapp.azure.com/images';

	let { record = null, size = 500, crop = false, src = null, alt = '' } = $props();

	let isLoaded = $state(false);
	let hasError = $state(false);

	const transforms = $derived.by(() => {
		if (!record) return '';
		const keys = Object.keys(record.transform);
		let t = '';
		keys.forEach((key) => {
			const value = record.transform[key];
			t += '/' + key + ':' + value;
		});
		return t;
	});

	const imageUrl = $derived.by(() => {
		if (record) {
			return `${imgproxy}/insecure/rs:${crop ? 'fill' : 'fit'}:${size}:${size}${transforms}/plain/${idToBlobUrl(record.id)}`;
		} else if (src) {
			return `${imgproxy}/insecure/rs:${crop ? 'fill' : 'fit'}:${size}:${size}${transforms}/plain/${src}`;
		}
		return null;
	});

	const imageAlt = $derived(record?.title || alt || 'Image');

	function handleLoad() {
		isLoaded = true;
		hasError = false;
	}

	function handleError() {
		isLoaded = true;
		hasError = true;
	}

	// Reset loading state when image URL changes
	$effect(() => {
		imageUrl;
		isLoaded = false;
		hasError = false;
	});
</script>

{#if imageUrl}
	<div class="relative w-full" style="aspect-ratio: 1 / 1;">
		<!-- Skeleton loader -->
		{#if !isLoaded}
			<div class="absolute inset-0 skeleton animate-pulse bg-gray-200">
				<div class="flex h-full w-full items-center justify-center">
					<svg
						class="h-12 w-12 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			</div>
		{/if}

		<!-- Actual image -->
		{#if !hasError}
			<img
				class="w-full transition-opacity duration-300"
				class:opacity-0={!isLoaded}
				class:opacity-100={isLoaded}
				src={imageUrl}
				alt={imageAlt}
				onload={handleLoad}
				onerror={handleError}
			/>
		{:else}
			<!-- Error state -->
			<div class="flex h-full w-full items-center justify-center bg-gray-100">
				<div class="text-center text-gray-400">
					<svg class="mx-auto mb-2 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p class="text-sm">Failed to load image</p>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-400">
		<span>No image</span>
	</div>
{/if}
