<script>
	import { onMount } from 'svelte';
	import Wonderscroll from './wonderscroll/Wonderscroll';

	let w;
	let element;
	let w2;
	let element2;

	onMount(() => {
		w = new Wonderscroll(element, {
			ref: 'top',
			from: 1,
			to: 0,
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
						unit: 'deg',
						ease: 'easeOutQuint'
					}
				},
			}
		});
		w2 = new Wonderscroll(element2, [
			{
				ref: 'top',
				from: 1,
				to: 0.25,
				properties: {
					transform: {
						translateY: {
							from: 100,
							to: 0,
							unit: '%',
							ease: 'easeInCubic'
						}
					},
					opacity: {
						from: 0,
						to: 1,
						ease: 'easeInCubic'
					},
					borderRadius: {
						from: 0,
						to: 35,
						unit: 'px'
					}
				}
			},
			{
				ref: 'bottom',
				from: 0.5,
				to: 0,
				properties: {
					transform: {
						translateY: {
							from: 0,
							to: -100,
							unit: '%',
							ease: 'easeOutCubic'
						}
					},
					opacity: {
						from: 1,
						to: 0,
						ease: 'easeOutCubic'
					}
				}
			}
		])
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