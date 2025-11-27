<script lang="ts">
	import { ll2os } from '$lib/tools/osgb.js';
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import Image from '$lib/ui/Image.svelte';
	import RecordInfoBox from '$lib/ui/RecordInfoBox.svelte';
	import { getRecord } from '../../data.remote';
	import RecordMap from '$lib/ui/RecordMap.svelte';
	let { params } = $props();
	const record = $derived(await getRecord(params.id));
	const dateText = $derived(`
		${record.date_day ? record.date_day : '?'}/${record.date_month ? record.date_month : '?'}/${record.date_year ? record.date_year : '?'} ${record.date_estimated ? '(circa)' : ''}
	`);
	let locationText = $derived.by(() => {
		return `${record.x ? record.x : ''}/${record.y ? record.y : ''} | ${ll2os({ lat: record.y, lng: record.x })}`;
	});
</script>

<Container>
	<div class="grid grid-cols-2 gap-10 py-5">
		<div class="flex flex-col gap-5">
			<Header text={record.title} />
			<div class="rounded bg-gray-100 p-2">
				<RecordInfoBox
					text={`${record.coltitle} Collection`}
					icon="lucide:box"
					href={`/archive/collection/${record.colid}`}
				/>
				<RecordInfoBox text={dateText} icon="lucide:calendar" />
				{#if record.x}
					<RecordInfoBox text={locationText} icon="lucide:map-pin" />
				{/if}
			</div>

			<p>{record.detail}</p>
			<a href={`/archive/record/${record.id}/edit`}>Edit</a>
		</div>
		<div>
			<Image {record} />
			{#if record.location_x != null}
				<div class="divider"></div>

				<RecordMap
					position={{
						lat: record.location_y,
						lng: record.location_x
					}}
				/>
			{/if}
		</div>
	</div>
</Container>
