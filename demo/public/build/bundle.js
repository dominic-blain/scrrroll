
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.23.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let aside;
    	let ul4;
    	let li2;
    	let a0;
    	let t1;
    	let ul0;
    	let li0;
    	let a1;
    	let t3;
    	let li1;
    	let a2;
    	let t5;
    	let li5;
    	let a3;
    	let t7;
    	let ul1;
    	let li3;
    	let a4;
    	let t9;
    	let li4;
    	let a5;
    	let t11;
    	let li12;
    	let a6;
    	let t13;
    	let ul2;
    	let li6;
    	let a7;
    	let t15;
    	let li7;
    	let a8;
    	let t17;
    	let li8;
    	let a9;
    	let t19;
    	let li9;
    	let a10;
    	let t21;
    	let li10;
    	let a11;
    	let t23;
    	let li11;
    	let a12;
    	let t25;
    	let li14;
    	let a13;
    	let t27;
    	let ul3;
    	let li13;
    	let t29;
    	let main;
    	let header;
    	let h1;
    	let t31;
    	let small;
    	let t33;
    	let section;
    	let h2;
    	let t35;
    	let p0;
    	let t36;
    	let strong0;
    	let t38;
    	let h30;
    	let t40;
    	let p1;
    	let t42;
    	let h31;
    	let t44;
    	let p2;
    	let t45;
    	let strong1;
    	let t47;
    	let t48;
    	let footer;

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			ul4 = element("ul");
    			li2 = element("li");
    			a0 = element("a");
    			a0.textContent = "Introduction";
    			t1 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Why Wonderscroll?";
    			t3 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Core Concepts";
    			t5 = space();
    			li5 = element("li");
    			a3 = element("a");
    			a3.textContent = "Get Started";
    			t7 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Installation";
    			t9 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Basic Usage";
    			t11 = space();
    			li12 = element("li");
    			a6 = element("a");
    			a6.textContent = "API";
    			t13 = space();
    			ul2 = element("ul");
    			li6 = element("li");
    			a7 = element("a");
    			a7.textContent = "Wonderscroll";
    			t15 = space();
    			li7 = element("li");
    			a8 = element("a");
    			a8.textContent = "Observer";
    			t17 = space();
    			li8 = element("li");
    			a9 = element("a");
    			a9.textContent = "Mutator";
    			t19 = space();
    			li9 = element("li");
    			a10 = element("a");
    			a10.textContent = "Default Mutator";
    			t21 = space();
    			li10 = element("li");
    			a11 = element("a");
    			a11.textContent = "Transform Mutator";
    			t23 = space();
    			li11 = element("li");
    			a12 = element("a");
    			a12.textContent = "Color Mutator";
    			t25 = space();
    			li14 = element("li");
    			a13 = element("a");
    			a13.textContent = "Demos";
    			t27 = space();
    			ul3 = element("ul");
    			li13 = element("li");
    			li13.textContent = "TODO";
    			t29 = space();
    			main = element("main");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Wonderscroll";
    			t31 = space();
    			small = element("small");
    			small.textContent = "0.0.1";
    			t33 = space();
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Introduction";
    			t35 = space();
    			p0 = element("p");
    			t36 = text("Wonderscroll is yet another javascript library for animating css properties based on scroll values. ");
    			strong0 = element("strong");
    			strong0.textContent = "It is in early stage and many issues can still arise.";
    			t38 = space();
    			h30 = element("h3");
    			h30.textContent = "Why Wonderscroll";
    			t40 = space();
    			p1 = element("p");
    			p1.textContent = "Why not? This project exists mostly as a learning project, but its aim is to be usable in production. It is used to tween css properties between a start and finish value. It is not used to trigger css animations or transitions.";
    			t42 = space();
    			h31 = element("h3");
    			h31.textContent = "Core Concepts";
    			t44 = space();
    			p2 = element("p");
    			t45 = text("Their are 3 main objects: ");
    			strong1 = element("strong");
    			strong1.textContent = "Wonderscroll, Observer and Mutator.";
    			t47 = text(" Those three work together in order to efficiently modify an element' style. \n\t\tThe Wonderscroll object is the conductor and manages its own observer(s) and their related mutator(s). \n\t\tObservers can set their own start and end point in relation to the screen position of the element and they know which mutators to apply. \n\t\tThey track progress between those points. Mutators are responsible for the tweening logic of all properties. They get the progress from their observer and apply easing (if applicable) to output final property value.");
    			t48 = space();
    			footer = element("footer");
    			attr_dev(a0, "href", "#introduction");
    			add_location(a0, file, 36, 2, 449);
    			attr_dev(a1, "href", "#why-wonderscroll");
    			add_location(a1, file, 38, 7, 504);
    			add_location(li0, file, 38, 3, 500);
    			attr_dev(a2, "href", "#core-concepts");
    			add_location(a2, file, 39, 7, 566);
    			add_location(li1, file, 39, 3, 562);
    			add_location(ul0, file, 37, 2, 492);
    			add_location(li2, file, 35, 1, 442);
    			attr_dev(a3, "href", "#get-started");
    			add_location(a3, file, 43, 2, 637);
    			attr_dev(a4, "href", "#installation");
    			add_location(a4, file, 45, 7, 690);
    			add_location(li3, file, 45, 3, 686);
    			attr_dev(a5, "href", "#basic-usage");
    			add_location(a5, file, 46, 7, 743);
    			add_location(li4, file, 46, 3, 739);
    			add_location(ul1, file, 44, 2, 678);
    			add_location(li5, file, 42, 1, 630);
    			attr_dev(a6, "href", "#api");
    			add_location(a6, file, 50, 2, 810);
    			attr_dev(a7, "href", "#wonderscroll");
    			add_location(a7, file, 52, 7, 847);
    			add_location(li6, file, 52, 3, 843);
    			attr_dev(a8, "href", "#observer");
    			add_location(a8, file, 53, 7, 900);
    			add_location(li7, file, 53, 3, 896);
    			attr_dev(a9, "href", "#mutator");
    			add_location(a9, file, 54, 7, 945);
    			add_location(li8, file, 54, 3, 941);
    			attr_dev(a10, "href", "#default-mutator");
    			add_location(a10, file, 55, 7, 988);
    			add_location(li9, file, 55, 3, 984);
    			attr_dev(a11, "href", "#transform-mutator");
    			add_location(a11, file, 56, 7, 1047);
    			add_location(li10, file, 56, 3, 1043);
    			attr_dev(a12, "href", "#color-mutator");
    			add_location(a12, file, 57, 7, 1110);
    			add_location(li11, file, 57, 3, 1106);
    			add_location(ul2, file, 51, 2, 835);
    			add_location(li12, file, 49, 1, 803);
    			attr_dev(a13, "href", "#demos");
    			add_location(a13, file, 61, 2, 1181);
    			add_location(li13, file, 63, 3, 1218);
    			add_location(ul3, file, 62, 2, 1210);
    			add_location(li14, file, 60, 1, 1174);
    			add_location(ul4, file, 34, 0, 436);
    			attr_dev(aside, "class", "svelte-2ppwcj");
    			add_location(aside, file, 33, 0, 428);
    			attr_dev(h1, "class", "svelte-2ppwcj");
    			add_location(h1, file, 71, 2, 1282);
    			attr_dev(small, "class", "svelte-2ppwcj");
    			add_location(small, file, 72, 2, 1306);
    			attr_dev(header, "class", "svelte-2ppwcj");
    			add_location(header, file, 70, 1, 1271);
    			attr_dev(h2, "class", "svelte-2ppwcj");
    			add_location(h2, file, 76, 2, 1371);
    			add_location(strong0, file, 77, 122, 1515);
    			attr_dev(p0, "class", "emphasis");
    			add_location(p0, file, 77, 2, 1395);
    			attr_dev(h30, "id", "why-wonderscroll");
    			attr_dev(h30, "class", "svelte-2ppwcj");
    			add_location(h30, file, 78, 2, 1592);
    			add_location(p1, file, 79, 2, 1642);
    			attr_dev(h31, "id", "core-concepts");
    			attr_dev(h31, "class", "svelte-2ppwcj");
    			add_location(h31, file, 80, 2, 1879);
    			add_location(strong1, file, 81, 31, 1952);
    			add_location(p2, file, 81, 2, 1923);
    			attr_dev(section, "id", "introduction");
    			attr_dev(section, "class", "svelte-2ppwcj");
    			add_location(section, file, 75, 1, 1341);
    			attr_dev(footer, "class", "svelte-2ppwcj");
    			add_location(footer, file, 87, 1, 2564);
    			add_location(main, file, 69, 0, 1263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, ul4);
    			append_dev(ul4, li2);
    			append_dev(li2, a0);
    			append_dev(li2, t1);
    			append_dev(li2, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(ul4, t5);
    			append_dev(ul4, li5);
    			append_dev(li5, a3);
    			append_dev(li5, t7);
    			append_dev(li5, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(ul1, t9);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(ul4, t11);
    			append_dev(ul4, li12);
    			append_dev(li12, a6);
    			append_dev(li12, t13);
    			append_dev(li12, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, a7);
    			append_dev(ul2, t15);
    			append_dev(ul2, li7);
    			append_dev(li7, a8);
    			append_dev(ul2, t17);
    			append_dev(ul2, li8);
    			append_dev(li8, a9);
    			append_dev(ul2, t19);
    			append_dev(ul2, li9);
    			append_dev(li9, a10);
    			append_dev(ul2, t21);
    			append_dev(ul2, li10);
    			append_dev(li10, a11);
    			append_dev(ul2, t23);
    			append_dev(ul2, li11);
    			append_dev(li11, a12);
    			append_dev(ul4, t25);
    			append_dev(ul4, li14);
    			append_dev(li14, a13);
    			append_dev(li14, t27);
    			append_dev(li14, ul3);
    			append_dev(ul3, li13);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, h1);
    			append_dev(header, t31);
    			append_dev(header, small);
    			append_dev(main, t33);
    			append_dev(main, section);
    			append_dev(section, h2);
    			append_dev(section, t35);
    			append_dev(section, p0);
    			append_dev(p0, t36);
    			append_dev(p0, strong0);
    			append_dev(section, t38);
    			append_dev(section, h30);
    			append_dev(section, t40);
    			append_dev(section, p1);
    			append_dev(section, t42);
    			append_dev(section, h31);
    			append_dev(section, t44);
    			append_dev(section, p2);
    			append_dev(p2, t45);
    			append_dev(p2, strong1);
    			append_dev(p2, t47);
    			append_dev(main, t48);
    			append_dev(main, footer);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	onMount(() => {
    		new Wonderscroll("h1, small",
    		{
    				params: { edge: "end", from: 0.25, to: 0 },
    				mutators: {
    					y: { from: 0, to: -100, ease: "InQuad" },
    					scale: { from: 1, to: 2, unit: "", ease: "InQuad" },
    					color: { from: "#fe2b26", to: "#264ffe" }
    				}
    			},
    		{ debug: true });
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ onMount });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
