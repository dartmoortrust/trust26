<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Container from '$lib/ui/Container.svelte';
	import Header from '$lib/ui/Header.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import RecordCard from '$lib/ui/RecordCard.svelte';
	import { searchRecords } from '../data.remote';

	// Constants
	const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
	const DEFAULT_PER_PAGE = 10;

	// Reactive state derived from URL
	let searchQuery = $state($page.url.searchParams.get('q') || '');
	let currentPage = $state(Number($page.url.searchParams.get('page')) || 1);
	let perPage = $state(Number($page.url.searchParams.get('per_page')) || DEFAULT_PER_PAGE);

	// Search results state
	let searchResults = $state<any>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Derived values
	const results = $derived(searchResults?.hits || []);
	const totalFound = $derived(searchResults?.found || 0);
	const searchString = $derived(
		results.length === 0 ? 'No results found' : `${totalFound.toLocaleString()} results found`
	);

	// Track if we're currently performing a search to prevent loops
	let isSearching = false;

	// React to URL changes (including browser back/forward)
	$effect(() => {
		if (isSearching) return; // Don't react while we're updating the URL

		const urlQuery = $page.url.searchParams.get('q');
		const urlPage = Number($page.url.searchParams.get('page')) || 1;
		const urlPerPage = Number($page.url.searchParams.get('per_page')) || DEFAULT_PER_PAGE;

		// Sync local state with URL
		searchQuery = urlQuery || '';
		currentPage = urlPage;
		perPage = urlPerPage;

		if (urlQuery) {
			performSearch(urlQuery, urlPage, urlPerPage, false); // false = don't update URL
		}
	});

	/**
	 * Performs the search and optionally updates URL
	 */
	async function performSearch(
		query: string,
		pageNum: number,
		resultsPerPage: number,
		updateUrl = true
	) {
		if (!query.trim()) {
			error = 'Please enter a search query';
			return;
		}

		isLoading = true;
		error = null;

		try {
			isSearching = true; // Prevent effect from triggering

			const result = await searchRecords({
				q: query,
				query_by: '*',
				per_page: resultsPerPage,
				page: pageNum
			});

			searchResults = result;

			// Update URL with search parameters (only if requested and different from current)
			if (updateUrl) {
				const currentParams = $page.url.searchParams;
				const needsUpdate =
					currentParams.get('q') !== query ||
					currentParams.get('page') !== String(pageNum) ||
					currentParams.get('per_page') !== String(resultsPerPage);

				if (needsUpdate) {
					const params = new URLSearchParams();
					params.set('q', query);
					params.set('page', String(pageNum));
					params.set('per_page', String(resultsPerPage));

					await goto(`?${params.toString()}`, { replaceState: false, noScroll: true });
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred while searching';
			searchResults = null;
		} finally {
			isLoading = false;
			isSearching = false; // Re-enable effect
		}
	}

	/**
	 * Handle search button click
	 */
	function handleSearch() {
		currentPage = 1; // Reset to first page on new search
		performSearch(searchQuery, 1, perPage, true); // true = update URL
	}

	/**
	 * Handle enter key in search input
	 */
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	/**
	 * Handle page change from pagination
	 */
	function handlePageChange(newPage: number) {
		currentPage = newPage;
		performSearch(searchQuery, newPage, perPage, true); // true = update URL
	}

	/**
	 * Handle per page change
	 */
	function handlePerPageChange() {
		currentPage = 1; // Reset to first page when changing results per page
		performSearch(searchQuery, 1, perPage, true); // true = update URL
	}
</script>

<Container>
	<Header text="Search" underline />

	<!-- Search Controls -->
	<div class="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-6">
		<div class="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl">
			<input
				bind:value={searchQuery}
				onkeypress={handleKeyPress}
				type="search"
				placeholder="Enter search query..."
				class="grow rounded border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
				aria-label="Search query"
			/>

			<select
				bind:value={perPage}
				onchange={handlePerPageChange}
				class="rounded border-2 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
				aria-label="Results per page"
			>
				{#each PER_PAGE_OPTIONS as option}
					<option value={option}>{option} per page</option>
				{/each}
			</select>

			<button
				onclick={handleSearch}
				disabled={isLoading || !searchQuery.trim()}
				class="rounded bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
				aria-label="Search"
			>
				{isLoading ? 'Searching...' : 'Search'}
			</button>
		</div>

		<!-- Results Info -->
		{#if searchResults && !isLoading}
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
				<span class="text-lg font-medium text-gray-700">{searchString}</span>
				{#if totalFound > perPage}
					<Pagination
						{currentPage}
						{perPage}
						totalCount={totalFound}
						onPageChange={handlePageChange}
					/>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="mb-4 rounded border border-red-400 bg-red-50 p-4 text-red-700" role="alert">
			<strong class="font-medium">Error:</strong>
			{error}
		</div>
	{/if}

	<!-- Results Grid -->
	<div class="rounded border-2 border-gray-200 p-4 md:p-6">
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div
						class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"
					></div>
					<p class="text-gray-600">Loading results...</p>
				</div>
			</div>
		{:else if results.length > 0}
			<div
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each results as { document }}
					<RecordCard record={document} />
				{/each}
			</div>
		{:else if searchQuery}
			<div class="py-12 text-center text-gray-500">
				<p class="text-lg">No results found for "{searchQuery}"</p>
				<p class="mt-2">Try adjusting your search terms</p>
			</div>
		{:else}
			<div class="py-12 text-center text-gray-500">
				<p class="text-lg">Enter a search query to get started</p>
			</div>
		{/if}
	</div>
</Container>
