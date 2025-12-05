<script lang="ts">
	import Container from '$lib/ui/Container.svelte';
	import Flex from '$lib/ui/Flex.svelte';
	import Header from '$lib/ui/Header.svelte';
	import Image from '$lib/ui/Image.svelte';
	import { getTrustee } from '../../../archive/data.remote';
	let { params } = $props();
	const trustee = $derived(await getTrustee(params.id));
</script>

<Container>
	<Flex>
		<div class="basis-2/3">
			<Header text={trustee.name} underline />
			<p>{trustee.detail}</p>
		</div>
		<div class="basis-1/3">
			<Image
				src={`https://dartmoor.blob.core.windows.net/assets/${trustee.image_url}`}
				alt={trustee.name}
			/>
		</div>
	</Flex>
</Container>
