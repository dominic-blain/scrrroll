
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
    	let nav;
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
    	let section0;
    	let h20;
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
    	let section1;
    	let h21;
    	let t50;
    	let h32;
    	let t52;
    	let p3;
    	let t53;
    	let code0;
    	let t55;
    	let t56;
    	let h33;
    	let t58;
    	let p4;
    	let t60;
    	let pre;
    	let code1;
    	let span0;
    	let t62;
    	let span1;
    	let t64;
    	let span2;
    	let t66;
    	let span3;
    	let t68_value = "({" + "";
    	let t68;
    	let t69;
    	let span4;
    	let span5;
    	let t72;
    	let t73_value = "{" + "";
    	let t73;
    	let t74;
    	let span6;
    	let span7;
    	let t77;
    	let t78_value = "{" + "";
    	let t78;
    	let t79;
    	let span8;
    	let span9;
    	let t82;
    	let span10;
    	let t84;
    	let span11;
    	let span12;
    	let t87;
    	let span13;
    	let t89;
    	let span14;
    	let span15;
    	let t92;
    	let span16;
    	let t94;
    	let t95_value = "}" + "";
    	let t95;
    	let t96;
    	let t97_value = "}" + "";
    	let t97;
    	let t98;
    	let t99_value = "});" + "";
    	let t99;
    	let t100;
    	let p5;
    	let t101;
    	let code2;
    	let t103;
    	let t104;
    	let footer;
    	let div;

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			nav = element("nav");
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
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Introduction";
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
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Get Started";
    			t50 = space();
    			h32 = element("h3");
    			h32.textContent = "Installation";
    			t52 = space();
    			p3 = element("p");
    			t53 = text("This library is not yet distributed on a CDN or as a NPM package. For now, simply grab the minified or unminified version in the ");
    			code0 = element("code");
    			code0.textContent = "dist";
    			t55 = text(" folder.");
    			t56 = space();
    			h33 = element("h3");
    			h33.textContent = "Basic Usage";
    			t58 = space();
    			p4 = element("p");
    			p4.textContent = "A common and simple way of creating a new Wonderscroll object would be to pass a single observer with default params and a single mutator.";
    			t60 = space();
    			pre = element("pre");
    			code1 = element("code");
    			span0 = element("span");
    			span0.textContent = "var";
    			t62 = text(" ");
    			span1 = element("span");
    			span1.textContent = "=";
    			t64 = text(" ");
    			span2 = element("span");
    			span2.textContent = "new";
    			t66 = text(" ");
    			span3 = element("span");
    			span3.textContent = "Wonderscroll";
    			t68 = text(t68_value);
    			t69 = text("\n\t");
    			span4 = element("span");
    			span4.textContent = "mutators";
    			span5 = element("span");
    			span5.textContent = ":";
    			t72 = text(" ");
    			t73 = text(t73_value);
    			t74 = text("\n\t\t");
    			span6 = element("span");
    			span6.textContent = "opacity";
    			span7 = element("span");
    			span7.textContent = ":";
    			t77 = text(" ");
    			t78 = text(t78_value);
    			t79 = text("\n\t\t\t");
    			span8 = element("span");
    			span8.textContent = "from";
    			span9 = element("span");
    			span9.textContent = ":";
    			t82 = text(" ");
    			span10 = element("span");
    			span10.textContent = "1";
    			t84 = text(",\n\t\t\t");
    			span11 = element("span");
    			span11.textContent = "to";
    			span12 = element("span");
    			span12.textContent = ":";
    			t87 = text(" ");
    			span13 = element("span");
    			span13.textContent = "0";
    			t89 = text(",\n\t\t\t");
    			span14 = element("span");
    			span14.textContent = "unit";
    			span15 = element("span");
    			span15.textContent = ":";
    			t92 = text(" ");
    			span16 = element("span");
    			span16.textContent = "''";
    			t94 = text("\n\t\t");
    			t95 = text(t95_value);
    			t96 = text("\n\t");
    			t97 = text(t97_value);
    			t98 = text("\n");
    			t99 = text(t99_value);
    			t100 = space();
    			p5 = element("p");
    			t101 = text("This would create a Wonderscroll object for each ");
    			code2 = element("code");
    			code2.textContent = ".wonderscroll";
    			t103 = text(" elements with a single observer with default params. It would then assign to this observer a single Mutator for its opacity that would go from fully opaque to totally transparent while the element progresses from the bottom of the screen to the top of the screen.");
    			t104 = space();
    			footer = element("footer");
    			div = element("div");
    			div.textContent = "The End";
    			attr_dev(a0, "href", "#introduction");
    			attr_dev(a0, "class", "svelte-sj9cxc");
    			add_location(a0, file, 81, 4, 1036);
    			attr_dev(a1, "href", "#why-wonderscroll");
    			attr_dev(a1, "class", "svelte-sj9cxc");
    			add_location(a1, file, 83, 9, 1095);
    			add_location(li0, file, 83, 5, 1091);
    			attr_dev(a2, "href", "#core-concepts");
    			attr_dev(a2, "class", "svelte-sj9cxc");
    			add_location(a2, file, 84, 9, 1159);
    			add_location(li1, file, 84, 5, 1155);
    			add_location(ul0, file, 82, 4, 1081);
    			add_location(li2, file, 80, 3, 1027);
    			attr_dev(a3, "href", "#get-started");
    			attr_dev(a3, "class", "svelte-sj9cxc");
    			add_location(a3, file, 88, 4, 1238);
    			attr_dev(a4, "href", "#installation");
    			attr_dev(a4, "class", "svelte-sj9cxc");
    			add_location(a4, file, 90, 9, 1295);
    			add_location(li3, file, 90, 5, 1291);
    			attr_dev(a5, "href", "#basic-usage");
    			attr_dev(a5, "class", "svelte-sj9cxc");
    			add_location(a5, file, 91, 9, 1350);
    			add_location(li4, file, 91, 5, 1346);
    			add_location(ul1, file, 89, 4, 1281);
    			add_location(li5, file, 87, 3, 1229);
    			attr_dev(a6, "href", "#api");
    			attr_dev(a6, "class", "svelte-sj9cxc");
    			add_location(a6, file, 95, 4, 1425);
    			attr_dev(a7, "href", "#wonderscroll");
    			attr_dev(a7, "class", "svelte-sj9cxc");
    			add_location(a7, file, 97, 9, 1466);
    			add_location(li6, file, 97, 5, 1462);
    			attr_dev(a8, "href", "#observer");
    			attr_dev(a8, "class", "svelte-sj9cxc");
    			add_location(a8, file, 98, 9, 1521);
    			add_location(li7, file, 98, 5, 1517);
    			attr_dev(a9, "href", "#mutator");
    			attr_dev(a9, "class", "svelte-sj9cxc");
    			add_location(a9, file, 99, 9, 1568);
    			add_location(li8, file, 99, 5, 1564);
    			attr_dev(a10, "href", "#default-mutator");
    			attr_dev(a10, "class", "svelte-sj9cxc");
    			add_location(a10, file, 100, 9, 1613);
    			add_location(li9, file, 100, 5, 1609);
    			attr_dev(a11, "href", "#transform-mutator");
    			attr_dev(a11, "class", "svelte-sj9cxc");
    			add_location(a11, file, 101, 9, 1674);
    			add_location(li10, file, 101, 5, 1670);
    			attr_dev(a12, "href", "#color-mutator");
    			attr_dev(a12, "class", "svelte-sj9cxc");
    			add_location(a12, file, 102, 9, 1739);
    			add_location(li11, file, 102, 5, 1735);
    			add_location(ul2, file, 96, 4, 1452);
    			add_location(li12, file, 94, 3, 1416);
    			attr_dev(a13, "href", "#demos");
    			attr_dev(a13, "class", "svelte-sj9cxc");
    			add_location(a13, file, 106, 4, 1818);
    			add_location(li13, file, 108, 5, 1859);
    			add_location(ul3, file, 107, 4, 1849);
    			add_location(li14, file, 105, 3, 1809);
    			add_location(ul4, file, 79, 2, 1019);
    			attr_dev(nav, "class", "svelte-sj9cxc");
    			add_location(nav, file, 78, 1, 1011);
    			attr_dev(aside, "class", "svelte-sj9cxc");
    			add_location(aside, file, 77, 0, 1002);
    			attr_dev(h1, "class", "svelte-sj9cxc");
    			add_location(h1, file, 117, 2, 1937);
    			attr_dev(small, "class", "svelte-sj9cxc");
    			add_location(small, file, 118, 2, 1961);
    			attr_dev(header, "class", "svelte-sj9cxc");
    			add_location(header, file, 116, 1, 1926);
    			attr_dev(h20, "class", "svelte-sj9cxc");
    			add_location(h20, file, 122, 2, 2047);
    			add_location(strong0, file, 123, 122, 2191);
    			attr_dev(p0, "class", "emphasis");
    			add_location(p0, file, 123, 2, 2071);
    			attr_dev(h30, "id", "why-wonderscroll");
    			attr_dev(h30, "class", "svelte-sj9cxc");
    			add_location(h30, file, 124, 2, 2268);
    			add_location(p1, file, 125, 2, 2318);
    			attr_dev(h31, "id", "core-concepts");
    			attr_dev(h31, "class", "svelte-sj9cxc");
    			add_location(h31, file, 126, 2, 2555);
    			add_location(strong1, file, 127, 31, 2628);
    			add_location(p2, file, 127, 2, 2599);
    			attr_dev(section0, "id", "introduction");
    			attr_dev(section0, "class", "wonderscroll svelte-sj9cxc");
    			add_location(section0, file, 121, 1, 1996);
    			attr_dev(h21, "class", "svelte-sj9cxc");
    			add_location(h21, file, 134, 2, 3269);
    			attr_dev(h32, "id", "installation");
    			attr_dev(h32, "class", "svelte-sj9cxc");
    			add_location(h32, file, 135, 2, 3292);
    			add_location(code0, file, 136, 134, 3466);
    			add_location(p3, file, 136, 2, 3334);
    			attr_dev(h33, "id", "basic-usage");
    			attr_dev(h33, "class", "svelte-sj9cxc");
    			add_location(h33, file, 137, 2, 3498);
    			add_location(p4, file, 138, 2, 3538);
    			attr_dev(span0, "class", "keyword");
    			add_location(span0, file, 139, 13, 3698);
    			attr_dev(span1, "class", "operator");
    			add_location(span1, file, 139, 46, 3731);
    			attr_dev(span2, "class", "keyword");
    			add_location(span2, file, 139, 78, 3763);
    			attr_dev(span3, "class", "funcName");
    			add_location(span3, file, 139, 111, 3796);
    			attr_dev(span4, "class", "property");
    			add_location(span4, file, 140, 1, 3846);
    			attr_dev(span5, "class", "operator");
    			add_location(span5, file, 140, 39, 3884);
    			attr_dev(span6, "class", "property");
    			add_location(span6, file, 141, 2, 3924);
    			attr_dev(span7, "class", "operator");
    			add_location(span7, file, 141, 39, 3961);
    			attr_dev(span8, "class", "property");
    			add_location(span8, file, 142, 3, 4002);
    			attr_dev(span9, "class", "operator");
    			add_location(span9, file, 142, 37, 4036);
    			attr_dev(span10, "class", "number");
    			add_location(span10, file, 142, 69, 4068);
    			attr_dev(span11, "class", "property");
    			add_location(span11, file, 143, 3, 4102);
    			attr_dev(span12, "class", "operator");
    			add_location(span12, file, 143, 35, 4134);
    			attr_dev(span13, "class", "number");
    			add_location(span13, file, 143, 67, 4166);
    			attr_dev(span14, "class", "property");
    			add_location(span14, file, 144, 3, 4200);
    			attr_dev(span15, "class", "operator");
    			add_location(span15, file, 144, 37, 4234);
    			attr_dev(span16, "class", "string");
    			add_location(span16, file, 144, 69, 4266);
    			add_location(code1, file, 139, 7, 3692);
    			add_location(pre, file, 139, 2, 3687);
    			add_location(code2, file, 150, 54, 4397);
    			add_location(p5, file, 150, 2, 4345);
    			attr_dev(section1, "id", "get-started");
    			attr_dev(section1, "class", "svelte-sj9cxc");
    			add_location(section1, file, 133, 1, 3240);
    			attr_dev(div, "class", "svelte-sj9cxc");
    			add_location(div, file, 154, 2, 4717);
    			attr_dev(footer, "class", "svelte-sj9cxc");
    			add_location(footer, file, 153, 1, 4706);
    			add_location(main, file, 115, 0, 1918);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, nav);
    			append_dev(nav, ul4);
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
    			append_dev(main, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t35);
    			append_dev(section0, p0);
    			append_dev(p0, t36);
    			append_dev(p0, strong0);
    			append_dev(section0, t38);
    			append_dev(section0, h30);
    			append_dev(section0, t40);
    			append_dev(section0, p1);
    			append_dev(section0, t42);
    			append_dev(section0, h31);
    			append_dev(section0, t44);
    			append_dev(section0, p2);
    			append_dev(p2, t45);
    			append_dev(p2, strong1);
    			append_dev(p2, t47);
    			append_dev(main, t48);
    			append_dev(main, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t50);
    			append_dev(section1, h32);
    			append_dev(section1, t52);
    			append_dev(section1, p3);
    			append_dev(p3, t53);
    			append_dev(p3, code0);
    			append_dev(p3, t55);
    			append_dev(section1, t56);
    			append_dev(section1, h33);
    			append_dev(section1, t58);
    			append_dev(section1, p4);
    			append_dev(section1, t60);
    			append_dev(section1, pre);
    			append_dev(pre, code1);
    			append_dev(code1, span0);
    			append_dev(code1, t62);
    			append_dev(code1, span1);
    			append_dev(code1, t64);
    			append_dev(code1, span2);
    			append_dev(code1, t66);
    			append_dev(code1, span3);
    			append_dev(code1, t68);
    			append_dev(code1, t69);
    			append_dev(code1, span4);
    			append_dev(code1, span5);
    			append_dev(code1, t72);
    			append_dev(code1, t73);
    			append_dev(code1, t74);
    			append_dev(code1, span6);
    			append_dev(code1, span7);
    			append_dev(code1, t77);
    			append_dev(code1, t78);
    			append_dev(code1, t79);
    			append_dev(code1, span8);
    			append_dev(code1, span9);
    			append_dev(code1, t82);
    			append_dev(code1, span10);
    			append_dev(code1, t84);
    			append_dev(code1, span11);
    			append_dev(code1, span12);
    			append_dev(code1, t87);
    			append_dev(code1, span13);
    			append_dev(code1, t89);
    			append_dev(code1, span14);
    			append_dev(code1, span15);
    			append_dev(code1, t92);
    			append_dev(code1, span16);
    			append_dev(code1, t94);
    			append_dev(code1, t95);
    			append_dev(code1, t96);
    			append_dev(code1, t97);
    			append_dev(code1, t98);
    			append_dev(code1, t99);
    			append_dev(section1, t100);
    			append_dev(section1, p5);
    			append_dev(p5, t101);
    			append_dev(p5, code2);
    			append_dev(p5, t103);
    			append_dev(main, t104);
    			append_dev(main, footer);
    			append_dev(footer, div);
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
    					color: { from: "#fe2b26", to: "#264ffe" },
    					letterSpacing: { from: 0, to: 4, unit: "rem" }
    				}
    			},
    		{ debug: true });

    		new Wonderscroll("p, h3, pre",
    		{
    				params: { from: 0.1, to: -0.1 },
    				mutators: {
    					x: {
    						from: 0,
    						to: 50,
    						unit: "rem",
    						ease: "InQuad"
    					},
    					y: {
    						from: 0,
    						to: -50,
    						unit: "rem",
    						ease: "InQuad"
    					},
    					opacity: { from: 1, to: 0, unit: "" }
    				}
    			});

    		new Wonderscroll("h2",
    		{
    				params: { from: 1, to: 0.8 },
    				mutators: {
    					letterSpacing: { from: 20, to: 1, unit: "rem" }
    				}
    			});
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
