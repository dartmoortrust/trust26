<script lang="ts">
	import type { SearchResponse } from 'typesense/lib/Typesense/Documents';
	import { searchRecords } from '../../routes/archive/data.remote';
	import RecordCard from './RecordCard.svelte';

	let { searchParams } = $props();
	let results = $state<SearchResponse<object> | null>();
	let loading = $state(true);
	let q = $state<string>('');
	// svelte-ignore state_referenced_locally
	let localParams = $state({ ...searchParams });

	// React to changes in searchParams directly
	$effect(() => {
		loading = true;
		searchRecords(localParams).then((data) => {
			results = data;
			q = data.request_params.q || '';
			loading = false;
		});
	});
</script>

<div class="flex flex-col gap-5">
	<div class="flex items-center gap-3 py-5">
		<input type="text" bind:value={q} placeholder="Search" class="input" />
		<button
			class="btn btn-soft btn-success"
			onclick={() => {
				localParams.q = q;
			}}>Search</button
		>

		{#if results && results.found && results.request_params}
			{@const { found, request_params, page } = results}
			{@const { per_page = 25 } = request_params}
			{@const totalPages = Math.ceil(found / per_page)}

			{#if totalPages > 1}
				<div class="join">
					<button
						disabled={localParams.page === 1}
						onclick={() => {
							localParams.page = page - 1;
						}}
						class="btn join-item">«</button
					>
					<button class="btn join-item">Page {page}/{totalPages}</button>
					<button
						disabled={localParams.page === totalPages}
						onclick={() => {
							localParams.page = page + 1;
						}}
						class="btn join-item">»</button
					>
				</div>
				<select
					class="select"
					value={String(per_page)}
					onchange={(e) => {
						const target = e.currentTarget;
						localParams.per_page = Number(target.value);
					}}
				>
					<option value="25">25 per page</option>
					<option value="50">50 per page</option>
					<option value="100">100 per page</option>
				</select>
			{/if}
			<div class="divider divider-horizontal"></div>

			<div>
				{results?.found || 0} results
				{#if results?.request_params?.q !== ''}
					for {results.request_params.q}
				{/if}
			</div>
		{/if}
	</div>

	{#if !results?.hits?.length}
		No results
	{:else}
		<div class="grid grid-cols-5 gap-10">
			{#each results?.hits as { document }}
				<RecordCard record={document} />
			{/each}
		</div>
	{/if}
</div>
