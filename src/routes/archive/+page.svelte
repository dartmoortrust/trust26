<script>
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import { getCollections, getRecords } from './data.remote';
</script>

<Container>
	<Header text="Archive" />
	<a href="/archive/search">Search</a>
	<div class="grid grid-cols-2 gap-5">
		<div>
			<ol>
				{#each await getRecords() as { title, id }}
					<li>
						<a href={`/archive/record/${id}`} data-sveltekit-preload-data="tap">{title}</a>
					</li>
				{/each}
			</ol>
		</div>
		<div>
			<ol>
				{#each await getCollections() as { title, id }}
					<li>
						<a href={`/archive/collection/${id}`} data-sveltekit-preload-data="tap">{title}</a>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</Container>
