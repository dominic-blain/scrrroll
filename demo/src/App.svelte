<script>
	import { onMount } from 'svelte';

	const elements = [];

	onMount(() => {
		elements.forEach(element => {
			new Wonderscroll(element, [{
				params: {
					edge: 'both',
					from: 0.25,
					to: 0
				},
				mutators: {
					y: {
						from: 0,
						to: -300,
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
					edge: 'top',
					from: 1,
					to: 0.75
				},
				mutators: {
					y: {
						from: -200,
						to: 0,
						ease: 'OutQuad',
						unit: "%"
					},
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
			}], {
				debug: true
			});
		});
	});
</script>
<main>
	{#each Array(1) as _, i}
		<section bind:this={elements[i]} class="wonderscroll"></section>
	{/each}
	<section></section>
</main>

<style>
	main {
		margin: 200vh 0;
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