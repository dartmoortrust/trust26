<script lang="ts">
	const {
		currentPage = 1,
		perPage = 25,
		totalCount,
		onPageChange
	}: {
		currentPage?: number;
		perPage?: number;
		totalCount: number;
		onPageChange?: (page: number) => void;
	} = $props();

	const totalPages = $derived.by(() => {
		if (totalCount) {
			return Math.ceil(totalCount / perPage);
		}
		return 0;
	});

	function goToPreviousPage() {
		if (currentPage > 1 && onPageChange) {
			onPageChange(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (currentPage < totalPages && onPageChange) {
			onPageChange(currentPage + 1);
		}
	}
</script>

{#if totalPages > 0}
	<div class="join">
		<button
			class="btn join-item"
			disabled={currentPage === 1}
			onclick={goToPreviousPage}
			aria-label="Previous page"
		>
			«
		</button>

		<button class="btn join-item" disabled>
			Page {currentPage} of {totalPages}
		</button>

		<button
			class="btn join-item"
			disabled={currentPage === totalPages}
			onclick={goToNextPage}
			aria-label="Next page"
		>
			»
		</button>
	</div>
{/if}
