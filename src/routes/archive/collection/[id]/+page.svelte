<script>
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import RecordCard from '$lib/ui/RecordCard.svelte';
	import { getCollectionRecords } from '../../data.remote';
	let { params } = $props();
	const { records, collection } = $derived(await getCollectionRecords(params.id));
</script>

<Container>
	<div class="flex gap-10 py-10">
		<Header text={`${collection.title} Collection`} />
		<div class="grid grid-cols-5 gap-5">
			{#each records as record}
				<RecordCard {record} />
			{/each}
		</div>
	</div>
</Container>
