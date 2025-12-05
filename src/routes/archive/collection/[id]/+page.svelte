<script>
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import RecordCard from '$lib/ui/RecordCard.svelte';
	import { getCollectionRecords } from '../../data.remote';
	let { params } = $props();
	const { collection, records } = $derived(
		await getCollectionRecords({ id: params.id, page: 1, per_page: 25 })
	);
</script>

<Container>
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
</Container>
