<script>
	import { onMount } from 'svelte';
	import Wonderscroll from './wonderscroll/Wonderscroll';

	let w;
	let element;
	let w2;
	let element2;

	onMount(() => {
		w = new Wonderscroll(element, {
			from: 0.5,
			to: 0,
			mutators: {
				
				y: {
					from: 100,
					to: -100,
					unit: '%',
					ease: 'InQuad'
				}
			}
		});
		// w2 = new Wonderscroll(element2, {
		// 	mutators: {
		// 		marginTop: {
		// 			from: 100,
		// 			to: -100
		// 		}
		// 	}
		// })
	});
</script>

<section></section>
<section></section>
<section></section>
<section></section>
<section bind:this={element}>me!</section>
<section bind:this={element2}>me too!</section>
<section></section>
<section ></section>
<section></section>
<section ></section>
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