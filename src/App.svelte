<script>
	import { onMount } from 'svelte';
	import Wonderscroll from './wonderscroll/Wonderscroll';

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
						from: 'rgba(0,255,150,0)'
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