<script>
	import { onMount } from 'svelte';
	import Wonderscroll from '../../src/Wonderscroll';

	const elements = [];

	onMount(() => {
		elements.forEach((element, i) => {

			const isOdd = !!(i % 2);

			new Wonderscroll(element, {
				mutators: {
					y: {
						from: 100 * (isOdd ? -1 : 1) ,
						to: -100 * (isOdd ? -1 : 1),
						ease: 'InQuad'
					},
					x: {
						from: 100 * (isOdd ? -1 : 1) ,
						to: -100 * (isOdd ? -1 : 1),
						ease: 'InQuad'
					},
					backgroundColor: {
						mode: 'rgba',
						from: '#123123',
						to: 'rgba(255, 0, 150, 0.5)'
					}
				}
			});
		});
	});
</script>
<main>
	{#each Array(200) as _, i}
		<section bind:this={elements[i]}></section>
	{/each}
</main>

<style>
	main {
		width: 90vw;
		display: flex;
		flex-wrap: wrap;
	}
	section {
		width: 20%;
		height: 30vh;
		background-color: bisque;
	}
	section:nth-child(odd) {
		height: 25vh;
		background-color: beige;
	}
</style>