<script>
	import { onMount } from 'svelte';
	import Wonderscroll from './wonderscroll/Wonderscroll';

	let w;
	let element;

	onMount(() => {
		w = new Wonderscroll(element, {
			ref: 'top',
			from: 1,
			to: 0.25,
			properties: {
				transform: {
					translateY: {
						from: 100,
						to: -100,
						unit: 'px'
					},
					translateX: {
						from: -100,
						to: 100,
						unit: 'px'
					},
					rotate: {
						from: 0,
						to: 15,
						unit: 'deg'
					}
				},
			}
		});
	});
</script>

<section></section>
<section></section>
<section></section>
<section></section>
<section bind:this={element}>me!</section>
<section></section>
<section></section>
<section ></section>

<style>
	section {
		width: 90vw;
		margin: 5vh auto;
		height: 30vh;
		background-color: bisque;
	}
	section:nth-child(odd) {
		height: 25vh;
		background-color: beige;
	}
</style>