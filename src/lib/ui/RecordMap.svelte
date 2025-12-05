<script lang="ts">
	import { browser } from '$app/environment'; // <-- IMPORT THIS
	import { env } from '$env/dynamic/public';
	import { ll2os } from '$lib/tools/osgb';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount } from 'svelte';

	// ---------------------------------------------------------
	// Props (runes)
	// ---------------------------------------------------------
	let {
		coords = null,
		edit = false,
		position = $bindable<{ lat: number; lng: number } | null>(coords),
		info = true
	} = $props<{
		coords?: { lat: number; lng: number } | null;
		edit?: boolean;
		position?: { lat: number; lng: number } | null;
		info?: boolean;
	}>();

	// ---------------------------------------------------------
	// Internal state
	// ---------------------------------------------------------
	$effect(() => {
		if (position && (position.lat == null || position.lng == null)) {
			position = null;
		}
	});
	let map: maplibregl.Map;
	let marker: maplibregl.Marker | null = null;

	// Helper: create or replace a marker
	function createMarker(pos: { lat: number; lng: number }) {
		if (marker) marker.remove();

		marker = new maplibregl.Marker({
			draggable: edit
		})
			.setLngLat([pos.lng, pos.lat])
			.addTo(map);

		marker.on('dragend', () => {
			const lngLat = marker!.getLngLat();
			// update bindable prop
			position = { lat: lngLat.lat, lng: lngLat.lng };
		});
	}

	// ---------------------------------------------------------
	// Effects
	// ---------------------------------------------------------

	// Initialize map once (FIX APPLIED HERE)

	onMount(() => {
		const initialCenter: [number, number] = position
			? [position.lng, position.lat]
			: [-3.65, 50.65]; // Default coordinates

		const initialZoom = position ? 14 : 7;

		map = new maplibregl.Map({
			container: 'map',
			style: `https://api.os.uk/maps/vector/v1/vts/resources/styles?srs=3857&key=${env.PUBLIC_OS_KEY}`,
			center: initialCenter,
			zoom: initialZoom
		});

		map.addControl(new maplibregl.NavigationControl());
	});

	// Create or update marker when `position` changes
	$effect(() => {
		// Ensure map is initialized and we are on the client
		if (!browser || !map) return;

		if (position) {
			createMarker(position);
			map.setCenter([position.lng, position.lat]);
			map.setZoom(16);
		} else {
			// Optional: Remove marker if position becomes null later
			if (marker) {
				marker.remove();
				marker = null;
			}
		}
	});

	// Handle marker drag enable/disable
	$effect(() => {
		// Ensure we are on the client
		if (!browser || !marker) return;

		marker.setDraggable(edit);
	});

	// In edit mode, allow click-to-create marker when none exists
	$effect(() => {
		// Ensure map is initialized and we are on the client
		if (!browser || !map) return;

		const onClick = (e: maplibregl.MapMouseEvent) => {
			if (!edit) return;
			if (!marker) {
				const { lat, lng } = e.lngLat;
				position = { lat, lng };
				// createMarker will be called by the $effect monitoring `position`
			}
		};

		map.on('click', onClick);
		return () => map.off('click', onClick);
	});
</script>

<div id="map" class="map">
	{#if info}
		<div class="absolute top-2 left-2 z-10 bg-white p-1">
			{#if position}
				{ll2os(position)}
			{/if}
		</div>
	{/if}
</div>

<style>
	.map {
		width: 100%;
		height: 400px;
	}
</style>
