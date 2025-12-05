<script lang="ts">
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import { getRecord, searchPlaces, updateRecord } from '../../../data.remote';
	import Button from '$lib/ui/Button.svelte';
	import Image from '$lib/ui/Image.svelte';
	import RecordMap from '$lib/ui/RecordMap.svelte';
	import { os2ll } from '$lib/tools/osgb';
	let { params } = $props();
	const record = await getRecord(params.id);

	// svelte-ignore state_referenced_locally

	type Coordinate = { lat: number; lng: number };

	let pos = $state<Coordinate | null>(null);
	if (record) {
		updateRecord.fields.set(record);
		pos = {
			lat: updateRecord.fields.location_y.value(),
			lng: updateRecord.fields.location_x.value()
		};
	}

	$effect(() => {
		if(pos){
			updateRecord.fields.location_x.set(pos.lng ?? null);
			updateRecord.fields.location_y.set(pos.lat ?? null);
		}
	});

	// Place Search
	let placeresults = $state();
	let placequery = $state();
</script>

<Container>
	<div class="grid grid-cols-3 gap-10 py-5">
		<div class="col-span-2 flex flex-col gap-5">
			<Header text="Record Edit" />
			<Header text="Main Information" level={2} underline={false} />
			<form
				{...updateRecord.enhance(async ({ form, data, submit }) => {
					try {
						let result = await submit();
						console.log(result);
						//form.reset();
					} catch (error) {
						alert('Oh no! Something went wrong');
					}
				})}
				class="flex flex-col gap-3"
			>
				<!-- Hidden values -->
				<input {...updateRecord.fields.id.as('text')} hidden />
				<input {...updateRecord.fields.location_x.as('number')} hidden step="any" />
				<input {...updateRecord.fields.location_y.as('number')} hidden step="any" />
				{#each updateRecord.fields.location_x.issues() as issue}
					{@render errormessage(issue)}
				{/each}
				<!-- Visible fields -->
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Title</legend>
					<div class="join">
						<input {...updateRecord.fields.title.as('text')} class="input w-full" />
					</div>

					<p class="label">A sentence, or headline, describing the record.</p>
					{#each updateRecord.fields.title.issues() as issue}
						{@render errormessage(issue)}
					{/each}
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Caption Front</legend>
					<div class="join">
						<input {...updateRecord.fields.caption_front.as('text')} class="input w-full" />
					</div>
					<p class="label">Anything written on the front of the asset.</p>
					{#each updateRecord.fields.caption_front.issues() as issue}
						{@render errormessage(issue)}
					{/each}
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Caption Back</legend>
					<div class="join">
						<input {...updateRecord.fields.caption_back.as('text')} class="input w-full" />
					</div>
					<p class="label">Anything written on the back of the asset.</p>
					{#each updateRecord.fields.caption_back.issues() as issue}
						{@render errormessage(issue)}
					{/each}
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Record Details</legend>
					<div class="join">
						<textarea {...updateRecord.fields.detail.as('text')} class="textarea h-50 w-full"
						></textarea>
					</div>

					<div class="label">
						Descriptive prose with many keywords to aid searches. Use when provided; otherwise add
						later.
					</div>
					{#each updateRecord.fields.detail.issues() as issue}
						{@render errormessage(issue)}
					{/each}
				</fieldset>

				<div class="flex gap-4">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Day</legend>
						<input {...updateRecord.fields.date_day.as('number')} class="input w-full" />
						<p class="label">Day of the month. e.g. 12 or 1</p>
						{#each updateRecord.fields.date_day.issues() as issue}
							{@render errormessage(issue)}
						{/each}
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Month</legend>
						<input {...updateRecord.fields.date_month.as('number')} class="input w-full" />
						<p class="label">Month of the year. e.g. 3 or 10</p>
						{#each updateRecord.fields.date_month.issues() as issue}
							{@render errormessage(issue)}
						{/each}
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Year</legend>
						<input {...updateRecord.fields.date_year.as('number')} class="input w-full" />
						<p class="label">Full year. e.g. 1981 or 2015</p>
						{#each updateRecord.fields.date_year.issues() as issue}
							{@render errormessage(issue)}
						{/each}
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Date Estimated</legend>
						<input
							{...updateRecord.fields.date_estimated.as('checkbox')}
							class="checkbox checkbox-success"
						/>
						{#each updateRecord.fields.date_estimated.issues() as issue}
							{@render errormessage(issue)}
						{/each}
					</fieldset>
				</div>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Notes</legend>
					<div class="join">
						<textarea {...updateRecord.fields.notes.as('text')} class="textarea h-50 w-full"
						></textarea>
					</div>

					<div class="label">Optional</div>
					{#each updateRecord.fields.notes.issues() as issue}
						{@render errormessage(issue)}
					{/each}
				</fieldset>
				<!-- Mapping -->

				<Header text="Location" level={2} underline={true} />
				<div class="flex gap-4">
					<fieldset class="fieldset flex grow items-center">
						<!-- <legend class="fieldset-legend">Location Estimated</legend> -->
						<input
							{...updateRecord.fields.location_estimated.as('checkbox')}
							class="checkbox checkbox-success"
						/> Location Estimated
					</fieldset>
					<fieldset class="fieldset flex">
						<!-- Open the modal using ID.showModal() method -->
						<button
							type="button"
							class="btn"
							onclick={() => document.getElementById('my_modal_1').showModal()}
							>Location Search</button
						>
						<dialog id="my_modal_1" class="modal">
							<div class="modal-box space-y-4">
								<h3 class="text-lg font-bold">Location Search</h3>
								<input id="placequery" class="input" bind:value={placequery} />
								<button
									class="btn"
									type="button"
									onclick={async () => {
										placeresults = await searchPlaces(placequery);
									}}>Search</button
								>
								<ul class="list">
									{#each placeresults as place}
										<button
											type="button"
											class="list-row"
											onclick={() => {
												pos = {
													lat: place.y,
													lng: place.x
												};
											}}
										>
											{place.name1}
										</button>
									{/each}
								</ul>

								<p class="py-4">Press ESC key or click the button below to close</p>
							</div>
						</dialog>
						<!-- Open the modal using ID.showModal() method -->
						<button class="btn" onclick={() => document.getElementById('my_modal_2').showModal()}
							>Enter OS Grid Reference</button
						>
						<dialog id="my_modal_2" class="modal">
							<div class="modal-box space-y-4">
								<h3 class="text-lg font-bold">OS Grid Reference Search</h3>
								<p>
									Enter an OS Grid Reference - for example SX123456 - this can be 6, 8 or 10 digits
									excluding the leading letters.
								</p>
								<input id="placequery" class="input" bind:value={placequery} />
								<button
									class="btn"
									type="button"
									onclick={async () => {
										const { lat, lng } = os2ll(String(placequery));
										pos = { lat, lng };
									}}>Search</button
								>
								<p class="py-4">Press ESC key to close</p>
							</div>
						</dialog>
					</fieldset>
				</div>

				<RecordMap bind:position={pos} edit />
				<Button type="submit" label="Save" />
			</form>
		</div>
		<div class="flex flex-col gap-4">
			<a href={`/archive/record/${record.id}`} data-sveltekit-preload-data="tap">View Record</a>

			<Image {record} />
			<div class="overflow-wrap flex flex-wrap text-wrap">
				{JSON.stringify(updateRecord.fields.value())}
			</div>
		</div>
	</div>
</Container>

{#snippet errormessage(issue: any)}
	<p class="bg-red-400 p-1 font-bold text-white">{issue.message}</p>
{/snippet}
