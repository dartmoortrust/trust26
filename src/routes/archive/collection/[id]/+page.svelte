<script>
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import Search from '$lib/ui/Search.svelte';

	let { params } = $props();

	const searchParams = $derived({
		q: '',
		query_by: '*',
		filter_by: `collection_id:${params.id}`,
		page: 1,
		per_page: 25
	});
</script>

<Container py>
	<div class="flex flex-col gap-10">
		<Header text={'Collection test'} />
		<Search {searchParams} />
	</div>
</Container>

<!-- <Container>
	<div class="flex gap-10 py-10">
		<div>
			<Header text={`${collection.title} Collection`} />
		</div>
		<div class="grid grid-cols-5 gap-5">
			{#each records.hits as { document }}
				<RecordCard record={document} />
			{/each}
		</div>
	</div>
</Container> -->
