<script lang="ts">
	const { href = null, label, version = null, type = null } = $props();
	const style = $derived(`${version} p-2 bg-green-700 text-white inline hover:cursor-pointer`);
</script>

<button {type} class={`btn btn-success`} data-sveltekit-preload-data="tap">{label}</button>
