<script lang="ts">
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import Search from '$lib/ui/Search.svelte';

	let searchParams = {
		q: 'Christow',
		page: 1,
		per_page: 25,
		query_by: '*'
	};
</script>

<Container py>
	<Header text="Search" underline />
	<Search {searchParams} />
</Container>
