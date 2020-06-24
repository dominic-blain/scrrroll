<script>
	import { onMount } from 'svelte';

	let elements;

	onMount(() => {
		elements = new Wonderscroll([{
			params: {
				edge: 'top',
				from: 0.2,
				to: 0
			},
			mutators: {
				y: {
					from: 0,
					to: -100,
					ease: 'InQuad'
				},
				backgroundColor: {
					mode: 'rgba',
					from: '#123123',
					to: 'rgba(255, 0, 150, 0.5)'
				}
			}
		},
		{
			params: {
				edge: 'end',
				from: 1,
				to: 0.8
			},
			mutators: {
				r: {
					from: 9,
					to: 0,
					unit: 'deg',
					ease: 'QuadOut'
				},
				opacity: {
					from: 0,
					to: 1,
					unit: '',
					ease: 'QuadOut'
				}
			}
		}])
	});
</script>
<main>
	{#each Array(200) as _, i}
		<section class="wonderscroll"></section>
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