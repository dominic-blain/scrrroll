<script>
	import { onMount } from 'svelte';

	onMount(() => {
		new Wonderscroll('h1, small', {
			params: {
				edge: 'end',
				from: 0.25,
				to: 0
			},
			mutators: {
				y: {
					from: 0,
					to: -100,
					ease: 'InQuad'
				},
				scale: {
					from: 1,
					to: 2,
					unit: '',
					ease: 'InQuad'
				},
				color: {
					from: '#fe2b26',
					to: '#264ffe'
				}
			}
		}, {
			debug: true
		});
	});
</script>

<aside>
<ul>
	<li>
		<a href="#introduction">Introduction</a>
		<ul>
			<li><a href="#why-wonderscroll">Why Wonderscroll?</a></li>
			<li><a href="#core-concepts">Core Concepts</a></li>
		</ul>
	</li>
	<li>
		<a href="#get-started">Get Started</a>
		<ul>
			<li><a href="#installation">Installation</a></li>
			<li><a href="#basic-usage">Basic Usage</a></li>
		</ul>
	</li>
	<li>
		<a href="#api">API</a>
		<ul>
			<li><a href="#wonderscroll">Wonderscroll</a></li>
			<li><a href="#observer">Observer</a></li>
			<li><a href="#mutator">Mutator</a></li>
			<li><a href="#default-mutator">Default Mutator</a></li>
			<li><a href="#transform-mutator">Transform Mutator</a></li>
			<li><a href="#color-mutator">Color Mutator</a></li>
		</ul>
	</li>
	<li>
		<a href="#demos">Demos</a>
		<ul>
			<li>TODO</li>
		</ul>
	</li>
</ul>
</aside>

<main>
	<header>
		<h1>Wonderscroll</h1>
		<small>0.0.1</small>
	</header>
	
	<section id="introduction" class="wonderscroll">
		<h2>Introduction</h2>
		<p class="emphasis">Wonderscroll is yet another javascript library for animating css properties based on scroll values. <strong>It is in early stage and many issues can still arise.</strong></p>
		<h3 id="why-wonderscroll">Why Wonderscroll</h3>
		<p>Why not? This project exists mostly as a learning project, but its aim is to be usable in production. It is used to tween css properties between a start and finish value. It is not used to trigger css animations or transitions.</p>
		<h3 id="core-concepts">Core Concepts</h3>
		<p>Their are 3 main objects: <strong>Wonderscroll, Observer and Mutator.</strong> Those three work together in order to efficiently modify an element' style. 
		The Wonderscroll object is the conductor and manages its own observer(s) and their related mutator(s). 
		Observers can set their own start and end point in relation to the screen position of the element and they know which mutators to apply. 
		They track progress between those points. Mutators are responsible for the tweening logic of all properties. They get the progress from their observer and apply easing (if applicable) to output final property value.</p>
	</section>

	<section id="get-started">
		<h2>Get Started</h2>
		<h3 id="installation">Installation</h3>
		<p>This library is not yet distributed on a CDN or as a NPM package. For now, simply grab the minified or unminified version in the <code>dist</code> folder.</p>
		<h3 id="basic-usage">Basic Usage</h3>
		<p>A common and simple way of creating a new Wonderscroll object would be to pass a single observer with default params and a single mutator. </p>
		<pre><code><span class="keyword">var</span> <span class="operator">=</span> <span class="keyword">new</span> <span class="funcName">Wonderscroll</span>{'({'}
	<span class="property">mutators</span><span class="operator">:</span> {'{'}
		<span class="property">opacity</span><span class="operator">:</span> {'{'}
			<span class="property">from</span><span class="operator">:</span> <span class="number">1</span>,
			<span class="property">to</span><span class="operator">:</span> <span class="number">0</span>,
			<span class="property">unit</span><span class="operator">:</span> <span class="string">&#39;&#39;</span>
		{'}'}
	{'}'}
{'});'}
</code>
</pre>
		<p>This would create a Wonderscroll object for each <code>.wonderscroll</code> elements with a single observer with default params. It would then assign to this observer a single Mutator for its opacity that would go from fully opaque to totally transparent while the element progresses from the bottom of the screen to the top of the screen.</p>
	</section>

	<footer>
		<div>The End</div>
	</footer>
</main>


<style>
	header {
		margin: 30vh 0;
	}
	h1,
	footer div {
		font-family: 'Bangers';
		font-weight: 400;
		font-size: 48rem;
		text-align: center;
		margin: 0;
		text-shadow: 3px 2px 0px var(--accent-bg-color);
	}
	small {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 1rem;
		text-align: center;
		font-weight: bold;
		display: block;
		margin-top: 6rem;
	}
	aside {
		border-right: 1px solid var(--main-border-color);
	}
	section {
		padding: 0 60rem;
		margin-top: 100rem;
		border-top: 1px solid var(--main-border-color);
	}
	h2 {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 1rem;
		margin: 0;
		transform: translateY(-50%);
		background-color: var(--main-bg-color);
		display: inline-block;
		padding: 6rem 12rem;
		position: relative;
		left: -12rem;
	}
	h3 {
		font-size: 24rem;
	}

	footer {
		margin-top: 100rem;
		border-top: 1px solid var(--main-border-color);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
	
</style>