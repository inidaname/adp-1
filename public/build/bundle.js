
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function tick() {
        schedule_update();
        return resolved_promise;
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
            set_current_component(null);
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Hero/Hero.svelte generated by Svelte v3.31.2 */

    const file = "src/components/Hero/Hero.svelte";
    const get_hero_image_slot_changes = dirty => ({});
    const get_hero_image_slot_context = ctx => ({});
    const get_hero_texts_slot_changes = dirty => ({});
    const get_hero_texts_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let header;
    	let section;
    	let div;
    	let t;
    	let current;
    	const hero_texts_slot_template = /*#slots*/ ctx[1]["hero-texts"];
    	const hero_texts_slot = create_slot(hero_texts_slot_template, ctx, /*$$scope*/ ctx[0], get_hero_texts_slot_context);
    	const hero_image_slot_template = /*#slots*/ ctx[1]["hero-image"];
    	const hero_image_slot = create_slot(hero_image_slot_template, ctx, /*$$scope*/ ctx[0], get_hero_image_slot_context);

    	const block = {
    		c: function create() {
    			header = element("header");
    			section = element("section");
    			div = element("div");
    			if (hero_texts_slot) hero_texts_slot.c();
    			t = space();
    			if (hero_image_slot) hero_image_slot.c();
    			attr_dev(div, "class", "container mx-auto flex flex-col-reverse px-5 py-24 md:flex-row items-center");
    			add_location(div, file, 10, 8, 121);
    			attr_dev(section, "class", "text-white body-font");
    			add_location(section, file, 9, 4, 74);
    			attr_dev(header, "class", " bg-gray-900");
    			add_location(header, file, 8, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, section);
    			append_dev(section, div);

    			if (hero_texts_slot) {
    				hero_texts_slot.m(div, null);
    			}

    			append_dev(div, t);

    			if (hero_image_slot) {
    				hero_image_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (hero_texts_slot) {
    				if (hero_texts_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(hero_texts_slot, hero_texts_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_hero_texts_slot_changes, get_hero_texts_slot_context);
    				}
    			}

    			if (hero_image_slot) {
    				if (hero_image_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(hero_image_slot, hero_image_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_hero_image_slot_changes, get_hero_image_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero_texts_slot, local);
    			transition_in(hero_image_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero_texts_slot, local);
    			transition_out(hero_image_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (hero_texts_slot) hero_texts_slot.d(detaching);
    			if (hero_image_slot) hero_image_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, ['hero-texts','hero-image']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Footer/Footer.svelte generated by Svelte v3.31.2 */

    const file$1 = "src/components/Footer/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div4;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let div3;
    	let div1;
    	let h20;
    	let t4;
    	let nav0;
    	let li0;
    	let t6;
    	let div2;
    	let h21;
    	let t8;
    	let nav1;
    	let li1;
    	let t10;
    	let li2;
    	let t12;
    	let li3;
    	let t14;
    	let li4;
    	let t16;
    	let div6;
    	let div5;
    	let p1;
    	let t18;
    	let span;
    	let a1;
    	let svg0;
    	let path0;
    	let t19;
    	let a2;
    	let svg1;
    	let path1;
    	let t20;
    	let a3;
    	let svg2;
    	let rect;
    	let path2;
    	let t21;
    	let a4;
    	let svg3;
    	let path3;
    	let circle;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div4 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Action Democratic Party";
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "ADP National Secretariat";
    			t4 = space();
    			nav0 = element("nav");
    			li0 = element("li");
    			li0.textContent = "No 20 Plot 3379A/3379B,\n                Mungo Park Close, \n                Off Jesse Jackson/Gimbya Street, \n                Asokoro/Garki Area 11. \n                FCT, Abuja. Nigeria";
    			t6 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Direct Contact";
    			t8 = space();
    			nav1 = element("nav");
    			li1 = element("li");
    			li1.textContent = "+234 906 000 0536";
    			t10 = space();
    			li2 = element("li");
    			li2.textContent = "+234 906 182 5005";
    			t12 = space();
    			li3 = element("li");
    			li3.textContent = "+234 906 182 5005";
    			t14 = space();
    			li4 = element("li");
    			li4.textContent = "contact@adp.ng";
    			t16 = space();
    			div6 = element("div");
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = "© 2020 Action Democratic Party";
    			t18 = space();
    			span = element("span");
    			a1 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t19 = space();
    			a2 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t20 = space();
    			a3 = element("a");
    			svg2 = svg_element("svg");
    			rect = svg_element("rect");
    			path2 = svg_element("path");
    			t21 = space();
    			a4 = element("a");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			circle = svg_element("circle");
    			if (img.src !== (img_src_value = "../adplogo.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "150");
    			attr_dev(img, "alt", "adplogos");
    			add_location(img, file$1, 5, 12, 447);
    			attr_dev(a0, "class", "flex title-font font-medium items-center md:justify-start justify-center text-gray-900");
    			add_location(a0, file$1, 4, 8, 336);
    			attr_dev(p0, "class", "mt-2 text-sm text-gray-500");
    			add_location(p0, file$1, 7, 8, 522);
    			attr_dev(div0, "class", "w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left md:mt-0 mt-10");
    			add_location(div0, file$1, 2, 6, 186);
    			attr_dev(h20, "class", "title-font font-medium text-gray-900 tracking-widest text-sm mb-3");
    			add_location(h20, file$1, 11, 10, 761);
    			add_location(li0, file$1, 13, 12, 921);
    			attr_dev(nav0, "class", "list-none mb-10");
    			add_location(nav0, file$1, 12, 10, 879);
    			attr_dev(div1, "class", "lg:w-1/2 md:w-1/2 w-full px-4");
    			add_location(div1, file$1, 10, 8, 707);
    			attr_dev(h21, "class", "title-font font-medium text-gray-900 tracking-widest text-sm mb-3");
    			add_location(h21, file$1, 24, 10, 1251);
    			add_location(li1, file$1, 26, 12, 1401);
    			add_location(li2, file$1, 28, 15, 1460);
    			add_location(li3, file$1, 29, 13, 1501);
    			add_location(li4, file$1, 30, 13, 1544);
    			attr_dev(nav1, "class", "list-none mb-10");
    			add_location(nav1, file$1, 25, 10, 1359);
    			attr_dev(div2, "class", "lg:w-1/2 md:w-1/2 w-full px-4");
    			add_location(div2, file$1, 23, 8, 1197);
    			attr_dev(div3, "class", "flex-grow flex flex-wrap md:pr-20 -mb-10 md:text-left text-center order-first");
    			add_location(div3, file$1, 9, 6, 607);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col");
    			add_location(div4, file$1, 1, 4, 55);
    			attr_dev(p1, "class", "text-gray-500 text-sm text-center sm:text-left");
    			add_location(p1, file$1, 39, 8, 1787);
    			attr_dev(path0, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path0, file$1, 45, 14, 2224);
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "class", "w-5 h-5");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$1, 44, 12, 2084);
    			attr_dev(a1, "class", "text-gray-500");
    			add_location(a1, file$1, 43, 10, 2046);
    			attr_dev(path1, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path1, file$1, 51, 14, 2588);
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "class", "w-5 h-5");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$1, 50, 12, 2448);
    			attr_dev(a2, "class", "ml-3 text-gray-500");
    			add_location(a2, file$1, 49, 10, 2405);
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$1, 57, 14, 3067);
    			attr_dev(path2, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01");
    			add_location(path2, file$1, 58, 14, 3144);
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "class", "w-5 h-5");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$1, 56, 12, 2913);
    			attr_dev(a3, "class", "ml-3 text-gray-500");
    			add_location(a3, file$1, 55, 10, 2870);
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "d", "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z");
    			add_location(path3, file$1, 64, 14, 3524);
    			attr_dev(circle, "cx", "4");
    			attr_dev(circle, "cy", "4");
    			attr_dev(circle, "r", "2");
    			attr_dev(circle, "stroke", "none");
    			add_location(circle, file$1, 65, 14, 3655);
    			attr_dev(svg3, "fill", "currentColor");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			attr_dev(svg3, "stroke-width", "0");
    			attr_dev(svg3, "class", "w-5 h-5");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			add_location(svg3, file$1, 63, 12, 3362);
    			attr_dev(a4, "class", "ml-3 text-gray-500");
    			add_location(a4, file$1, 62, 10, 3319);
    			attr_dev(span, "class", "inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start");
    			add_location(span, file$1, 41, 8, 1897);
    			attr_dev(div5, "class", "container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row text-white");
    			add_location(div5, file$1, 38, 6, 1690);
    			attr_dev(div6, "class", "bg-gray-800 ");
    			add_location(div6, file$1, 37, 4, 1657);
    			attr_dev(footer, "class", "text-white body-font bg-gray-900 ");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div4);
    			append_dev(div4, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t4);
    			append_dev(div1, nav0);
    			append_dev(nav0, li0);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t8);
    			append_dev(div2, nav1);
    			append_dev(nav1, li1);
    			append_dev(nav1, t10);
    			append_dev(nav1, li2);
    			append_dev(nav1, t12);
    			append_dev(nav1, li3);
    			append_dev(nav1, t14);
    			append_dev(nav1, li4);
    			append_dev(footer, t16);
    			append_dev(footer, div6);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    			append_dev(div5, t18);
    			append_dev(div5, span);
    			append_dev(span, a1);
    			append_dev(a1, svg0);
    			append_dev(svg0, path0);
    			append_dev(span, t19);
    			append_dev(span, a2);
    			append_dev(a2, svg1);
    			append_dev(svg1, path1);
    			append_dev(span, t20);
    			append_dev(span, a3);
    			append_dev(a3, svg2);
    			append_dev(svg2, rect);
    			append_dev(svg2, path2);
    			append_dev(span, t21);
    			append_dev(span, a4);
    			append_dev(a4, svg3);
    			append_dev(svg3, path3);
    			append_dev(svg3, circle);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Card/CardImage.svelte generated by Svelte v3.31.2 */

    const file$2 = "src/components/Card/CardImage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (8:0) {#each properties as prop}
    function create_each_block(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h2;
    	let t1_value = /*prop*/ ctx[1].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*prop*/ ctx[1].body + "";
    	let t3;
    	let t4;
    	let a;
    	let t5_value = /*prop*/ ctx[1].footer + "";
    	let t5;
    	let a_href_value;
    	let t6;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			a = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			if (img.src !== (img_src_value = /*prop*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "...");
    			add_location(img, file$2, 11, 5, 475);
    			attr_dev(div0, "class", "w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-white-100 flex-shrink-0");
    			add_location(div0, file$2, 10, 6, 345);
    			attr_dev(h2, "class", "text-gray-900 text-lg title-font font-medium mb-3");
    			add_location(h2, file$2, 14, 8, 562);
    			attr_dev(p, "class", "leading-relaxed text-sm font-light");
    			add_location(p, file$2, 15, 8, 650);
    			attr_dev(a, "class", "mt-3 text-blue-500 inline-flex items-center text-sm");
    			attr_dev(a, "href", a_href_value = /*prop*/ ctx[1].url);
    			add_location(a, file$2, 17, 8, 774);
    			attr_dev(div1, "class", "flex-grow");
    			add_location(div1, file$2, 13, 6, 530);
    			attr_dev(div2, "class", "transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex  rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col shadow-lg border-0 hover:shadow-xl ");
    			add_location(div2, file$2, 9, 4, 130);
    			attr_dev(div3, "class", "p-4 lg:w-1/2 md:w-full ");
    			add_location(div3, file$2, 8, 0, 88);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    			append_dev(div1, a);
    			append_dev(a, t5);
    			append_dev(div3, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*properties*/ 1 && img.src !== (img_src_value = /*prop*/ ctx[1].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*properties*/ 1 && t1_value !== (t1_value = /*prop*/ ctx[1].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*properties*/ 1 && t3_value !== (t3_value = /*prop*/ ctx[1].body + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*properties*/ 1 && t5_value !== (t5_value = /*prop*/ ctx[1].footer + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*properties*/ 1 && a_href_value !== (a_href_value = /*prop*/ ctx[1].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:0) {#each properties as prop}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*properties*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*properties*/ 1) {
    				each_value = /*properties*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardImage", slots, []);
    	let { properties } = $$props;
    	const writable_props = ["properties"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardImage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("properties" in $$props) $$invalidate(0, properties = $$props.properties);
    	};

    	$$self.$capture_state = () => ({ properties });

    	$$self.$inject_state = $$props => {
    		if ("properties" in $$props) $$invalidate(0, properties = $$props.properties);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [properties];
    }

    class CardImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { properties: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardImage",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*properties*/ ctx[0] === undefined && !("properties" in props)) {
    			console.warn("<CardImage> was created without expected prop 'properties'");
    		}
    	}

    	get properties() {
    		throw new Error("<CardImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set properties(value) {
    		throw new Error("<CardImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/News_Panel/News_Bar.svelte generated by Svelte v3.31.2 */
    const file$3 = "src/components/News_Panel/News_Bar.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let cardwithimage;
    	let current;

    	cardwithimage = new CardImage({
    			props: { properties: /*news*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Latest News";
    			t1 = space();
    			div1 = element("div");
    			create_component(cardwithimage.$$.fragment);
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font text-blue-900");
    			add_location(h1, file$3, 29, 8, 1781);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-10");
    			add_location(div0, file$3, 28, 6, 1720);
    			attr_dev(div1, "class", "flex flex-wrap -m-4");
    			add_location(div1, file$3, 31, 6, 1887);
    			attr_dev(div2, "class", "container px-5 py-10 mx-auto");
    			add_location(div2, file$3, 27, 4, 1671);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$3, 26, 0, 1625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(cardwithimage, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardwithimage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardwithimage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(cardwithimage);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("News_Bar", slots, []);

    	const news = [
    		{
    			title: "ADP presidential candidate says oil money should be used to develop country",
    			body: "Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
    			img: "../withkunle.jpeg",
    			footer: "Read more",
    			url: "https://medium.com/action-democratic-party/adp-presidential-candidate-says-oil-money-should-be-used-to-develop-country-b9d330ddf4b4"
    		},
    		{
    			title: "ADP Presidential Candidate, Sani Meet Obasanjo",
    			body: "The Presidential candidate of the Action Democratic Party (ADP), met with the former President, Chief Olusegun Obasanjo on Wednesday, the meeting took place at the Presidential library in Ogun State capital city, Abeokuta. ",
    			img: "../withobj.jpeg",
    			footer: "Read more",
    			url: "https://medium.com/action-democratic-party/2019-adp-presidential-candidate-sani-meet-obasanjo-f95602ef175b"
    		},
    		{
    			title: "ADP Presidential Candidate, Engr YY Sani Recognized Internationally",
    			body: "United Nations honor Engr. Sani with the coveted UN Humanitarian Award in recognition of his contributions to the social, economic and political development in Africa . The historic event took place on Thursday 13th September 2018 at the UN Headquartrs in New York USA.",
    			img: "../withwhyte.jpeg",
    			footer: "Read more",
    			url: "https://medium.com/action-democratic-party/pictorial-of-the-presidential-candidate-and-national-chairman-of-adp-engr-e30ecfce1079"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<News_Bar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ news, CardWithImage: CardImage });
    	return [news];
    }

    class News_Bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News_Bar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Mission_Panel/Mission_Bar.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/components/Mission_Panel/Mission_Bar.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let cardwithimage;
    	let current;

    	cardwithimage = new CardImage({
    			props: { properties: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "The Party's Mission and Vision";
    			t1 = space();
    			div0 = element("div");
    			create_component(cardwithimage.$$.fragment);
    			attr_dev(h1, "class", "py-5 font-medium title-font sm:text-3xl text-2xl text-blue-900 sm:text-right ");
    			add_location(h1, file$4, 27, 6, 700);
    			attr_dev(div0, "class", "flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6");
    			add_location(div0, file$4, 28, 6, 832);
    			attr_dev(div1, "class", "container px-5 py-10 mx-auto");
    			add_location(div1, file$4, 23, 4, 514);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$4, 22, 0, 468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(cardwithimage, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardwithimage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardwithimage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(cardwithimage);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mission_Bar", slots, []);

    	const data = [
    		{
    			title: "Mission",
    			body: "To provide Responsive leadership that is transparent and accountable to the people.",
    			footer: "",
    			img: "../rocketicon.png"
    		},
    		{
    			title: "Vision",
    			body: "A Secure, Stable and Egalitarian Nigeria where Democracy and Rule of Law Reign.",
    			footer: "",
    			img: "../sendicon.png"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mission_Bar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CardWithImage: CardImage, data });
    	return [data];
    }

    class Mission_Bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mission_Bar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Forms/CTA_Form.svelte generated by Svelte v3.31.2 */

    const file$5 = "src/components/Forms/CTA_Form.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div4;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div3;
    	let div1;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let div2;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let button;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Join Us";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Whatever change you think you can bring to this great nation, you can always start with a step.";
    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Full Name";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Login";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900");
    			add_location(h1, file$5, 3, 8, 156);
    			attr_dev(p, "class", "lg:w-2/3 mx-auto leading-relaxed text-base");
    			add_location(p, file$5, 4, 8, 252);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-12");
    			add_location(div0, file$5, 2, 6, 95);
    			attr_dev(label0, "for", "full-name");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$5, 8, 10, 606);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "full-name");
    			attr_dev(input0, "name", "full-name");
    			attr_dev(input0, "class", "w-full bg-gray-100 bg-opacity-50 rounded border border-blue-300 focus:border-blue-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$5, 9, 10, 697);
    			attr_dev(div1, "class", "relative flex-grow w-full");
    			add_location(div1, file$5, 7, 8, 556);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$5, 12, 10, 1072);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "class", "w-full bg-gray-100 bg-opacity-50 rounded border border-blue-300 focus:border-blue-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$5, 13, 10, 1155);
    			attr_dev(div2, "class", "relative flex-grow w-full");
    			add_location(div2, file$5, 11, 8, 1022);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 px-8 py-3 focus:outline-none hover:bg-red-600 rounded text-sm");
    			add_location(button, file$5, 15, 8, 1473);
    			attr_dev(div3, "class", "flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end");
    			add_location(div3, file$5, 6, 6, 425);
    			attr_dev(div4, "class", "container px-5 py-10 mx-auto");
    			add_location(div4, file$5, 1, 4, 46);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t5);
    			append_dev(div1, input0);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t8);
    			append_dev(div2, input1);
    			append_dev(div3, t9);
    			append_dev(div3, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CTA_Form", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CTA_Form> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class CTA_Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CTA_Form",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Forms/SideRegForm.svelte generated by Svelte v3.31.2 */

    const file$6 = "src/components/Forms/SideRegForm.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let h10;
    	let t1;
    	let div4;
    	let div0;
    	let h11;
    	let t3;
    	let p0;
    	let t5;
    	let div3;
    	let h2;
    	let t7;
    	let div1;
    	let label0;
    	let t9;
    	let input0;
    	let t10;
    	let div2;
    	let label1;
    	let t12;
    	let input1;
    	let t13;
    	let button;
    	let t15;
    	let p1;
    	let a;
    	let t17;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h10 = element("h1");
    			h10.textContent = "Member's Corner";
    			t1 = space();
    			div4 = element("div");
    			div0 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Join Us!";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Whatever change you think you can bring to this great nation, you can always start with a step.";
    			t5 = space();
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Sign In";
    			t7 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t12 = space();
    			input1 = element("input");
    			t13 = space();
    			button = element("button");
    			button.textContent = "Login";
    			t15 = space();
    			p1 = element("p");
    			a = element("a");
    			a.textContent = "Register";
    			t17 = text(" for an account with us");
    			attr_dev(h10, "class", "py-4 font-medium title-font sm:text-3xl text-2xl text-blue-900 ml-5 sm:ml-0");
    			add_location(h10, file$6, 1, 2, 62);
    			attr_dev(h11, "class", "title-font font-medium text-3xl text-gray-900");
    			add_location(h11, file$6, 4, 8, 314);
    			attr_dev(p0, "class", "leading-relaxed mt-4");
    			add_location(p0, file$6, 5, 8, 394);
    			attr_dev(div0, "class", "lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0");
    			add_location(div0, file$6, 3, 6, 252);
    			attr_dev(h2, "class", "text-gray-100 text-lg font-medium title-font mb-5");
    			add_location(h2, file$6, 8, 8, 658);
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-100");
    			add_location(label0, file$6, 10, 10, 780);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$6, 11, 10, 863);
    			attr_dev(div1, "class", "relative mb-4");
    			add_location(div1, file$6, 9, 9, 742);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-100");
    			add_location(label1, file$6, 14, 10, 1177);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$6, 15, 10, 1266);
    			attr_dev(div2, "class", "relative mb-4");
    			add_location(div2, file$6, 13, 8, 1139);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-8 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(button, file$6, 18, 8, 1559);
    			attr_dev(a, "href", "/register");
    			attr_dev(a, "class", "text-blue-500");
    			add_location(a, file$6, 19, 46, 1729);
    			attr_dev(p1, "class", "text-xs text-gray-500 mt-3");
    			add_location(p1, file$6, 19, 8, 1691);
    			attr_dev(div3, "class", "lg:w-2/6 md:w-1/2 bg-gray-900 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0");
    			add_location(div3, file$6, 7, 6, 545);
    			attr_dev(div4, "class", "container px-5 py-10 mx-auto flex flex-wrap items-center");
    			add_location(div4, file$6, 2, 4, 175);
    			attr_dev(section, "class", "text-gray-600 body-font container mx-auto");
    			add_location(section, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h10);
    			append_dev(section, t1);
    			append_dev(section, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h11);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t7);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t9);
    			append_dev(div1, input0);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t12);
    			append_dev(div2, input1);
    			append_dev(div3, t13);
    			append_dev(div3, button);
    			append_dev(div3, t15);
    			append_dev(div3, p1);
    			append_dev(p1, a);
    			append_dev(p1, t17);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SideRegForm", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideRegForm> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SideRegForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideRegForm",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/renderless-svelte/src/Accordion.svelte generated by Svelte v3.31.2 */
    const get_header_slot_changes = dirty => ({ isOpen: dirty & /*isOpen*/ 1 });

    const get_header_slot_context = ctx => ({
    	toggle: /*toggle*/ ctx[1],
    	isOpen: /*isOpen*/ ctx[0]
    });

    // (16:0) {#if isOpen}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[3].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[2], get_header_slot_context);
    	let if_block = /*isOpen*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (header_slot) header_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (header_slot) {
    				header_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope, isOpen*/ 5) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (header_slot) header_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Accordion", slots, ['header','default']);
    	let { isOpen = false } = $$props;
    	const close = () => $$invalidate(0, isOpen = false);
    	const toggle = () => $$invalidate(0, isOpen = !isOpen);
    	const context = getContext("Accordion");
    	const setCurrent = context && context.setCurrent;
    	const writable_props = ["isOpen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Accordion> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		isOpen,
    		close,
    		toggle,
    		context,
    		setCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isOpen*/ 1) {
    			 isOpen && setCurrent && setCurrent(close);
    		}
    	};

    	return [isOpen, toggle, $$scope, slots];
    }

    class Accordion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { isOpen: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accordion",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules/renderless-svelte/src/Carousel.svelte generated by Svelte v3.31.2 */

    const get_default_slot_changes = dirty => ({
    	currentIndex: dirty & /*currentIndex*/ 1,
    	payload: dirty & /*payload*/ 16,
    	loop: dirty & /*loop*/ 2
    });

    const get_default_slot_context = ctx => ({
    	currentIndex: /*currentIndex*/ ctx[0],
    	payload: /*payload*/ ctx[4],
    	setIndex: /*setIndex*/ ctx[2],
    	controls: /*controls*/ ctx[3],
    	loop: /*loop*/ ctx[1]
    });

    function create_fragment$8(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, currentIndex, payload, loop*/ 83) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let payload;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, ['default']);
    	let { items = [] } = $$props;
    	let { currentIndex = 0 } = $$props;
    	let { loop = false } = $$props;
    	const setIndex = val => val < items.length && $$invalidate(0, currentIndex = val);

    	const controls = {
    		next: () => $$invalidate(0, currentIndex = currentIndex < items.length - 1
    		? currentIndex + 1
    		: loop ? 0 : items.length - 1),
    		previous: () => $$invalidate(0, currentIndex = currentIndex != 0
    		? currentIndex - 1
    		: loop ? items.length - 1 : 0)
    	};

    	const writable_props = ["items", "currentIndex", "loop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(5, items = $$props.items);
    		if ("currentIndex" in $$props) $$invalidate(0, currentIndex = $$props.currentIndex);
    		if ("loop" in $$props) $$invalidate(1, loop = $$props.loop);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		items,
    		currentIndex,
    		loop,
    		setIndex,
    		controls,
    		payload
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(5, items = $$props.items);
    		if ("currentIndex" in $$props) $$invalidate(0, currentIndex = $$props.currentIndex);
    		if ("loop" in $$props) $$invalidate(1, loop = $$props.loop);
    		if ("payload" in $$props) $$invalidate(4, payload = $$props.payload);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, currentIndex*/ 33) {
    			 $$invalidate(4, payload = items[currentIndex]);
    		}
    	};

    	return [currentIndex, loop, setIndex, controls, payload, items, $$scope, slots];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			items: 5,
    			currentIndex: 0,
    			loop: 1,
    			setIndex: 2,
    			controls: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get items() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentIndex() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentIndex(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loop() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loop(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIndex() {
    		return this.$$.ctx[2];
    	}

    	set setIndex(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get controls() {
    		return this.$$.ctx[3];
    	}

    	set controls(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/renderless-svelte/src/Modal.svelte generated by Svelte v3.31.2 */
    const get_default_slot_changes$1 = dirty => ({ payload: dirty & /*$_payload*/ 2 });

    const get_default_slot_context$1 = ctx => ({
    	payload: /*$_payload*/ ctx[1],
    	close: closeModal
    });

    // (25:0) {#if $_open}
    function create_if_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, $_payload*/ 6) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_default_slot_changes$1, get_default_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(25:0) {#if $_open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$_open*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$_open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$_open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let _open = writable(false);
    let _payload = writable({});
    let _closePromise;

    const openModal = payload => {
    	_open.set(true);
    	_payload.set(payload);

    	return new Promise(resolve => {
    			_closePromise = resolve;
    		});
    };

    const closeModal = () => {
    	_open.set(false);

    	if (typeof _closePromise === "function") {
    		_closePromise(get_store_value(_payload));
    	}
    };

    function instance$9($$self, $$props, $$invalidate) {
    	let $_open;
    	let $_payload;
    	validate_store(_open, "_open");
    	component_subscribe($$self, _open, $$value => $$invalidate(0, $_open = $$value));
    	validate_store(_payload, "_payload");
    	component_subscribe($$self, _payload, $$value => $$invalidate(1, $_payload = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		writable,
    		_open,
    		_payload,
    		_closePromise,
    		openModal,
    		closeModal,
    		$_open,
    		$_payload
    	});

    	return [$_open, $_payload, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Donate_Panel/Donate.svelte generated by Svelte v3.31.2 */
    const file$7 = "src/components/Donate_Panel/Donate.svelte";

    // (31:2) <Modal let:payload let:close>
    function create_default_slot(ctx) {
    	let div15;
    	let div14;
    	let div1;
    	let div0;
    	let t0;
    	let span;
    	let t2;
    	let div13;
    	let div11;
    	let div10;
    	let div9;
    	let h3;
    	let t4;
    	let div8;
    	let form;
    	let div7;
    	let div2;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let div3;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let div4;
    	let label2;
    	let t12;
    	let input2;
    	let t13;
    	let div5;
    	let label3;
    	let t15;
    	let input3;
    	let t16;
    	let div6;
    	let label4;
    	let t18;
    	let input4;
    	let t19;
    	let div12;
    	let button0;
    	let t21;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div15 = element("div");
    			div14 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			span = element("span");
    			span.textContent = "​";
    			t2 = space();
    			div13 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Donate";
    			t4 = space();
    			div8 = element("div");
    			form = element("form");
    			div7 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Full Name";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email Address";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div4 = element("div");
    			label2 = element("label");
    			label2.textContent = "Purpose";
    			t12 = space();
    			input2 = element("input");
    			t13 = space();
    			div5 = element("div");
    			label3 = element("label");
    			label3.textContent = "Amount";
    			t15 = space();
    			input3 = element("input");
    			t16 = space();
    			div6 = element("div");
    			label4 = element("label");
    			label4.textContent = "Phone Number";
    			t18 = space();
    			input4 = element("input");
    			t19 = space();
    			div12 = element("div");
    			button0 = element("button");
    			button0.textContent = "Donate";
    			t21 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr_dev(div0, "class", "absolute inset-0 bg-gray-500 opacity-75");
    			add_location(div0, file$7, 36, 7, 2445);
    			attr_dev(div1, "class", "fixed inset-0 transition-opacity");
    			attr_dev(div1, "aria-hidden", "true");
    			add_location(div1, file$7, 35, 5, 2372);
    			attr_dev(span, "class", "hidden sm:inline-block sm:align-middle sm:h-screen");
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$7, 40, 5, 2610);
    			attr_dev(h3, "class", "text-lg leading-6 font-medium text-gray-900");
    			attr_dev(h3, "id", "modal-headline");
    			add_location(h3, file$7, 46, 13, 3134);
    			attr_dev(label0, "class", "text-sm text-gray-700 dark:text-gray-200");
    			attr_dev(label0, "for", "fullname");
    			add_location(label0, file$7, 53, 19, 3420);
    			attr_dev(input0, "id", "fullname");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			add_location(input0, file$7, 54, 19, 3528);
    			attr_dev(div2, "class", "-mb-2");
    			add_location(div2, file$7, 52, 15, 3381);
    			attr_dev(label1, "class", "text-sm text-gray-700 dark:text-gray-200");
    			attr_dev(label1, "for", "emailAddress");
    			add_location(label1, file$7, 58, 19, 3862);
    			attr_dev(input1, "id", "emailAddress");
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			add_location(input1, file$7, 59, 19, 3978);
    			attr_dev(div3, "class", "-mb-2");
    			add_location(div3, file$7, 57, 15, 3823);
    			attr_dev(label2, "class", "text-sm text-gray-700 dark:text-gray-200");
    			attr_dev(label2, "for", "password");
    			add_location(label2, file$7, 63, 19, 4317);
    			attr_dev(input2, "id", "purpose");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			add_location(input2, file$7, 64, 19, 4423);
    			attr_dev(div4, "class", "-mb-2");
    			add_location(div4, file$7, 62, 15, 4278);
    			attr_dev(label3, "class", "text-sm text-gray-700 dark:text-gray-200");
    			attr_dev(label3, "for", "amount");
    			add_location(label3, file$7, 68, 19, 4756);
    			attr_dev(input3, "id", "amount");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			add_location(input3, file$7, 69, 19, 4859);
    			attr_dev(div5, "class", "-mb-2");
    			add_location(div5, file$7, 67, 15, 4717);
    			attr_dev(label4, "class", "text-sm text-gray-700 dark:text-gray-200");
    			attr_dev(label4, "for", "amount");
    			add_location(label4, file$7, 72, 19, 5189);
    			attr_dev(input4, "id", "phonenumber");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			add_location(input4, file$7, 73, 19, 5298);
    			attr_dev(div6, "class", "-mb-2");
    			add_location(div6, file$7, 71, 15, 5150);
    			attr_dev(div7, "class", "grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4");
    			add_location(div7, file$7, 51, 11, 3309);
    			add_location(form, file$7, 50, 7, 3291);
    			attr_dev(div8, "class", "mt-2");
    			add_location(div8, file$7, 49, 13, 3265);
    			attr_dev(div9, "class", "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left");
    			add_location(div9, file$7, 45, 11, 3061);
    			attr_dev(div10, "class", "sm:flex sm:items-start");
    			add_location(div10, file$7, 44, 9, 3013);
    			attr_dev(div11, "class", "bg-white px-4 pt-5  pb-4 sm:p-6 sm:pb-4");
    			add_location(div11, file$7, 43, 7, 2950);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", " text-xs w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm");
    			add_location(button0, file$7, 84, 9, 5771);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm");
    			add_location(button1, file$7, 87, 9, 6099);
    			attr_dev(div12, "class", "bg-gray-50 px-4 py-1 sm:px-6 sm:flex sm:flex-row-reverse");
    			add_location(div12, file$7, 83, 7, 5691);
    			attr_dev(div13, "class", "inline-block align-bottom  rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full");
    			attr_dev(div13, "role", "dialog");
    			attr_dev(div13, "aria-modal", "true");
    			attr_dev(div13, "aria-labelledby", "modal-headline");
    			add_location(div13, file$7, 42, 5, 2719);
    			attr_dev(div14, "class", "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0");
    			add_location(div14, file$7, 33, 3, 2262);
    			attr_dev(div15, "class", "fixed z-10 inset-0 overflow-y-auto mt-6 ");
    			add_location(div15, file$7, 32, 1, 2204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, div1);
    			append_dev(div1, div0);
    			append_dev(div14, t0);
    			append_dev(div14, span);
    			append_dev(div14, t2);
    			append_dev(div14, div13);
    			append_dev(div13, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, h3);
    			append_dev(div9, t4);
    			append_dev(div9, div8);
    			append_dev(div8, form);
    			append_dev(form, div7);
    			append_dev(div7, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t6);
    			append_dev(div2, input0);
    			append_dev(div7, t7);
    			append_dev(div7, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t9);
    			append_dev(div3, input1);
    			append_dev(div7, t10);
    			append_dev(div7, div4);
    			append_dev(div4, label2);
    			append_dev(div4, t12);
    			append_dev(div4, input2);
    			append_dev(div7, t13);
    			append_dev(div7, div5);
    			append_dev(div5, label3);
    			append_dev(div5, t15);
    			append_dev(div5, input3);
    			append_dev(div7, t16);
    			append_dev(div7, div6);
    			append_dev(div6, label4);
    			append_dev(div6, t18);
    			append_dev(div6, input4);
    			append_dev(div13, t19);
    			append_dev(div13, div12);
    			append_dev(div12, button0);
    			append_dev(div12, t21);
    			append_dev(div12, button1);

    			if (!mounted) {
    				dispose = listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*close*/ ctx[1])) /*close*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div15);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(31:2) <Modal let:payload let:close>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ payload, close }) => ({ 0: payload, 1: close }),
    						({ payload, close }) => (payload ? 1 : 0) | (close ? 2 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, close*/ 6) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Donate", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Donate> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Modal });
    	return [];
    }

    class Donate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Donate",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/Carousel/Carousel.svelte generated by Svelte v3.31.2 */
    const file$8 = "src/components/Carousel/Carousel.svelte";

    function create_fragment$b(ctx) {
    	let section;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div4;
    	let div2;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let div1;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let donate;
    	let current;
    	let mounted;
    	let dispose;
    	donate = new Donate({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div4 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Action Democratic Party";
    			t2 = space();
    			p = element("p");
    			p.textContent = "THE ACTION DEMOCRATIC PARTY (ADP) is a registered political party in Nigeria. The party was formed and established in 2017 to deal with the lapses that have over the years been complained about by Nigerians because the tenets of true democracy have been lost thereby giving some select few a godlike image where political parties are being dictated upon by the few and powerful.";
    			t4 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Join Us!";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Donate";
    			t8 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t9 = space();
    			create_component(donate.$$.fragment);
    			if (img0.src !== (img0_src_value = "../office.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "");
    			attr_dev(img0, "alt", "banner");
    			add_location(img0, file$8, 11, 8, 354);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$8, 10, 1, 331);
    			attr_dev(h1, "class", "title-font sm:text-4xl md:text-3xl text-lg mb-4 font-medium hidden  sm:block text-red-500 lg:text-5xl ");
    			add_location(h1, file$8, 15, 24, 755);
    			attr_dev(p, "class", "mb-2 mt-16 sm:mt-3 leading-relaxed w-11/12 text-white text-xs sm:text-sm font-light md:text-sm lg:text-lg");
    			add_location(p, file$8, 16, 24, 923);
    			attr_dev(button0, "class", "inline-flex text-white text-xs bg-red-500 border-0 py-1 px-3 md:py-2 md:px-6 focus:outline-none hover:bg-red-600 rounded md:text-lg lg:mt-3");
    			add_location(button0, file$8, 18, 26, 1507);
    			attr_dev(button1, "class", "inline-flex text-white text-xs bg-red-500 border-0 py-1 px-3 md:py-2 md:px-6 focus:outline-none hover:bg-red-600 rounded md:text-lg lg:mt-3 mx-2");
    			add_location(button1, file$8, 19, 26, 1707);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$8, 17, 24, 1447);
    			attr_dev(div2, "class", "lg:flex-grow md:w-1/2 max-w-lg mt-9 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center ");
    			add_location(div2, file$8, 14, 16, 581);
    			attr_dev(img1, "class", "object-cover object-center rounded");
    			attr_dev(img1, "alt", "hero");
    			if (img1.src !== (img1_src_value = "../adplogo.jpg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$8, 23, 24, 2128);
    			attr_dev(div3, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-4 md:mb-0 hidden md:block");
    			add_location(div3, file$8, 22, 22, 2024);
    			attr_dev(div4, "class", "absolute top-0 right-0 left-0 flex w-screen md:px-5 bg-opacity-70 h-full justify-center bg-gray-900 md:flex-row items-center");
    			add_location(div4, file$8, 13, 8, 426);
    			attr_dev(section, "class", "relative");
    			add_location(section, file$8, 9, 0, 303);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img0);
    			append_dev(section, t0);
    			append_dev(section, div4);
    			append_dev(div4, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t6);
    			append_dev(div1, button1);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, img1);
    			insert_dev(target, t9, anchor);
    			mount_component(donate, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*keyup_handler*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(donate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(donate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (detaching) detach_dev(t9);
    			destroy_component(donate, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, []);
    	const items = ["Squirrel 🐿️", "Rabbit 🐇", "Hamster 🐹"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = ev => ev.key === "Escape" && closeModal();
    	const click_handler = () => openModal("Rabbit 🐇");

    	$$self.$capture_state = () => ({
    		Carousel,
    		Accordion,
    		Modal,
    		openModal,
    		closeModal,
    		Donate,
    		items
    	});

    	return [keyup_handler, click_handler];
    }

    class Carousel_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel_1",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Card/Card.svelte generated by Svelte v3.31.2 */

    const file$9 = "src/components/Card/Card.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (8:0) {#each properties as prop}
    function create_each_block$1(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let h2;
    	let t0_value = /*prop*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let div2;
    	let p;
    	let t2_value = /*prop*/ ctx[1].body + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(h2, "class", "text-red-900  text-lg title-font font-medium");
    			add_location(h2, file$9, 12, 11, 409);
    			attr_dev(div0, "class", "card-title");
    			add_location(div0, file$9, 11, 8, 373);
    			attr_dev(div1, "class", "flex items-center mb-3");
    			add_location(div1, file$9, 10, 6, 328);
    			attr_dev(p, "class", "leading-relaxed sm:text-sm font-light");
    			add_location(p, file$9, 16, 8, 552);
    			attr_dev(div2, "class", "flex-grow");
    			add_location(div2, file$9, 15, 6, 520);
    			attr_dev(div3, "class", "flex rounded-lg h-full  p- justify-center flex-col");
    			add_location(div3, file$9, 9, 4, 257);
    			attr_dev(div4, "class", "transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110  p-4 md:w-1/3 card shadow-lg rounded-md border-0 mx-5 my-5 bg-white");
    			add_location(div4, file$9, 8, 0, 88);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t2);
    			append_dev(div4, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*properties*/ 1 && t0_value !== (t0_value = /*prop*/ ctx[1].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*properties*/ 1 && t2_value !== (t2_value = /*prop*/ ctx[1].body + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(8:0) {#each properties as prop}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let each_1_anchor;
    	let each_value = /*properties*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*properties*/ 1) {
    				each_value = /*properties*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	let { properties } = $$props;
    	const writable_props = ["properties"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("properties" in $$props) $$invalidate(0, properties = $$props.properties);
    	};

    	$$self.$capture_state = () => ({ properties });

    	$$self.$inject_state = $$props => {
    		if ("properties" in $$props) $$invalidate(0, properties = $$props.properties);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [properties];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { properties: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*properties*/ ctx[0] === undefined && !("properties" in props)) {
    			console.warn("<Card> was created without expected prop 'properties'");
    		}
    	}

    	get properties() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set properties(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Index.svelte generated by Svelte v3.31.2 */
    const file$a = "src/pages/Index.svelte";

    function create_fragment$d(ctx) {
    	let slides;
    	let t0;
    	let section0;
    	let div1;
    	let h10;
    	let t2;
    	let div0;
    	let card;
    	let t3;
    	let section1;
    	let div3;
    	let h2;
    	let t4;
    	let br;
    	let t5;
    	let t6;
    	let div2;
    	let p0;
    	let t8;
    	let section2;
    	let div7;
    	let div6;
    	let img;
    	let img_src_value;
    	let t9;
    	let div5;
    	let h11;
    	let t11;
    	let div4;
    	let t12;
    	let p1;
    	let t14;
    	let missionbar;
    	let t15;
    	let sidereg;
    	let t16;
    	let newsbar;
    	let current;
    	slides = new Carousel_1({ $$inline: true });

    	card = new Card({
    			props: { properties: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	missionbar = new Mission_Bar({ $$inline: true });
    	sidereg = new SideRegForm({ $$inline: true });
    	newsbar = new News_Bar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(slides.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Some facts about Action Democratic Party";
    			t2 = space();
    			div0 = element("div");
    			create_component(card.$$.fragment);
    			t3 = space();
    			section1 = element("section");
    			div3 = element("div");
    			h2 = element("h2");
    			t4 = text("I’ll Restore The Pride, Economy Of Nigeria\n        ");
    			br = element("br");
    			t5 = text("  - YY Sani");
    			t6 = space();
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Engr. Yabagi Yusuf Sani (YY Sani) is the presidential candidate of the Action Democratic Party (ADP) in the 2019 general elections. In this interview conducted during a meeting of all the candidates of the party held at the ADP National Secretariat in Abuja on January 9, he speaks on the necessity of the meeting, why Nigeria has become a laughing...";
    			t8 = space();
    			section2 = element("section");
    			div7 = element("div");
    			div6 = element("div");
    			img = element("img");
    			t9 = space();
    			div5 = element("div");
    			h11 = element("h1");
    			h11.textContent = "From the Chairman's Desk";
    			t11 = space();
    			div4 = element("div");
    			t12 = space();
    			p1 = element("p");
    			p1.textContent = "The National Chairman of the Action Democratic Party (ADP), Engr. Yabagi Sani, spoke with Press men in Abuja. He expressed dissatisfaction with the way the economy of the country was being run, insisting that the interest of the masses do not feature in the decision made by the ruling party...";
    			t14 = space();
    			create_component(missionbar.$$.fragment);
    			t15 = space();
    			create_component(sidereg.$$.fragment);
    			t16 = space();
    			create_component(newsbar.$$.fragment);
    			attr_dev(h10, "class", "py-4 font-medium title-font sm:text-3xl text-2xl text-blue-900 ");
    			add_location(h10, file$a, 44, 6, 1813);
    			attr_dev(div0, "class", "flex flex-wrap justify-center -m-4 py-7 ");
    			add_location(div0, file$a, 45, 6, 1941);
    			attr_dev(div1, "class", "container  px-5 py-4 mx-auto flex flex-wrap");
    			add_location(div1, file$a, 43, 4, 1749);
    			attr_dev(section0, "class", "text-gray-600 body-font");
    			add_location(section0, file$a, 42, 3, 1703);
    			add_location(br, file$a, 55, 8, 2361);
    			attr_dev(h2, "class", "sm:text-3xl text-2xl text-red-900 font-medium title-font mb-10 md:w-2/5");
    			add_location(h2, file$a, 54, 6, 2226);
    			attr_dev(p0, "class", "leading-relaxed text-base p-4 ");
    			add_location(p0, file$a, 57, 8, 2448);
    			attr_dev(div2, "class", "md:w-3/5 md:pl-6 shadow-lg rounded-md");
    			add_location(div2, file$a, 56, 6, 2388);
    			attr_dev(div3, "class", "container px-5 py-24 mx-auto flex flex-wrap");
    			add_location(div3, file$a, 53, 4, 2162);
    			attr_dev(section1, "class", "text-gray-600 body-font");
    			add_location(section1, file$a, 52, 2, 2116);
    			attr_dev(img, "alt", "Chairman's photo");
    			attr_dev(img, "class", "lg:w-96 w-full lg:h-72 md:h-72 md:w-1/2 rounded");
    			if (img.src !== (img_src_value = "../nChairman.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$a, 72, 6, 3211);
    			attr_dev(h11, "class", "text-red-900 text-3xl title-font font-medium mb-1");
    			add_location(h11, file$a, 74, 8, 3394);
    			attr_dev(div4, "class", "flex mb-4");
    			add_location(div4, file$a, 75, 8, 3494);
    			attr_dev(p1, "class", "leading-relaxed");
    			add_location(p1, file$a, 77, 8, 3541);
    			attr_dev(div5, "class", "lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0");
    			add_location(div5, file$a, 73, 6, 3326);
    			attr_dev(div6, "class", "lg:w-4/5 mx-auto flex flex-wrap p-0 items-center");
    			add_location(div6, file$a, 70, 4, 3090);
    			attr_dev(div7, "class", "container px-5 py-4 mx-auto");
    			add_location(div7, file$a, 69, 2, 3044);
    			attr_dev(section2, "class", "text-gray-600 body-font overflow-hidden");
    			add_location(section2, file$a, 68, 0, 2984);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(slides, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(card, div0, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div3);
    			append_dev(div3, h2);
    			append_dev(h2, t4);
    			append_dev(h2, br);
    			append_dev(h2, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div7);
    			append_dev(div7, div6);
    			append_dev(div6, img);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, h11);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div5, t12);
    			append_dev(div5, p1);
    			insert_dev(target, t14, anchor);
    			mount_component(missionbar, target, anchor);
    			insert_dev(target, t15, anchor);
    			mount_component(sidereg, target, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(newsbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slides.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			transition_in(missionbar.$$.fragment, local);
    			transition_in(sidereg.$$.fragment, local);
    			transition_in(newsbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slides.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			transition_out(missionbar.$$.fragment, local);
    			transition_out(sidereg.$$.fragment, local);
    			transition_out(newsbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slides, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section0);
    			destroy_component(card);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t14);
    			destroy_component(missionbar, detaching);
    			if (detaching) detach_dev(t15);
    			destroy_component(sidereg, detaching);
    			if (detaching) detach_dev(t16);
    			destroy_component(newsbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, []);

    	const data = [
    		{
    			title: "Fact Number One",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more",
    			img: "../nChairman.jpg"
    		},
    		{
    			title: "Fact Number Two",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more",
    			img: "../nChairman.jpg"
    		},
    		{
    			title: "Fact Number Three",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more",
    			img: "../nChairman.jpg"
    		},
    		{
    			title: "Fact Number Four",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more",
    			img: "../nChairman.jpg"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Hero,
    		Footer,
    		NewsBar: News_Bar,
    		MissionBar: Mission_Bar,
    		CardWithImage: CardImage,
    		CTAForm: CTA_Form,
    		SideReg: SideRegForm,
    		Slides: Carousel_1,
    		Card,
    		data
    	});

    	return [data];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/Card/ImageCard.svelte generated by Svelte v3.31.2 */

    const file$b = "src/components/Card/ImageCard.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (17:0) {#each galleries as image }
    function create_each_block$2(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let a;
    	let t1_value = /*image*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let span;
    	let t3_value = /*image*/ ctx[1].position + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(img, "class", "w-full h-56 object-cover");
    			if (img.src !== (img_src_value = /*image*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$b, 18, 2, 783);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "block text-2xl text-gray-800 dark:text-white font-bold");
    			add_location(a, file$b, 22, 6, 947);
    			attr_dev(span, "class", "text-sm text-gray-700 dark:text-gray-200");
    			add_location(span, file$b, 23, 6, 1045);
    			attr_dev(div0, "class", "py-5 text-center");
    			add_location(div0, file$b, 20, 2, 858);
    			attr_dev(div1, "class", "transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 max-w-xs bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mx-auto my-4");
    			add_location(div1, file$b, 17, 0, 599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span);
    			append_dev(span, t3);
    			append_dev(div1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*galleries*/ 1 && img.src !== (img_src_value = /*image*/ ctx[1].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*galleries*/ 1 && t1_value !== (t1_value = /*image*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*galleries*/ 1 && t3_value !== (t3_value = /*image*/ ctx[1].position + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:0) {#each galleries as image }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let each_1_anchor;
    	let each_value = /*galleries*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*galleries*/ 1) {
    				each_value = /*galleries*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ImageCard", slots, []);
    	let { galleries } = $$props;
    	const writable_props = ["galleries"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImageCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("galleries" in $$props) $$invalidate(0, galleries = $$props.galleries);
    	};

    	$$self.$capture_state = () => ({ galleries });

    	$$self.$inject_state = $$props => {
    		if ("galleries" in $$props) $$invalidate(0, galleries = $$props.galleries);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [galleries];
    }

    class ImageCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { galleries: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageCard",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*galleries*/ ctx[0] === undefined && !("galleries" in props)) {
    			console.warn("<ImageCard> was created without expected prop 'galleries'");
    		}
    	}

    	get galleries() {
    		throw new Error("<ImageCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set galleries(value) {
    		throw new Error("<ImageCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Gallery/Gallery_Block.svelte generated by Svelte v3.31.2 */
    const file$c = "src/components/Gallery/Gallery_Block.svelte";
    const get_gallery_subtitle_slot_changes = dirty => ({});
    const get_gallery_subtitle_slot_context = ctx => ({});
    const get_gallery_heading_slot_changes = dirty => ({});
    const get_gallery_heading_slot_context = ctx => ({});

    function create_fragment$f(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let imagecard;
    	let current;
    	const gallery_heading_slot_template = /*#slots*/ ctx[2]["gallery-heading"];
    	const gallery_heading_slot = create_slot(gallery_heading_slot_template, ctx, /*$$scope*/ ctx[1], get_gallery_heading_slot_context);
    	const gallery_subtitle_slot_template = /*#slots*/ ctx[2]["gallery-subtitle"];
    	const gallery_subtitle_slot = create_slot(gallery_subtitle_slot_template, ctx, /*$$scope*/ ctx[1], get_gallery_subtitle_slot_context);

    	imagecard = new ImageCard({
    			props: { galleries: /*galleries*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			if (gallery_heading_slot) gallery_heading_slot.c();
    			t0 = space();
    			if (gallery_subtitle_slot) gallery_subtitle_slot.c();
    			t1 = space();
    			div1 = element("div");
    			create_component(imagecard.$$.fragment);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-20");
    			add_location(div0, file$c, 31, 6, 916);
    			attr_dev(div1, "class", "flex flex-wrap -m-4 justify-center");
    			add_location(div1, file$c, 38, 6, 1597);
    			attr_dev(div2, "class", "container px-5 py-20 mx-auto");
    			add_location(div2, file$c, 30, 4, 867);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$c, 29, 0, 821);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);

    			if (gallery_heading_slot) {
    				gallery_heading_slot.m(div0, null);
    			}

    			append_dev(div0, t0);

    			if (gallery_subtitle_slot) {
    				gallery_subtitle_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(imagecard, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (gallery_heading_slot) {
    				if (gallery_heading_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(gallery_heading_slot, gallery_heading_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_gallery_heading_slot_changes, get_gallery_heading_slot_context);
    				}
    			}

    			if (gallery_subtitle_slot) {
    				if (gallery_subtitle_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(gallery_subtitle_slot, gallery_subtitle_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_gallery_subtitle_slot_changes, get_gallery_subtitle_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery_heading_slot, local);
    			transition_in(gallery_subtitle_slot, local);
    			transition_in(imagecard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery_heading_slot, local);
    			transition_out(gallery_subtitle_slot, local);
    			transition_out(imagecard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (gallery_heading_slot) gallery_heading_slot.d(detaching);
    			if (gallery_subtitle_slot) gallery_subtitle_slot.d(detaching);
    			destroy_component(imagecard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery_Block", slots, ['gallery-heading','gallery-subtitle']);

    	const galleries = [
    		{
    			img: "../adplogo.jpg",
    			position: "Leader, ADP",
    			name: "First Name, Last Name"
    		},
    		{
    			img: "../adplogo.jpg",
    			position: "Leader, ADP",
    			name: "First Name, Last Name"
    		},
    		{
    			img: "../adplogo.jpg",
    			position: "Leader, ADP",
    			name: "First Name, Last Name"
    		},
    		{
    			img: "../adplogo.jpg",
    			position: "Leader, ADP",
    			name: "First Name, Last Name"
    		},
    		{
    			img: "../adplogo.jpg",
    			position: "Leader, ADP",
    			name: "First Name, Last Name"
    		},
    		{
    			img: "../adplogo.jpg",
    			position: "Leader, ADP",
    			name: "First Name, Last Name"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery_Block> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ ImageCard, galleries });
    	return [galleries, $$scope, slots];
    }

    class Gallery_Block extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery_Block",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/pages/Structure.svelte generated by Svelte v3.31.2 */
    const file$d = "src/pages/Structure.svelte";

    // (11:4) <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
    function create_hero_image_slot(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "object-cover object-center rounded");
    			attr_dev(img, "alt", "hero");
    			if (img.src !== (img_src_value = "../nChairman.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$d, 11, 8, 256);
    			attr_dev(div, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6");
    			attr_dev(div, "slot", "hero-image");
    			add_location(div, file$d, 10, 4, 179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_hero_image_slot.name,
    		type: "slot",
    		source: "(11:4) <div class=\\\"lg:max-w-lg lg:w-full md:w-1/2 w-5/6\\\" slot=\\\"hero-image\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:6) <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" slot="hero-texts">
    function create_hero_texts_slot(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "The National Chairman";
    			t1 = space();
    			p = element("p");
    			p.textContent = "The role of the Party's National Chairman is often different from a party leader. The duties of the chairman/chairperson are typically concerned with the party membership as a whole and the activities of the party organization. Chairman often play important roles in strategies to recruit and retain members in campaign fundersing and in internal party governance, where they may serve as member of or preside over a governing board or council.";
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-red-500");
    			add_location(h1, file$d, 16, 8, 522);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$d, 18, 8, 640);
    			attr_dev(div, "class", "lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center");
    			attr_dev(div, "slot", "hero-texts");
    			add_location(div, file$d, 15, 6, 361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_hero_texts_slot.name,
    		type: "slot",
    		source: "(16:6) <div class=\\\"lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center\\\" slot=\\\"hero-texts\\\">",
    		ctx
    	});

    	return block;
    }

    // (10:0) <Hero>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(10:0) <Hero>",
    		ctx
    	});

    	return block;
    }

    // (24:4) <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900" slot="gallery-heading">
    function create_gallery_heading_slot_1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Board of Trustee Members";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900");
    			attr_dev(h1, "slot", "gallery-heading");
    			add_location(h1, file$d, 23, 4, 1170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_gallery_heading_slot_1.name,
    		type: "slot",
    		source: "(24:4) <h1 class=\\\"sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900\\\" slot=\\\"gallery-heading\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:4) <p class="lg:w-2/3 mx-auto leading-relaxed text-base" slot="gallery-subtitle">
    function create_gallery_subtitle_slot_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Whatever cardigan tote bag tumblr The ADP Board of Trustee (BoT) is a constitutionally mandated body with the Action Democratic Party of Nigeria that provides advice and cousel to the leadership of the National Working Committee and stuff. It is regarded by the party's constitution as the conscience of the party.";
    			attr_dev(p, "class", "lg:w-2/3 mx-auto leading-relaxed text-base");
    			attr_dev(p, "slot", "gallery-subtitle");
    			add_location(p, file$d, 24, 4, 1301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_gallery_subtitle_slot_1.name,
    		type: "slot",
    		source: "(25:4) <p class=\\\"lg:w-2/3 mx-auto leading-relaxed text-base\\\" slot=\\\"gallery-subtitle\\\">",
    		ctx
    	});

    	return block;
    }

    // (23:0) <GalleryBlock>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(23:0) <GalleryBlock>",
    		ctx
    	});

    	return block;
    }

    // (31:4) <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900" slot="gallery-heading">
    function create_gallery_heading_slot(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "National Working Committee Members";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900");
    			attr_dev(h1, "slot", "gallery-heading");
    			add_location(h1, file$d, 30, 4, 1739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_gallery_heading_slot.name,
    		type: "slot",
    		source: "(31:4) <h1 class=\\\"sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900\\\" slot=\\\"gallery-heading\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:4) <p class="lg:w-2/3 mx-auto leading-relaxed text-base" slot="gallery-subtitle">
    function create_gallery_subtitle_slot(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "The ADP National Working Committee Members also known as NWC, is the executive committee of the Action Democratic Party in Nigeria. The NWC is composed of 12 party members, all of which are elected to a four year term at the party's National Convention, The NWC is headed by the Chairman who also functions as the party's National Chairman. The NWC has the responsibility for the day-to-day governance of the party as well as oversight of its national activities.";
    			attr_dev(p, "class", "lg:w-2/3 mx-auto leading-relaxed text-base");
    			attr_dev(p, "slot", "gallery-subtitle");
    			add_location(p, file$d, 31, 4, 1880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_gallery_subtitle_slot.name,
    		type: "slot",
    		source: "(32:4) <p class=\\\"lg:w-2/3 mx-auto leading-relaxed text-base\\\" slot=\\\"gallery-subtitle\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:0) <GalleryBlock>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(30:0) <GalleryBlock>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let hero;
    	let t0;
    	let galleryblock0;
    	let t1;
    	let galleryblock1;
    	let current;

    	hero = new Hero({
    			props: {
    				$$slots: {
    					default: [create_default_slot_2],
    					"hero-texts": [create_hero_texts_slot],
    					"hero-image": [create_hero_image_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	galleryblock0 = new Gallery_Block({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1],
    					"gallery-subtitle": [create_gallery_subtitle_slot_1],
    					"gallery-heading": [create_gallery_heading_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	galleryblock1 = new Gallery_Block({
    			props: {
    				$$slots: {
    					default: [create_default_slot$1],
    					"gallery-subtitle": [create_gallery_subtitle_slot],
    					"gallery-heading": [create_gallery_heading_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hero.$$.fragment);
    			t0 = space();
    			create_component(galleryblock0.$$.fragment);
    			t1 = space();
    			create_component(galleryblock1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(hero, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(galleryblock0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(galleryblock1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hero_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				hero_changes.$$scope = { dirty, ctx };
    			}

    			hero.$set(hero_changes);
    			const galleryblock0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				galleryblock0_changes.$$scope = { dirty, ctx };
    			}

    			galleryblock0.$set(galleryblock0_changes);
    			const galleryblock1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				galleryblock1_changes.$$scope = { dirty, ctx };
    			}

    			galleryblock1.$set(galleryblock1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(galleryblock0.$$.fragment, local);
    			transition_in(galleryblock1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(galleryblock0.$$.fragment, local);
    			transition_out(galleryblock1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hero, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(galleryblock0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(galleryblock1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Structure", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Structure> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GalleryBlock: Gallery_Block, Hero });
    	return [];
    }

    class Structure extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Structure",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    function p(e,r=!1){return e=e.slice(e.startsWith("/#")?2:0,e.endsWith("/*")?-2:void 0),e.startsWith("/")||(e="/"+e),e==="/"&&(e=""),r&&!e.endsWith("/")&&(e+="/"),e}function d(e,r){e=p(e,!0),r=p(r,!0);let o=[],n={},t=!0,a=e.split("/").map(i=>i.startsWith(":")?(o.push(i.slice(1)),"([^\\/]+)"):i).join("\\/"),c=r.match(new RegExp(`^${a}$`));return c||(t=!1,c=r.match(new RegExp(`^${a}`))),c?(o.forEach((i,b)=>n[i]=c[b+1]),{exact:t,params:n,part:c[0].slice(0,-1)}):null}function x(e,r,o){if(o==="")return e;if(o[0]==="/")return o;let n=c=>c.split("/").filter(i=>i!==""),t=n(e),a=r?n(r):[];return "/"+a.map((c,i)=>t[i]).join("/")+"/"+o}function h(e,r,o,n){let t=[r,"data-"+r].reduce((a,c)=>{let i=e.getAttribute(c);return o&&e.removeAttribute(c),i===null?a:i},!1);return !n&&t===""?!0:t||(n||!1)}function k(e){let r=e.split("&").map(o=>o.split("=")).reduce((o,n)=>{let t=n[0];if(!t)return o;let a=n.length>1?n[n.length-1]:!0;return typeof a=="string"&&a.includes(",")&&(a=a.split(",")),o[t]===void 0?o[t]=[a]:o[t].push(a),o},{});return Object.entries(r).reduce((o,n)=>(o[n[0]]=n[1].length>1?n[1]:n[1][0],o),{})}function R(e){throw new Error("[Tinro] "+e)}var w=1,v=2,S=3,A=4;function H(e,r,o,n){return e===w?r&&r():e===v?o&&o():n&&n()}function j(){return !window||window.location.pathname==="srcdoc"?S:w}var s={HISTORY:w,HASH:v,MEMORY:S,OFF:A,run:H,getDeafault:j},O,g,l=C();function C(){let e=s.getDeafault(),r,o=a=>window.onhashchange=window.onpopstate=g=null,n=a=>r&&r(y(e));function t(a){a&&(e=a),o(),e!==s.OFF&&s.run(e,c=>window.onpopstate=n,c=>window.onhashchange=n)&&n();}return {mode:a=>t(a),get:a=>y(e),go(a){W(e,a),n();},start(a){r=a,t();},stop(){r=null,t(s.OFF);}}}function W(e,r){s.run(e,o=>history.pushState({},"",r),o=>window.location.hash=r,o=>g=r);}function y(e){let r=O,o=O=s.run(e,t=>window.location.pathname+window.location.search,t=>String(window.location.hash.slice(1)||"/"),t=>g||"/"),n=o.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);return {url:o,from:r,path:n[1]||"",query:k(n[2]||""),hash:n[3]||""}}var f=D();function D(){let{subscribe:e}=writable(l.get(),r=>{l.start(r);let o=F(l.go);return ()=>{l.stop(),o();}});return {subscribe:e,goto:r=>l.go(r),params:Y,meta:P,useHashNavigation:r=>l.mode(r?s.HASH:s.HISTORY),mode:{hash:()=>l.mode(s.HASH),history:()=>l.mode(s.HISTORY),memory:()=>l.mode(s.MEMORY)}}}function M(e){let r=h(e,"href"),o=h(e,"exact",!0),n=h(e,"active-class",!0,"active");return {destroy:f.subscribe(t=>{let a=d(r,t.path);a&&(a.exact&&o||!o)?e.classList.add(n):e.classList.remove(n);})}}function F(e){let r=o=>{let n=o.target.closest("a[href]"),t=n&&h(n,"tinro-ignore");if(!t&&n){let a=n.getAttribute("href").replace(/^\/#/,"");/^\/\/|^[a-zA-Z]+:/.test(a)||(o.preventDefault(),e(a.startsWith("/")?a:n.href.replace(window.location.origin,"")));}};return addEventListener("click",r),()=>removeEventListener("click",r)}function P(){return getContext("tinro").meta}function Y(){return getContext("tinro").meta.params}function _(e){let r=getContext("tinro");r&&(r.exact||r.fallback)&&R(`${e.fallback?"<Route fallback>":`<Route path="${e.path}">`}  can't be inside ${r.fallback?"<Route fallback>":`<Route path="${r.path||"/"}"> with exact path`}`);let o=e.fallback?"fallbacks":"childs",n=writable({}),t={router:{},exact:!1,pattern:null,meta:{},parent:r,fallback:e.fallback,redirect:!1,firstmatch:!1,breadcrumb:null,matched:!1,childs:new Set,activeChilds:new Set,fallbacks:new Set,update(a){t.exact=!a.path.endsWith("/*"),t.pattern=p(`${t.parent&&t.parent.pattern||""}${a.path}`),t.redirect=a.redirect,t.firstmatch=a.firstmatch,t.breadcrumb=a.breadcrumb,t.match();},register:()=>t.parent?(t.parent[o].add(t),()=>{t.parent[o].delete(t),t.router.un&&t.router.un();}):void 0,show:()=>{e.onShow(),!t.fallback&&t.parent&&t.parent.activeChilds.add(t);},hide:()=>{e.onHide(),!t.fallback&&t.parent&&t.parent.activeChilds.delete(t);},match:async()=>{t.matched=!1;let{path:a,url:c,from:i,query:b}=t.router,u=d(t.pattern,a);if(u&&t.redirect&&(!t.exact||t.exact&&u.exact))return await tick(),f.goto(x(a,t.parent&&t.parent.pattern,t.redirect));if(t.meta=u&&{from:i,url:c,query:b,match:u.part,pattern:t.pattern,breadcrumbs:t.parent&&t.parent.meta&&t.parent.meta.breadcrumbs.slice()||[],params:u.params,subscribe:n.subscribe},t.breadcrumb&&t.meta&&t.meta.breadcrumbs.push({name:t.breadcrumb,path:u.part}),n.set(t.meta),u&&!t.fallback&&(!t.exact||t.exact&&u.exact)&&(!t.parent||!t.parent.firstmatch||!t.parent.matched)?(e.onMeta(t.meta),t.parent&&(t.parent.matched=!0),t.show()):t.hide(),await tick(),u&&!t.fallback&&(t.childs.size>0&&t.activeChilds.size==0||t.childs.size==0&&t.fallbacks.size>0)){let m=t;for(;m.fallbacks.size==0;)if(m=m.parent,!m)return;m&&m.fallbacks.forEach($=>$.show());}}};return setContext("tinro",t),onMount(()=>t.register()),t.router.un=f.subscribe(a=>{t.router.path=a.path,t.router.url=a.url,t.router.query=a.query,t.router.from=a.from,t.pattern!==null&&t.match();}),t}

    /* node_modules/tinro/cmp/Route.svelte generated by Svelte v3.31.2 */

    const get_default_slot_changes$2 = dirty => ({
    	params: dirty & /*params*/ 2,
    	meta: dirty & /*meta*/ 4
    });

    const get_default_slot_context$2 = ctx => ({
    	params: /*params*/ ctx[1],
    	meta: /*meta*/ ctx[2]
    });

    // (32:0) {#if showContent}
    function create_if_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$2);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, params, meta*/ 262) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$2, get_default_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(32:0) {#if showContent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showContent*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showContent*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showContent*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "/*" } = $$props;
    	let { fallback = false } = $$props;
    	let { redirect = false } = $$props;
    	let { firstmatch = false } = $$props;
    	let { breadcrumb = null } = $$props;
    	let showContent = false;
    	let params = {}; /* DEPRECATED */
    	let meta = {};

    	const route = _({
    		fallback,
    		onShow() {
    			$$invalidate(0, showContent = true);
    		},
    		onHide() {
    			$$invalidate(0, showContent = false);
    		},
    		onMeta(newmeta) {
    			$$invalidate(2, meta = newmeta);
    			$$invalidate(1, params = meta.params); /* DEPRECATED */
    		}
    	});

    	const writable_props = ["path", "fallback", "redirect", "firstmatch", "breadcrumb"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(3, path = $$props.path);
    		if ("fallback" in $$props) $$invalidate(4, fallback = $$props.fallback);
    		if ("redirect" in $$props) $$invalidate(5, redirect = $$props.redirect);
    		if ("firstmatch" in $$props) $$invalidate(6, firstmatch = $$props.firstmatch);
    		if ("breadcrumb" in $$props) $$invalidate(7, breadcrumb = $$props.breadcrumb);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createRouteObject: _,
    		path,
    		fallback,
    		redirect,
    		firstmatch,
    		breadcrumb,
    		showContent,
    		params,
    		meta,
    		route
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(3, path = $$props.path);
    		if ("fallback" in $$props) $$invalidate(4, fallback = $$props.fallback);
    		if ("redirect" in $$props) $$invalidate(5, redirect = $$props.redirect);
    		if ("firstmatch" in $$props) $$invalidate(6, firstmatch = $$props.firstmatch);
    		if ("breadcrumb" in $$props) $$invalidate(7, breadcrumb = $$props.breadcrumb);
    		if ("showContent" in $$props) $$invalidate(0, showContent = $$props.showContent);
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    		if ("meta" in $$props) $$invalidate(2, meta = $$props.meta);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, redirect, firstmatch, breadcrumb*/ 232) {
    			 route.update({ path, redirect, firstmatch, breadcrumb });
    		}
    	};

    	return [
    		showContent,
    		params,
    		meta,
    		path,
    		fallback,
    		redirect,
    		firstmatch,
    		breadcrumb,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			path: 3,
    			fallback: 4,
    			redirect: 5,
    			firstmatch: 6,
    			breadcrumb: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redirect() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redirect(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstmatch() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstmatch(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get breadcrumb() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set breadcrumb(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar/Navbar.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$e = "src/components/Navbar/Navbar.svelte";

    function create_fragment$i(ctx) {
    	let nav;
    	let div4;
    	let div2;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let button;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div3;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;
    	let t9;
    	let a5;
    	let t11;
    	let a6;
    	let t13;
    	let a7;
    	let div3_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			img1 = element("img");
    			t1 = space();
    			div3 = element("div");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "About Us";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Constitution";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Structure";
    			t9 = space();
    			a5 = element("a");
    			a5.textContent = "Register";
    			t11 = space();
    			a6 = element("a");
    			a6.textContent = "Candidates";
    			t13 = space();
    			a7 = element("a");
    			a7.textContent = "Contact Us";
    			if (img0.src !== (img0_src_value = "../adplogo.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "70");
    			attr_dev(img0, "alt", "adplogos");
    			attr_dev(img0, "class", "rounded-lg");
    			add_location(img0, file$e, 18, 20, 634);
    			attr_dev(a0, "class", "text-gray-800 dark:text-white text-xl font-bold md:text-2xl hover:text-gray-700 dark:hover:text-gray-300");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$e, 17, 16, 488);
    			add_location(div0, file$e, 16, 12, 466);
    			if (img1.src !== (img1_src_value = /*isNav*/ ctx[0] ? "../xtimes.svg" : "../ham.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "border-0 focus:outline-none");
    			add_location(img1, file$e, 25, 20, 1080);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400");
    			attr_dev(button, "aria-label", "Toggle menu");
    			add_location(button, file$e, 24, 16, 843);
    			attr_dev(div1, "class", "md:hidden");
    			add_location(div1, file$e, 23, 12, 803);
    			attr_dev(div2, "class", "flex justify-between items-center");
    			add_location(div2, file$e, 15, 8, 406);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a1, "active-class", "bg-red-500");
    			attr_dev(a1, "exact", "");
    			add_location(a1, file$e, 33, 12, 1422);
    			attr_dev(a2, "href", "/about");
    			attr_dev(a2, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a2, "active-class", "bg-red-500");
    			add_location(a2, file$e, 35, 12, 1655);
    			attr_dev(a3, "href", "/constitution");
    			attr_dev(a3, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a3, "active-class", "bg-red-500");
    			add_location(a3, file$e, 36, 12, 1879);
    			attr_dev(a4, "href", "/structure");
    			attr_dev(a4, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a4, "active-class", "bg-red-500");
    			add_location(a4, file$e, 37, 12, 2115);
    			attr_dev(a5, "href", "/register");
    			attr_dev(a5, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a5, "active-class", "bg-red-500");
    			add_location(a5, file$e, 38, 12, 2345);
    			attr_dev(a6, "href", "/candidates");
    			attr_dev(a6, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a6, "active-class", "bg-red-500");
    			add_location(a6, file$e, 39, 12, 2573);
    			attr_dev(a7, "href", "contact");
    			attr_dev(a7, "class", "py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			attr_dev(a7, "active-class", "bg-red-500");
    			add_location(a7, file$e, 40, 12, 2805);
    			attr_dev(div3, "class", div3_class_value = "flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block " + `${/*isNav*/ ctx[0] ? "block" : "hidden"}`);
    			add_location(div3, file$e, 32, 8, 1310);
    			attr_dev(div4, "class", "md:flex items-center justify-between");
    			add_location(div4, file$e, 14, 4, 347);
    			attr_dev(nav, "class", "px-6 py-3 border-b-2 border-gray-900 fixed w-full top-0 z-30  bg-gray-800");
    			add_location(nav, file$e, 13, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, img1);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, a1);
    			append_dev(div3, t3);
    			append_dev(div3, a2);
    			append_dev(div3, t5);
    			append_dev(div3, a3);
    			append_dev(div3, t7);
    			append_dev(div3, a4);
    			append_dev(div3, t9);
    			append_dev(div3, a5);
    			append_dev(div3, t11);
    			append_dev(div3, a6);
    			append_dev(div3, t13);
    			append_dev(div3, a7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*openNav*/ ctx[1], false, false, false),
    					action_destroyer(M.call(null, a1)),
    					action_destroyer(M.call(null, a2)),
    					action_destroyer(M.call(null, a3)),
    					action_destroyer(M.call(null, a4)),
    					action_destroyer(M.call(null, a5)),
    					action_destroyer(M.call(null, a6)),
    					action_destroyer(M.call(null, a7))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isNav*/ 1 && img1.src !== (img1_src_value = /*isNav*/ ctx[0] ? "../xtimes.svg" : "../ham.svg")) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*isNav*/ 1 && div3_class_value !== (div3_class_value = "flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block " + `${/*isNav*/ ctx[0] ? "block" : "hidden"}`)) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let isNav = false;
    	let { activePage } = $$props;
    	let { segment } = $$props;
    	console.log(activePage);

    	function openNav() {
    		isNav === false
    		? $$invalidate(0, isNav = true)
    		: $$invalidate(0, isNav = false);

    		console.log(isNav);
    	}

    	const writable_props = ["activePage", "segment"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("activePage" in $$props) $$invalidate(2, activePage = $$props.activePage);
    		if ("segment" in $$props) $$invalidate(3, segment = $$props.segment);
    	};

    	$$self.$capture_state = () => ({
    		isNav,
    		activePage,
    		segment,
    		openNav,
    		active: M
    	});

    	$$self.$inject_state = $$props => {
    		if ("isNav" in $$props) $$invalidate(0, isNav = $$props.isNav);
    		if ("activePage" in $$props) $$invalidate(2, activePage = $$props.activePage);
    		if ("segment" in $$props) $$invalidate(3, segment = $$props.segment);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isNav, openNav, activePage, segment];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { activePage: 2, segment: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activePage*/ ctx[2] === undefined && !("activePage" in props)) {
    			console_1.warn("<Navbar> was created without expected prop 'activePage'");
    		}

    		if (/*segment*/ ctx[3] === undefined && !("segment" in props)) {
    			console_1.warn("<Navbar> was created without expected prop 'segment'");
    		}
    	}

    	get activePage() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activePage(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get segment() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set segment(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Constitution.svelte generated by Svelte v3.31.2 */

    const file$f = "src/pages/Constitution.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let embed;
    	let embed_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			embed = element("embed");
    			attr_dev(embed, "type", "application/pdf");
    			if (embed.src !== (embed_src_value = "../The_Constitution_of_the_Action_Democratic_Party.pdf")) attr_dev(embed, "src", embed_src_value);
    			attr_dev(embed, "class", " w-full  h-screen ");
    			add_location(embed, file$f, 3, 4, 64);
    			attr_dev(div, "class", "p-0 mx-auto container my-10   min-h-screen ");
    			add_location(div, file$f, 2, 0, 2);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, embed);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Constitution", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Constitution> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Constitution extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Constitution",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/pages/About.svelte generated by Svelte v3.31.2 */
    const file$g = "src/pages/About.svelte";

    // (8:4) <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
    function create_hero_image_slot$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "object-cover object-center rounded mb-6 sm:mb-0");
    			attr_dev(img, "alt", "hero");
    			if (img.src !== (img_src_value = "../office.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$g, 8, 8, 295);
    			attr_dev(div, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6");
    			attr_dev(div, "slot", "hero-image");
    			add_location(div, file$g, 7, 4, 218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_hero_image_slot$1.name,
    		type: "slot",
    		source: "(8:4) <div class=\\\"lg:max-w-lg lg:w-full md:w-1/2 w-5/6\\\" slot=\\\"hero-image\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:6) <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" slot="hero-texts">
    function create_hero_texts_slot$1(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let a;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "About ADP";
    			t1 = space();
    			p = element("p");
    			p.textContent = "TTHE ACTION DEMOCRATIC PARTY (ADP) is a registered political party in Nigeria. The party was formed and established in 2017 to deal with the lapses that have over the years been complained about by Nigerians because the tenets of true democracy have been lost thereby giving some select few a godlike image where political parties are being dictated upon by the few and powerful.";
    			t3 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "Join Us!";
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-red-500");
    			add_location(h1, file$g, 11, 8, 569);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$g, 12, 8, 666);
    			attr_dev(a, "href", "/register");
    			attr_dev(a, "class", "inline-flex text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(a, file$g, 14, 12, 1136);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$g, 13, 8, 1090);
    			attr_dev(div0, "class", "lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center");
    			attr_dev(div0, "slot", "hero-texts");
    			add_location(div0, file$g, 10, 6, 408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div0, t3);
    			append_dev(div0, div1);
    			append_dev(div1, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_hero_texts_slot$1.name,
    		type: "slot",
    		source: "(11:6) <div class=\\\"lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center\\\" slot=\\\"hero-texts\\\">",
    		ctx
    	});

    	return block;
    }

    // (7:0) <Hero>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(7:0) <Hero>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let hero;
    	let t0;
    	let section;
    	let div;
    	let h2;
    	let t2;
    	let p0;
    	let t4;
    	let ul;
    	let li0;
    	let t6;
    	let li1;
    	let t8;
    	let li2;
    	let t10;
    	let p1;
    	let t11;
    	let a;
    	let t13;
    	let t14;
    	let p2;
    	let t16;
    	let missionbar;
    	let t17;
    	let newsbar;
    	let current;

    	hero = new Hero({
    			props: {
    				$$slots: {
    					default: [create_default_slot$2],
    					"hero-texts": [create_hero_texts_slot$1],
    					"hero-image": [create_hero_image_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	missionbar = new Mission_Bar({ $$inline: true });
    	newsbar = new News_Bar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(hero.$$.fragment);
    			t0 = space();
    			section = element("section");
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "ADP's Three Points Agenda";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "In the ADP, the three point agenda are:";
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "All Inclusiveness";
    			t6 = space();
    			li1 = element("li");
    			li1.textContent = "Democracy Empowerment of the Youth and Women";
    			t8 = space();
    			li2 = element("li");
    			li2.textContent = "Party Supremacy";
    			t10 = space();
    			p1 = element("p");
    			t11 = text("The keyword is democracy and this democracy is the same that is universally accepted and practiced all over; no one man or woman is greater than the party or one's view much better than the other member's when that view has not been examined and discussed. The ADP is the Nigeria's credible alternative with modern thinking and applications in its ");
    			a = element("a");
    			a.textContent = "manifesto";
    			t13 = text(".");
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "ADP is the party for every Nigerian who believes that the traditional and archaic methods of attending to the Nigerian quagmire should be revisited . ADP is the political party that is building a better future for a more unified Nigeria.";
    			t16 = space();
    			create_component(missionbar.$$.fragment);
    			t17 = space();
    			create_component(newsbar.$$.fragment);
    			attr_dev(h2, "class", " py-5 font-medium title-font sm:text-3xl text-2xl text-blue-900 text-left ");
    			add_location(h2, file$g, 21, 3, 1394);
    			attr_dev(p0, "class", "font-medium py-2");
    			add_location(p0, file$g, 22, 3, 1517);
    			add_location(li0, file$g, 27, 4, 1627);
    			add_location(li1, file$g, 28, 4, 1658);
    			add_location(li2, file$g, 29, 4, 1716);
    			attr_dev(ul, "class", "list-disc px-7");
    			add_location(ul, file$g, 26, 0, 1595);
    			attr_dev(a, "href", "/manifesto");
    			attr_dev(a, "class", "text-blue-500 hover:underline");
    			add_location(a, file$g, 31, 364, 2111);
    			attr_dev(p1, "class", "py-4");
    			add_location(p1, file$g, 31, 0, 1747);
    			attr_dev(p2, "class", "py-4");
    			add_location(p2, file$g, 34, 0, 2197);
    			attr_dev(div, "class", "p-4");
    			add_location(div, file$g, 20, 4, 1373);
    			attr_dev(section, "class", "container mx-auto");
    			add_location(section, file$g, 19, 0, 1333);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(hero, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, h2);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(div, t4);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(div, t10);
    			append_dev(div, p1);
    			append_dev(p1, t11);
    			append_dev(p1, a);
    			append_dev(p1, t13);
    			append_dev(div, t14);
    			append_dev(div, p2);
    			insert_dev(target, t16, anchor);
    			mount_component(missionbar, target, anchor);
    			insert_dev(target, t17, anchor);
    			mount_component(newsbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hero_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				hero_changes.$$scope = { dirty, ctx };
    			}

    			hero.$set(hero_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(missionbar.$$.fragment, local);
    			transition_in(newsbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(missionbar.$$.fragment, local);
    			transition_out(newsbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hero, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			if (detaching) detach_dev(t16);
    			destroy_component(missionbar, detaching);
    			if (detaching) detach_dev(t17);
    			destroy_component(newsbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MissionBar: Mission_Bar, NewsBar: News_Bar, Hero });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/components/Forms/MemberForm.svelte generated by Svelte v3.31.2 */

    const file$h = "src/components/Forms/MemberForm.svelte";

    function create_fragment$l(ctx) {
    	let div18;
    	let div5;
    	let h1;
    	let t1;
    	let section;
    	let div4;
    	let div0;
    	let p0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let ul;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let div3;
    	let h2;
    	let t11;
    	let div2;
    	let div1;
    	let input0;
    	let t12;
    	let div16;
    	let div10;
    	let div6;
    	let label0;
    	let t13;
    	let span1;
    	let t15;
    	let input1;
    	let t16;
    	let div7;
    	let label1;
    	let t17;
    	let span2;
    	let t19;
    	let input2;
    	let t20;
    	let div8;
    	let label2;
    	let t21;
    	let span3;
    	let t23;
    	let input3;
    	let t24;
    	let div9;
    	let label3;
    	let t25;
    	let span4;
    	let t27;
    	let select0;
    	let option0;
    	let option1;
    	let t30;
    	let div15;
    	let div11;
    	let label4;
    	let t31;
    	let span5;
    	let t33;
    	let input4;
    	let t34;
    	let div12;
    	let label5;
    	let t35;
    	let span6;
    	let t37;
    	let input5;
    	let t38;
    	let div13;
    	let label6;
    	let t39;
    	let span7;
    	let t41;
    	let input6;
    	let t42;
    	let div14;
    	let label7;
    	let t43;
    	let span8;
    	let t45;
    	let select1;
    	let option2;
    	let t47;
    	let div17;
    	let button;
    	let t49;
    	let br;
    	let t50;
    	let p1;
    	let t51;
    	let a;

    	const block = {
    		c: function create() {
    			div18 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Register as a Member";
    			t1 = space();
    			section = element("section");
    			div4 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t2 = text("All fields marked ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(" are all important");
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Please note that Full Name must contain at least First and Last Name preferably, a third name may be added.";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "Please provide at least a phone number and/or email address";
    			t9 = space();
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Upload Profile Picture";
    			t11 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t12 = space();
    			div16 = element("div");
    			div10 = element("div");
    			div6 = element("div");
    			label0 = element("label");
    			t13 = text("Full Name ");
    			span1 = element("span");
    			span1.textContent = "*";
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			div7 = element("div");
    			label1 = element("label");
    			t17 = text("Password ");
    			span2 = element("span");
    			span2.textContent = "*";
    			t19 = space();
    			input2 = element("input");
    			t20 = space();
    			div8 = element("div");
    			label2 = element("label");
    			t21 = text("Telephone Number ");
    			span3 = element("span");
    			span3.textContent = "*";
    			t23 = space();
    			input3 = element("input");
    			t24 = space();
    			div9 = element("div");
    			label3 = element("label");
    			t25 = text("Gender");
    			span4 = element("span");
    			span4.textContent = "*";
    			t27 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Male";
    			option1 = element("option");
    			option1.textContent = "Female";
    			t30 = space();
    			div15 = element("div");
    			div11 = element("div");
    			label4 = element("label");
    			t31 = text("Confirm Password ");
    			span5 = element("span");
    			span5.textContent = "*";
    			t33 = space();
    			input4 = element("input");
    			t34 = space();
    			div12 = element("div");
    			label5 = element("label");
    			t35 = text("Email Address ");
    			span6 = element("span");
    			span6.textContent = "*";
    			t37 = space();
    			input5 = element("input");
    			t38 = space();
    			div13 = element("div");
    			label6 = element("label");
    			t39 = text("Date of Birth ");
    			span7 = element("span");
    			span7.textContent = "*";
    			t41 = space();
    			input6 = element("input");
    			t42 = space();
    			div14 = element("div");
    			label7 = element("label");
    			t43 = text("Local Goverment Area ");
    			span8 = element("span");
    			span8.textContent = "*";
    			t45 = space();
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "select LGA";
    			t47 = space();
    			div17 = element("div");
    			button = element("button");
    			button.textContent = "Sign Up";
    			t49 = space();
    			br = element("br");
    			t50 = space();
    			p1 = element("p");
    			t51 = text("Already have an account? ");
    			a = element("a");
    			a.textContent = "Sign in";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900");
    			add_location(h1, file$h, 2, 6, 107);
    			attr_dev(span0, "class", "text-red-500");
    			add_location(span0, file$h, 6, 74, 532);
    			attr_dev(p0, "class", "leading-relaxed text-base mb-3");
    			add_location(p0, file$h, 6, 14, 472);
    			attr_dev(li0, "class", "mb-4 font-light text-sm");
    			add_location(li0, file$h, 8, 18, 645);
    			attr_dev(li1, "class", "mb-4 font-light text-sm");
    			add_location(li1, file$h, 9, 18, 812);
    			attr_dev(ul, "class", "list-disc");
    			add_location(ul, file$h, 7, 14, 604);
    			attr_dev(div0, "class", "md:w-1/2 md:pr-12 md:py-4 md:border-r md:border-b-0 mb-10 md:mb-0 pb-10 border-b border-gray-200");
    			add_location(div0, file$h, 5, 12, 347);
    			attr_dev(h2, "class", "title-font font-semibold text-gray-800 tracking-wider text-sm mb-3");
    			add_location(h2, file$h, 13, 14, 1024);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "ppics");
    			attr_dev(input0, "id", "fileupload");
    			attr_dev(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$h, 17, 20, 1245);
    			attr_dev(div1, "class", "mt-2 flex items-center");
    			add_location(div1, file$h, 16, 18, 1188);
    			add_location(div2, file$h, 14, 14, 1145);
    			attr_dev(div3, "class", "flex flex-col md:w-1/2 md:pl-12");
    			add_location(div3, file$h, 12, 12, 964);
    			attr_dev(div4, "class", "container flex flex-wrap px-5 py-5 mx-auto items-center");
    			add_location(div4, file$h, 4, 10, 265);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$h, 3, 6, 213);
    			attr_dev(div5, "class", "flex flex-col text-justify w-full mb-12");
    			add_location(div5, file$h, 1, 4, 47);
    			attr_dev(span1, "class", "text-red-500");
    			add_location(span1, file$h, 30, 74, 1932);
    			attr_dev(label0, "for", "fullname");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$h, 30, 2, 1860);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "fullname");
    			attr_dev(input1, "name", "fullname");
    			attr_dev(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$h, 31, 2, 1978);
    			attr_dev(div6, "class", "relative mb-4");
    			add_location(div6, file$h, 29, 0, 1830);
    			attr_dev(span2, "class", "text-red-500");
    			add_location(span2, file$h, 34, 73, 2344);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$h, 34, 2, 2273);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input2, file$h, 35, 2, 2390);
    			attr_dev(div7, "class", "relative mb-4");
    			add_location(div7, file$h, 33, 0, 2243);
    			attr_dev(span3, "class", "text-red-500");
    			add_location(span3, file$h, 38, 84, 2767);
    			attr_dev(label2, "for", "phonenumber");
    			attr_dev(label2, "class", "leading-7 text-sm text-gray-600");
    			add_location(label2, file$h, 38, 2, 2685);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "phonenumber");
    			attr_dev(input3, "name", "phonenumber");
    			attr_dev(input3, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input3, file$h, 39, 2, 2813);
    			attr_dev(div8, "class", "relative mb-4");
    			add_location(div8, file$h, 37, 0, 2655);
    			attr_dev(span4, "class", "text-red-500");
    			add_location(span4, file$h, 42, 68, 3180);
    			attr_dev(label3, "for", "gender");
    			attr_dev(label3, "class", "leading-7 text-sm text-gray-600");
    			add_location(label3, file$h, 42, 2, 3114);
    			option0.__value = "male";
    			option0.value = option0.__value;
    			add_location(option0, file$h, 44, 6, 3475);
    			option1.__value = "female";
    			option1.value = option1.__value;
    			add_location(option1, file$h, 45, 6, 3517);
    			attr_dev(select0, "id", "gender");
    			attr_dev(select0, "name", "gender");
    			attr_dev(select0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select0, file$h, 43, 2, 3226);
    			attr_dev(div9, "class", "relative mb-4");
    			add_location(div9, file$h, 41, 0, 3084);
    			attr_dev(div10, "class", "relative flex-grow w-full");
    			add_location(div10, file$h, 27, 0, 1766);
    			attr_dev(span5, "class", "text-red-500");
    			add_location(span5, file$h, 74, 97, 5171);
    			attr_dev(label4, "for", "confirm_password");
    			attr_dev(label4, "class", "leading-7 text-sm text-gray-600");
    			add_location(label4, file$h, 74, 10, 5084);
    			attr_dev(input4, "type", "confirm_password");
    			attr_dev(input4, "id", "confirm_password");
    			attr_dev(input4, "name", "confirm_password");
    			attr_dev(input4, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input4, file$h, 75, 10, 5226);
    			attr_dev(div11, "class", "relative mb-4");
    			add_location(div11, file$h, 73, 8, 5046);
    			attr_dev(span6, "class", "text-red-500");
    			add_location(span6, file$h, 78, 83, 5647);
    			attr_dev(label5, "for", "email");
    			attr_dev(label5, "class", "leading-7 text-sm text-gray-600");
    			add_location(label5, file$h, 78, 10, 5574);
    			attr_dev(input5, "type", "email");
    			attr_dev(input5, "id", "email");
    			attr_dev(input5, "name", "email");
    			attr_dev(input5, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input5, file$h, 79, 10, 5702);
    			attr_dev(div12, "class", "relative mb-4");
    			add_location(div12, file$h, 77, 8, 5536);
    			attr_dev(span7, "class", "text-red-500");
    			add_location(span7, file$h, 82, 81, 6088);
    			attr_dev(label6, "for", "dob");
    			attr_dev(label6, "class", "leading-7 text-sm text-gray-600");
    			add_location(label6, file$h, 82, 10, 6017);
    			attr_dev(input6, "type", "date");
    			attr_dev(input6, "id", "dob");
    			attr_dev(input6, "name", "dob");
    			attr_dev(input6, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input6, file$h, 83, 10, 6143);
    			attr_dev(div13, "class", "relative mb-4");
    			add_location(div13, file$h, 81, 8, 5979);
    			attr_dev(span8, "class", "text-red-500");
    			add_location(span8, file$h, 86, 88, 6530);
    			attr_dev(label7, "for", "lga");
    			attr_dev(label7, "class", "leading-7 text-sm text-gray-600");
    			add_location(label7, file$h, 86, 10, 6452);
    			option2.__value = "";
    			option2.value = option2.__value;
    			add_location(option2, file$h, 88, 14, 6836);
    			attr_dev(select1, "id", "lga");
    			attr_dev(select1, "name", "lga");
    			attr_dev(select1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select1, file$h, 87, 10, 6585);
    			attr_dev(div14, "class", "relative mb-4");
    			add_location(div14, file$h, 85, 7, 6414);
    			attr_dev(div15, "class", "relative flex-grow w-full");
    			add_location(div15, file$h, 66, 0, 4493);
    			attr_dev(div16, "class", "flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end");
    			add_location(div16, file$h, 25, 4, 1642);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-8 focus:outline-none hover:bg-red-600 rounded text-lg mx-auto my-3");
    			add_location(button, file$h, 102, 41, 7547);
    			add_location(br, file$h, 102, 180, 7686);
    			attr_dev(a, "href", "/login");
    			attr_dev(a, "class", "text-blue-500");
    			add_location(a, file$h, 103, 63, 7754);
    			attr_dev(p1, "class", "text-sm text-center");
    			add_location(p1, file$h, 103, 6, 7697);
    			attr_dev(div17, "class", "container mx-auto w-32");
    			add_location(div17, file$h, 102, 4, 7510);
    			attr_dev(div18, "class", "container px-5 py-10 mx-auto");
    			add_location(div18, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div5);
    			append_dev(div5, h1);
    			append_dev(div5, t1);
    			append_dev(div5, section);
    			append_dev(section, div4);
    			append_dev(div4, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, span0);
    			append_dev(p0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			append_dev(div18, t12);
    			append_dev(div18, div16);
    			append_dev(div16, div10);
    			append_dev(div10, div6);
    			append_dev(div6, label0);
    			append_dev(label0, t13);
    			append_dev(label0, span1);
    			append_dev(div6, t15);
    			append_dev(div6, input1);
    			append_dev(div10, t16);
    			append_dev(div10, div7);
    			append_dev(div7, label1);
    			append_dev(label1, t17);
    			append_dev(label1, span2);
    			append_dev(div7, t19);
    			append_dev(div7, input2);
    			append_dev(div10, t20);
    			append_dev(div10, div8);
    			append_dev(div8, label2);
    			append_dev(label2, t21);
    			append_dev(label2, span3);
    			append_dev(div8, t23);
    			append_dev(div8, input3);
    			append_dev(div10, t24);
    			append_dev(div10, div9);
    			append_dev(div9, label3);
    			append_dev(label3, t25);
    			append_dev(label3, span4);
    			append_dev(div9, t27);
    			append_dev(div9, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(div16, t30);
    			append_dev(div16, div15);
    			append_dev(div15, div11);
    			append_dev(div11, label4);
    			append_dev(label4, t31);
    			append_dev(label4, span5);
    			append_dev(div11, t33);
    			append_dev(div11, input4);
    			append_dev(div15, t34);
    			append_dev(div15, div12);
    			append_dev(div12, label5);
    			append_dev(label5, t35);
    			append_dev(label5, span6);
    			append_dev(div12, t37);
    			append_dev(div12, input5);
    			append_dev(div15, t38);
    			append_dev(div15, div13);
    			append_dev(div13, label6);
    			append_dev(label6, t39);
    			append_dev(label6, span7);
    			append_dev(div13, t41);
    			append_dev(div13, input6);
    			append_dev(div15, t42);
    			append_dev(div15, div14);
    			append_dev(div14, label7);
    			append_dev(label7, t43);
    			append_dev(label7, span8);
    			append_dev(div14, t45);
    			append_dev(div14, select1);
    			append_dev(select1, option2);
    			append_dev(div18, t47);
    			append_dev(div18, div17);
    			append_dev(div17, button);
    			append_dev(div17, t49);
    			append_dev(div17, br);
    			append_dev(div17, t50);
    			append_dev(div17, p1);
    			append_dev(p1, t51);
    			append_dev(p1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div18);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MemberForm", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MemberForm> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class MemberForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MemberForm",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/components/Forms/SupporterForm.svelte generated by Svelte v3.31.2 */

    const file$i = "src/components/Forms/SupporterForm.svelte";

    function create_fragment$m(ctx) {
    	let div22;
    	let div5;
    	let h1;
    	let t1;
    	let section;
    	let div4;
    	let div0;
    	let p0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let ul;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let div3;
    	let h2;
    	let t11;
    	let div2;
    	let div1;
    	let input0;
    	let t12;
    	let div20;
    	let div12;
    	let div6;
    	let label0;
    	let t13;
    	let span1;
    	let t15;
    	let input1;
    	let t16;
    	let div7;
    	let label1;
    	let t17;
    	let span2;
    	let t19;
    	let input2;
    	let t20;
    	let div8;
    	let label2;
    	let t21;
    	let span3;
    	let t23;
    	let input3;
    	let t24;
    	let div9;
    	let label3;
    	let t25;
    	let span4;
    	let t27;
    	let select0;
    	let option0;
    	let option1;
    	let t30;
    	let div10;
    	let label4;
    	let t31;
    	let span5;
    	let t33;
    	let select1;
    	let option2;
    	let t35;
    	let div11;
    	let label5;
    	let t36;
    	let span6;
    	let t38;
    	let select2;
    	let option3;
    	let t40;
    	let div19;
    	let div13;
    	let label6;
    	let t41;
    	let span7;
    	let t43;
    	let input4;
    	let t44;
    	let div14;
    	let label7;
    	let t45;
    	let span8;
    	let t47;
    	let input5;
    	let t48;
    	let div15;
    	let label8;
    	let t49;
    	let span9;
    	let t51;
    	let input6;
    	let t52;
    	let div16;
    	let label9;
    	let t53;
    	let span10;
    	let t55;
    	let input7;
    	let t56;
    	let div17;
    	let label10;
    	let t57;
    	let span11;
    	let t59;
    	let select3;
    	let option4;
    	let t61;
    	let div18;
    	let label11;
    	let t62;
    	let span12;
    	let t64;
    	let select4;
    	let option5;
    	let t66;
    	let div21;
    	let button;
    	let t68;
    	let br;
    	let t69;
    	let p1;
    	let t70;
    	let a;

    	const block = {
    		c: function create() {
    			div22 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Register as a Supporter";
    			t1 = space();
    			section = element("section");
    			div4 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t2 = text("All fields marked ");
    			span0 = element("span");
    			span0.textContent = "*";
    			t4 = text(" are all important");
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Please note that Full Name must contain at least First and Last Name preferably, a third name may be added.";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "Please provide at least a phone number and/or email address";
    			t9 = space();
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Upload Profile Picture";
    			t11 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t12 = space();
    			div20 = element("div");
    			div12 = element("div");
    			div6 = element("div");
    			label0 = element("label");
    			t13 = text("Full Name ");
    			span1 = element("span");
    			span1.textContent = "*";
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			div7 = element("div");
    			label1 = element("label");
    			t17 = text("Password ");
    			span2 = element("span");
    			span2.textContent = "*";
    			t19 = space();
    			input2 = element("input");
    			t20 = space();
    			div8 = element("div");
    			label2 = element("label");
    			t21 = text("Telephone Number ");
    			span3 = element("span");
    			span3.textContent = "*";
    			t23 = space();
    			input3 = element("input");
    			t24 = space();
    			div9 = element("div");
    			label3 = element("label");
    			t25 = text("Gender");
    			span4 = element("span");
    			span4.textContent = "*";
    			t27 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Male";
    			option1 = element("option");
    			option1.textContent = "Female";
    			t30 = space();
    			div10 = element("div");
    			label4 = element("label");
    			t31 = text("State");
    			span5 = element("span");
    			span5.textContent = "*";
    			t33 = space();
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "select state";
    			t35 = space();
    			div11 = element("div");
    			label5 = element("label");
    			t36 = text("Ward");
    			span6 = element("span");
    			span6.textContent = "*";
    			t38 = space();
    			select2 = element("select");
    			option3 = element("option");
    			option3.textContent = "select ward";
    			t40 = space();
    			div19 = element("div");
    			div13 = element("div");
    			label6 = element("label");
    			t41 = text("PVC Number ");
    			span7 = element("span");
    			span7.textContent = "*";
    			t43 = space();
    			input4 = element("input");
    			t44 = space();
    			div14 = element("div");
    			label7 = element("label");
    			t45 = text("Confirm Password ");
    			span8 = element("span");
    			span8.textContent = "*";
    			t47 = space();
    			input5 = element("input");
    			t48 = space();
    			div15 = element("div");
    			label8 = element("label");
    			t49 = text("Email Address ");
    			span9 = element("span");
    			span9.textContent = "*";
    			t51 = space();
    			input6 = element("input");
    			t52 = space();
    			div16 = element("div");
    			label9 = element("label");
    			t53 = text("Date of Birth ");
    			span10 = element("span");
    			span10.textContent = "*";
    			t55 = space();
    			input7 = element("input");
    			t56 = space();
    			div17 = element("div");
    			label10 = element("label");
    			t57 = text("Local Goverment Area ");
    			span11 = element("span");
    			span11.textContent = "*";
    			t59 = space();
    			select3 = element("select");
    			option4 = element("option");
    			option4.textContent = "select LGA";
    			t61 = space();
    			div18 = element("div");
    			label11 = element("label");
    			t62 = text("Voting Unit ");
    			span12 = element("span");
    			span12.textContent = "*";
    			t64 = space();
    			select4 = element("select");
    			option5 = element("option");
    			option5.textContent = "select voting unit";
    			t66 = space();
    			div21 = element("div");
    			button = element("button");
    			button.textContent = "Sign Up";
    			t68 = space();
    			br = element("br");
    			t69 = space();
    			p1 = element("p");
    			t70 = text("Already have an account? ");
    			a = element("a");
    			a.textContent = "Sign in";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900");
    			add_location(h1, file$i, 2, 6, 107);
    			attr_dev(span0, "class", "text-red-500");
    			add_location(span0, file$i, 6, 74, 535);
    			attr_dev(p0, "class", "leading-relaxed text-base mb-3");
    			add_location(p0, file$i, 6, 14, 475);
    			attr_dev(li0, "class", "mb-4 text-sm font-light");
    			add_location(li0, file$i, 8, 18, 648);
    			attr_dev(li1, "class", "mb-4 text-sm font-light");
    			add_location(li1, file$i, 9, 18, 815);
    			attr_dev(ul, "class", "list-disc");
    			add_location(ul, file$i, 7, 14, 607);
    			attr_dev(div0, "class", "md:w-1/2 md:pr-12 md:py-4 md:border-r md:border-b-0 mb-10 md:mb-0 pb-10 border-b border-gray-200");
    			add_location(div0, file$i, 5, 12, 350);
    			attr_dev(h2, "class", "title-font font-semibold text-gray-800 tracking-wider text-sm mb-3");
    			add_location(h2, file$i, 13, 14, 1027);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "ppics");
    			attr_dev(input0, "id", "fileupload");
    			attr_dev(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$i, 17, 20, 1248);
    			attr_dev(div1, "class", "mt-2 flex items-center");
    			add_location(div1, file$i, 16, 18, 1191);
    			add_location(div2, file$i, 14, 14, 1148);
    			attr_dev(div3, "class", "flex flex-col md:w-1/2 md:pl-12");
    			add_location(div3, file$i, 12, 12, 967);
    			attr_dev(div4, "class", "container flex flex-wrap px-5 py-5 mx-auto items-center");
    			add_location(div4, file$i, 4, 10, 268);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$i, 3, 6, 216);
    			attr_dev(div5, "class", "flex flex-col text-justify w-full mb-12");
    			add_location(div5, file$i, 1, 4, 47);
    			attr_dev(span1, "class", "text-red-500");
    			add_location(span1, file$i, 30, 74, 1935);
    			attr_dev(label0, "for", "fullname");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$i, 30, 2, 1863);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "fullname");
    			attr_dev(input1, "name", "fullname");
    			attr_dev(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$i, 31, 2, 1981);
    			attr_dev(div6, "class", "relative mb-4");
    			add_location(div6, file$i, 29, 0, 1833);
    			attr_dev(span2, "class", "text-red-500");
    			add_location(span2, file$i, 34, 73, 2347);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$i, 34, 2, 2276);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input2, file$i, 35, 2, 2393);
    			attr_dev(div7, "class", "relative mb-4");
    			add_location(div7, file$i, 33, 0, 2246);
    			attr_dev(span3, "class", "text-red-500");
    			add_location(span3, file$i, 38, 84, 2770);
    			attr_dev(label2, "for", "phonenumber");
    			attr_dev(label2, "class", "leading-7 text-sm text-gray-600");
    			add_location(label2, file$i, 38, 2, 2688);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "phonenumber");
    			attr_dev(input3, "name", "phonenumber");
    			attr_dev(input3, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input3, file$i, 39, 2, 2816);
    			attr_dev(div8, "class", "relative mb-4");
    			add_location(div8, file$i, 37, 0, 2658);
    			attr_dev(span4, "class", "text-red-500");
    			add_location(span4, file$i, 42, 68, 3183);
    			attr_dev(label3, "for", "gender");
    			attr_dev(label3, "class", "leading-7 text-sm text-gray-600");
    			add_location(label3, file$i, 42, 2, 3117);
    			option0.__value = "male";
    			option0.value = option0.__value;
    			add_location(option0, file$i, 44, 6, 3478);
    			option1.__value = "female";
    			option1.value = option1.__value;
    			add_location(option1, file$i, 45, 6, 3520);
    			attr_dev(select0, "id", "gender");
    			attr_dev(select0, "name", "gender");
    			attr_dev(select0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select0, file$i, 43, 2, 3229);
    			attr_dev(div9, "class", "relative mb-4");
    			add_location(div9, file$i, 41, 0, 3087);
    			attr_dev(span5, "class", "text-red-500");
    			add_location(span5, file$i, 49, 66, 3673);
    			attr_dev(label4, "for", "state");
    			attr_dev(label4, "class", "leading-7 text-sm text-gray-600");
    			add_location(label4, file$i, 49, 2, 3609);
    			option2.__value = "";
    			option2.value = option2.__value;
    			add_location(option2, file$i, 51, 6, 3966);
    			attr_dev(select1, "id", "state");
    			attr_dev(select1, "name", "state");
    			attr_dev(select1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select1, file$i, 50, 2, 3719);
    			attr_dev(div10, "class", "relative mb-4");
    			add_location(div10, file$i, 48, 0, 3579);
    			attr_dev(span6, "class", "text-red-500");
    			add_location(span6, file$i, 56, 64, 4123);
    			attr_dev(label5, "for", "ward");
    			attr_dev(label5, "class", "leading-7 text-sm text-gray-600");
    			add_location(label5, file$i, 56, 2, 4061);
    			option3.__value = "";
    			option3.value = option3.__value;
    			add_location(option3, file$i, 58, 6, 4414);
    			attr_dev(select2, "id", "ward");
    			attr_dev(select2, "name", "ward");
    			attr_dev(select2, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select2, file$i, 57, 2, 4169);
    			attr_dev(div11, "class", "relative mb-4");
    			add_location(div11, file$i, 55, 0, 4031);
    			attr_dev(div12, "class", "relative flex-grow w-full");
    			add_location(div12, file$i, 27, 0, 1769);
    			attr_dev(span7, "class", "text-red-500");
    			add_location(span7, file$i, 69, 85, 4678);
    			attr_dev(label6, "for", "pvc_number");
    			attr_dev(label6, "class", "leading-7 text-sm text-gray-600");
    			add_location(label6, file$i, 69, 10, 4603);
    			attr_dev(input4, "type", "pvc_number");
    			attr_dev(input4, "id", "pvc_number");
    			attr_dev(input4, "name", "pvc_number");
    			attr_dev(input4, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input4, file$i, 70, 10, 4734);
    			attr_dev(div13, "class", "relative mb-4");
    			add_location(div13, file$i, 68, 7, 4565);
    			attr_dev(span8, "class", "text-red-500");
    			add_location(span8, file$i, 74, 97, 5156);
    			attr_dev(label7, "for", "confirm_password");
    			attr_dev(label7, "class", "leading-7 text-sm text-gray-600");
    			add_location(label7, file$i, 74, 10, 5069);
    			attr_dev(input5, "type", "confirm_password");
    			attr_dev(input5, "id", "confirm_password");
    			attr_dev(input5, "name", "confirm_password");
    			attr_dev(input5, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input5, file$i, 75, 10, 5211);
    			attr_dev(div14, "class", "relative mb-4");
    			add_location(div14, file$i, 73, 8, 5031);
    			attr_dev(span9, "class", "text-red-500");
    			add_location(span9, file$i, 78, 83, 5632);
    			attr_dev(label8, "for", "email");
    			attr_dev(label8, "class", "leading-7 text-sm text-gray-600");
    			add_location(label8, file$i, 78, 10, 5559);
    			attr_dev(input6, "type", "email");
    			attr_dev(input6, "id", "email");
    			attr_dev(input6, "name", "email");
    			attr_dev(input6, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input6, file$i, 79, 10, 5687);
    			attr_dev(div15, "class", "relative mb-4");
    			add_location(div15, file$i, 77, 8, 5521);
    			attr_dev(span10, "class", "text-red-500");
    			add_location(span10, file$i, 82, 81, 6073);
    			attr_dev(label9, "for", "dob");
    			attr_dev(label9, "class", "leading-7 text-sm text-gray-600");
    			add_location(label9, file$i, 82, 10, 6002);
    			attr_dev(input7, "type", "date");
    			attr_dev(input7, "id", "dob");
    			attr_dev(input7, "name", "dob");
    			attr_dev(input7, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input7, file$i, 83, 10, 6128);
    			attr_dev(div16, "class", "relative mb-4");
    			add_location(div16, file$i, 81, 8, 5964);
    			attr_dev(span11, "class", "text-red-500");
    			add_location(span11, file$i, 86, 88, 6516);
    			attr_dev(label10, "for", "lga");
    			attr_dev(label10, "class", "leading-7 text-sm text-gray-600");
    			add_location(label10, file$i, 86, 10, 6438);
    			option4.__value = "";
    			option4.value = option4.__value;
    			add_location(option4, file$i, 88, 14, 6822);
    			attr_dev(select3, "id", "lga");
    			attr_dev(select3, "name", "lga");
    			attr_dev(select3, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select3, file$i, 87, 10, 6571);
    			attr_dev(div17, "class", "relative mb-4");
    			add_location(div17, file$i, 85, 8, 6400);
    			attr_dev(span12, "class", "text-red-500");
    			add_location(span12, file$i, 93, 87, 7033);
    			attr_dev(label11, "for", "voting_unit");
    			attr_dev(label11, "class", "leading-7 text-sm text-gray-600");
    			add_location(label11, file$i, 93, 10, 6956);
    			option5.__value = "";
    			option5.value = option5.__value;
    			add_location(option5, file$i, 95, 14, 7355);
    			attr_dev(select4, "id", "voting_unit");
    			attr_dev(select4, "name", "voting_unit");
    			attr_dev(select4, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select4, file$i, 94, 10, 7088);
    			attr_dev(div18, "class", "relative mb-4");
    			add_location(div18, file$i, 92, 8, 6918);
    			attr_dev(div19, "class", "relative flex-grow w-full");
    			add_location(div19, file$i, 66, 0, 4487);
    			attr_dev(div20, "class", "flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end");
    			add_location(div20, file$i, 25, 4, 1645);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-8 focus:outline-none hover:bg-red-600 rounded text-lg mx-auto my-3");
    			add_location(button, file$i, 102, 41, 7523);
    			add_location(br, file$i, 102, 180, 7662);
    			attr_dev(a, "href", "/login");
    			attr_dev(a, "class", "text-blue-500");
    			add_location(a, file$i, 103, 63, 7730);
    			attr_dev(p1, "class", "text-sm text-center");
    			add_location(p1, file$i, 103, 6, 7673);
    			attr_dev(div21, "class", "container mx-auto w-32");
    			add_location(div21, file$i, 102, 4, 7486);
    			attr_dev(div22, "class", "container px-5 py-10 mx-auto");
    			add_location(div22, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div22, anchor);
    			append_dev(div22, div5);
    			append_dev(div5, h1);
    			append_dev(div5, t1);
    			append_dev(div5, section);
    			append_dev(section, div4);
    			append_dev(div4, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, span0);
    			append_dev(p0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			append_dev(div22, t12);
    			append_dev(div22, div20);
    			append_dev(div20, div12);
    			append_dev(div12, div6);
    			append_dev(div6, label0);
    			append_dev(label0, t13);
    			append_dev(label0, span1);
    			append_dev(div6, t15);
    			append_dev(div6, input1);
    			append_dev(div12, t16);
    			append_dev(div12, div7);
    			append_dev(div7, label1);
    			append_dev(label1, t17);
    			append_dev(label1, span2);
    			append_dev(div7, t19);
    			append_dev(div7, input2);
    			append_dev(div12, t20);
    			append_dev(div12, div8);
    			append_dev(div8, label2);
    			append_dev(label2, t21);
    			append_dev(label2, span3);
    			append_dev(div8, t23);
    			append_dev(div8, input3);
    			append_dev(div12, t24);
    			append_dev(div12, div9);
    			append_dev(div9, label3);
    			append_dev(label3, t25);
    			append_dev(label3, span4);
    			append_dev(div9, t27);
    			append_dev(div9, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(div12, t30);
    			append_dev(div12, div10);
    			append_dev(div10, label4);
    			append_dev(label4, t31);
    			append_dev(label4, span5);
    			append_dev(div10, t33);
    			append_dev(div10, select1);
    			append_dev(select1, option2);
    			append_dev(div12, t35);
    			append_dev(div12, div11);
    			append_dev(div11, label5);
    			append_dev(label5, t36);
    			append_dev(label5, span6);
    			append_dev(div11, t38);
    			append_dev(div11, select2);
    			append_dev(select2, option3);
    			append_dev(div20, t40);
    			append_dev(div20, div19);
    			append_dev(div19, div13);
    			append_dev(div13, label6);
    			append_dev(label6, t41);
    			append_dev(label6, span7);
    			append_dev(div13, t43);
    			append_dev(div13, input4);
    			append_dev(div19, t44);
    			append_dev(div19, div14);
    			append_dev(div14, label7);
    			append_dev(label7, t45);
    			append_dev(label7, span8);
    			append_dev(div14, t47);
    			append_dev(div14, input5);
    			append_dev(div19, t48);
    			append_dev(div19, div15);
    			append_dev(div15, label8);
    			append_dev(label8, t49);
    			append_dev(label8, span9);
    			append_dev(div15, t51);
    			append_dev(div15, input6);
    			append_dev(div19, t52);
    			append_dev(div19, div16);
    			append_dev(div16, label9);
    			append_dev(label9, t53);
    			append_dev(label9, span10);
    			append_dev(div16, t55);
    			append_dev(div16, input7);
    			append_dev(div19, t56);
    			append_dev(div19, div17);
    			append_dev(div17, label10);
    			append_dev(label10, t57);
    			append_dev(label10, span11);
    			append_dev(div17, t59);
    			append_dev(div17, select3);
    			append_dev(select3, option4);
    			append_dev(div19, t61);
    			append_dev(div19, div18);
    			append_dev(div18, label11);
    			append_dev(label11, t62);
    			append_dev(label11, span12);
    			append_dev(div18, t64);
    			append_dev(div18, select4);
    			append_dev(select4, option5);
    			append_dev(div22, t66);
    			append_dev(div22, div21);
    			append_dev(div21, button);
    			append_dev(div21, t68);
    			append_dev(div21, br);
    			append_dev(div21, t69);
    			append_dev(div21, p1);
    			append_dev(p1, t70);
    			append_dev(p1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div22);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SupporterForm", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SupporterForm> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SupporterForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SupporterForm",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/pages/Register.svelte generated by Svelte v3.31.2 */
    const file$j = "src/pages/Register.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (16:10) {#each options as opt }
    function create_each_block$3(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[3].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = ctx[3];
    			option.value = option.__value;
    			add_location(option, file$j, 16, 12, 741);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(16:10) {#each options as opt }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let section;
    	let div;
    	let select;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	var switch_value = /*selected*/ ctx[0].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(select, "class", "sm:text-xl text-md mx-4 mt-20 w-1/2 bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-1 leading-8 transition-colors duration-200 ease-in-out ");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$j, 14, 6, 426);
    			attr_dev(div, "class", "flex items-center container mx-auto w-full");
    			add_location(div, file$j, 13, 4, 363);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$j, 12, 2, 317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[0]);
    			append_dev(section, t);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options*/ 2) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, options*/ 3) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			if (switch_value !== (switch_value = /*selected*/ ctx[0].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Register", slots, []);

    	const options = [
    		{
    			name: "Suppoters Form",
    			component: SupporterForm
    		},
    		{
    			name: "Members Form",
    			component: MemberForm
    		}
    	];

    	let selected = options[0];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, options);
    	}

    	$$self.$capture_state = () => ({
    		MemberForm,
    		SupporterForm,
    		options,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, options, select_change_handler];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/pages/Candidates.svelte generated by Svelte v3.31.2 */

    const file$k = "src/pages/Candidates.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (23:8) {#each biographies as bio}
    function create_each_block$4(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*bio*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let h3;
    	let t3_value = /*bio*/ ctx[1].position + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = /*bio*/ ctx[1].bio + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			h3 = element("h3");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			if (img.src !== (img_src_value = /*bio*/ ctx[1].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "w-full");
    			add_location(img, file$k, 25, 66, 3195);
    			attr_dev(span, "class", "font-semibold title-font text-gray-700");
    			add_location(span, file$k, 25, 12, 3141);
    			attr_dev(div0, "class", "md:w-64 w-1/2 md:mb-0 mb-6 flex-shrink-0 flex flex-col");
    			add_location(div0, file$k, 24, 10, 3060);
    			attr_dev(h1, "class", "text-2xl font-medium text-red-900 title-font mb-2");
    			add_location(h1, file$k, 29, 12, 3331);
    			attr_dev(h3, "class", "text-2xl font-medium text-blue-900 title-font mb-2");
    			add_location(h3, file$k, 30, 12, 3421);
    			attr_dev(p, "class", "leading-relaxed font-light text-sm :text-md");
    			add_location(p, file$k, 31, 12, 3516);
    			attr_dev(div1, "class", "md:flex-grow pl-10");
    			add_location(div1, file$k, 28, 10, 3286);
    			attr_dev(div2, "class", "py-8 flex items-center justify-center flex-wrap md:flex-nowrap");
    			add_location(div2, file$k, 23, 8, 2973);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, h3);
    			append_dev(h3, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(div2, t6);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(23:8) {#each biographies as bio}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let each_value = /*biographies*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "-my-8 divide-y-2 divide-gray-100");
    			add_location(div0, file$k, 21, 6, 2883);
    			attr_dev(div1, "class", "container px-5 py-24 mx-auto");
    			add_location(div1, file$k, 20, 4, 2834);
    			attr_dev(section, "class", "text-gray-600 body-font overflow-hidden");
    			add_location(section, file$k, 19, 0, 2772);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*biographies*/ 1) {
    				each_value = /*biographies*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Candidates", slots, []);

    	const biographies = [
    		{
    			name: "Engr. Yabagi Y. Sani",
    			image: "../nChairman.jpg",
    			position: "ADP Presidential Candidate",
    			bio: "Engr. Yabagi Yusuf Sani is one of the leading lights in Nigerian Politics and Corporate Business World. Born on July 1, 1954 Yabagi Yusuf Sani attended East Primary School, Bida and Technical Secondary School, Kotangora, Niger State, Nigeria. He later proceeded to the Institute of Technology, New York, USA. Yabagi is also a product of Colombia University, New York, USA where he studied Industrial and Management Engineering with emphasis in Operations Research. Yabagi also attended an Executive Management Program in Havard Business School in Boston Massachusetts. Since his graduation and completion of the mandatory one - year National Youth Service (NYSC) in Nigeria, Engr. Yabagi has been a key player in Nigeria's Oil and Gas sector where he has helped the Government of Nigeria in the development of innovative schemes and strategies to block leakages in the ever porous sector.  "
    		},
    		{
    			name: "Martin Kunle Olateru-Olagbegi",
    			image: "../kunle.jpg",
    			position: "ADP Vice Presidential Candidate",
    			bio: "Martin Kunle Olateru-Olagbegi, was born in Owo, Ondo State, Nigeria. Educated at Owo Government School and Olivet Baptist High School in Oyo, Martin's exceptional academic and athletic accomplishments opened numerous doors for him. As a teenager, Martin received a variety of admission and scholarship offers from colleges and universities throughout the United States, and ultimately decided to study architecture at Prairie View A & M University in Texas As a degreed architect, Martin quickly secured a position at ATTI in Baltimore, Maryland where he worked for two years before moving to Atlanta in 1986. For the next ten years, he served as the architectural program coordinator for the City of Atlanta overseeing complex projects such as the municipal court, firehouses, the city jail, traffic court, and the City Halt Annex. He had oversight of twenty-seven buildings, numerous employees, and an operational budget of over a $100,000,000. In 1996, Martin, recognized for his acute business acumen, founded Nite, Inc., a design, construction and environmental management firm where he served as president and chief executive officer. Headquartered in Atlanta, Georgia, Nile, Inc, had offices in Corpus Christi, Texas and Barnwell, South Carolina. Other locations included Alabama, Mississippi, Kissmmee, Florida and Washington, D.C. These outfits provided viable employment opportunities to numerous individuals, subcontractors and suppliers throughout the northeast and southeast regions of the United States."
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Candidates> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ biographies });
    	return [biographies];
    }

    class Candidates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Candidates",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/pages/Contact.svelte generated by Svelte v3.31.2 */

    const file$l = "src/pages/Contact.svelte";

    function create_fragment$p(ctx) {
    	let section;
    	let div0;
    	let iframe;
    	let iframe_src_value;
    	let t0;
    	let div4;
    	let div3;
    	let h2;
    	let t2;
    	let p0;
    	let t3;
    	let br;
    	let t4;
    	let t5;
    	let p1;
    	let p2;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let t7;
    	let span1;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let t9;
    	let span2;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let t11;
    	let span3;
    	let img3;
    	let img3_src_value;
    	let t12;
    	let t13;
    	let div1;
    	let label0;
    	let t15;
    	let input;
    	let t16;
    	let div2;
    	let label1;
    	let t18;
    	let textarea;
    	let t19;
    	let button;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			iframe = element("iframe");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Contact Us";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("We are here to answer any questions you might have with regards to our party, manifesto or elections. ");
    			br = element("br");
    			t4 = text(" Use the contact form below to send us a message.");
    			t5 = space();
    			p1 = element("p");
    			p2 = element("p");
    			span0 = element("span");
    			img0 = element("img");
    			t6 = text("  Plot 3379A/3379B, No. 20 Mungo Park Close, Off Jesse Jackson/Gimbya Street,Asokoro/Area 11 Abuja, Nigeria.");
    			t7 = space();
    			span1 = element("span");
    			img1 = element("img");
    			t8 = text("  +234 906 000 0536");
    			t9 = space();
    			span2 = element("span");
    			img2 = element("img");
    			t10 = text("  +234 906 182 5005");
    			t11 = space();
    			span3 = element("span");
    			img3 = element("img");
    			t12 = text("  contact@adp.ng");
    			t13 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t15 = space();
    			input = element("input");
    			t16 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Message";
    			t18 = space();
    			textarea = element("textarea");
    			t19 = space();
    			button = element("button");
    			button.textContent = "send";
    			if (iframe.src !== (iframe_src_value = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.2139260587282!2d7.507858714214417!3d9.04424109124171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0be9bcd5569d%3A0x7eef065db100e1f8!2sAction%20Democratic%20Party!5e0!3m2!1sen!2sng!4v1610724214291!5m2!1sen!2sng")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "1200");
    			attr_dev(iframe, "height", "1000");
    			attr_dev(iframe, "frameborder", "0");
    			set_style(iframe, "border", "0");
    			iframe.allowFullscreen = "";
    			attr_dev(iframe, "aria-hidden", "false");
    			attr_dev(iframe, "tabindex", "0");
    			add_location(iframe, file$l, 3, 8, 160);
    			attr_dev(div0, "class", "absolute inset-0 bg-gray-300");
    			add_location(div0, file$l, 1, 4, 55);
    			attr_dev(h2, "class", "text-white text-lg mb-1 font-medium title-font");
    			add_location(h2, file$l, 8, 8, 784);
    			add_location(br, file$l, 9, 198, 1058);
    			attr_dev(p0, "class", "leading-relaxed mb-2 text-gray-600 text-xs bg-white rounded-md shadow-lg p-3");
    			add_location(p0, file$l, 9, 8, 868);
    			attr_dev(p1, "class", "leading-relaxed mb-2 text-gray-600 text-xs ");
    			add_location(p1, file$l, 12, 8, 1134);
    			if (img0.src !== (img0_src_value = "../addressicon.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", " w-5");
    			add_location(img0, file$l, 14, 47, 1301);
    			attr_dev(span0, "class", "block mb-1 leading-5");
    			add_location(span0, file$l, 14, 11, 1265);
    			if (img1.src !== (img1_src_value = "../telephoneicon.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", " w-5 mr-2");
    			add_location(img1, file$l, 15, 49, 1516);
    			attr_dev(span1, "class", "flex mb-1 items-center");
    			add_location(span1, file$l, 15, 11, 1478);
    			if (img2.src !== (img2_src_value = "../whatsappicon.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", " w-5 mr-2");
    			add_location(img2, file$l, 16, 50, 1651);
    			attr_dev(span2, "class", "flex mb-1 items-center");
    			add_location(span2, file$l, 16, 11, 1612);
    			if (img3.src !== (img3_src_value = "../mailicon.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", " w-5 mr-2");
    			add_location(img3, file$l, 17, 48, 1784);
    			attr_dev(span3, "class", "flex mb-1 items-center");
    			add_location(span3, file$l, 17, 11, 1747);
    			attr_dev(p2, "class", "text-xs bg-white rounded-md shadow-lg p-3");
    			add_location(p2, file$l, 13, 10, 1200);
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$l, 22, 10, 1933);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "id", "email");
    			attr_dev(input, "name", "email");
    			attr_dev(input, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input, file$l, 23, 10, 2016);
    			attr_dev(div1, "class", "relative mb-4");
    			add_location(div1, file$l, 21, 8, 1895);
    			attr_dev(label1, "for", "message");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$l, 26, 10, 2330);
    			attr_dev(textarea, "id", "message");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out");
    			add_location(textarea, file$l, 27, 10, 2417);
    			attr_dev(div2, "class", "relative mb-4");
    			add_location(div2, file$l, 25, 8, 2292);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(button, file$l, 29, 8, 2715);
    			attr_dev(div3, "class", "lg:w-1/3 md:w-1/2 bg-gray-900 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md");
    			add_location(div3, file$l, 7, 6, 647);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex");
    			add_location(div4, file$l, 5, 4, 592);
    			attr_dev(section, "class", "text-gray-600 body-font relative");
    			add_location(section, file$l, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, iframe);
    			append_dev(section, t0);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t2);
    			append_dev(div3, p0);
    			append_dev(p0, t3);
    			append_dev(p0, br);
    			append_dev(p0, t4);
    			append_dev(div3, t5);
    			append_dev(div3, p1);
    			append_dev(div3, p2);
    			append_dev(p2, span0);
    			append_dev(span0, img0);
    			append_dev(span0, t6);
    			append_dev(p2, t7);
    			append_dev(p2, span1);
    			append_dev(span1, img1);
    			append_dev(span1, t8);
    			append_dev(p2, t9);
    			append_dev(p2, span2);
    			append_dev(span2, img2);
    			append_dev(span2, t10);
    			append_dev(p2, t11);
    			append_dev(p2, span3);
    			append_dev(span3, img3);
    			append_dev(span3, t12);
    			append_dev(div3, t13);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t15);
    			append_dev(div1, input);
    			append_dev(div3, t16);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t18);
    			append_dev(div2, textarea);
    			append_dev(div3, t19);
    			append_dev(div3, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/pages/Login.svelte generated by Svelte v3.31.2 */

    const file$m = "src/pages/Login.svelte";

    function create_fragment$q(ctx) {
    	let div7;
    	let div0;
    	let t0;
    	let div6;
    	let h2;
    	let t2;
    	let p;
    	let t4;
    	let div1;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let div3;
    	let div2;
    	let label1;
    	let t9;
    	let a0;
    	let t11;
    	let input1;
    	let t12;
    	let div4;
    	let button;
    	let t14;
    	let div5;
    	let span0;
    	let t15;
    	let a1;
    	let t17;
    	let span1;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div6 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Action Democratic Party";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Welcome back!";
    			t4 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email Address";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t9 = space();
    			a0 = element("a");
    			a0.textContent = "Forget Password?";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			div4 = element("div");
    			button = element("button");
    			button.textContent = "Login";
    			t14 = space();
    			div5 = element("div");
    			span0 = element("span");
    			t15 = space();
    			a1 = element("a");
    			a1.textContent = "or sign up";
    			t17 = space();
    			span1 = element("span");
    			attr_dev(div0, "class", "hidden lg:block lg:w-1/2 bg-cover");
    			set_style(div0, "background-image", "url('../office.jpg')");
    			add_location(div0, file$m, 2, 8, 131);
    			attr_dev(h2, "class", "text-2xl font-semibold text-gray-700 dark:text-white text-center text-blue-900");
    			add_location(h2, file$m, 5, 12, 308);
    			attr_dev(p, "class", "text-xl text-red-600 dark:text-red-200 text-center");
    			add_location(p, file$m, 7, 12, 441);
    			attr_dev(label0, "class", "block text-gray-600 dark:text-gray-200 text-sm font-medium mb-2");
    			attr_dev(label0, "for", "LoggingEmailAddress");
    			add_location(label0, file$m, 10, 16, 569);
    			attr_dev(input0, "id", "LoggingEmailAddress");
    			attr_dev(input0, "class", "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded py-2 px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			attr_dev(input0, "type", "email");
    			add_location(input0, file$m, 11, 16, 712);
    			attr_dev(div1, "class", "mt-4");
    			add_location(div1, file$m, 9, 12, 534);
    			attr_dev(label1, "class", "block text-gray-600 dark:text-gray-200 text-sm font-medium mb-2");
    			attr_dev(label1, "for", "loggingPassword");
    			add_location(label1, file$m, 16, 20, 1101);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "text-xs text-gray-500 dark:text-gray-300 hover:underline");
    			add_location(a0, file$m, 17, 20, 1239);
    			attr_dev(div2, "class", "flex justify-between");
    			add_location(div2, file$m, 15, 16, 1046);
    			attr_dev(input1, "id", "loggingPassword");
    			attr_dev(input1, "class", "bg-wbg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded py-2 px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			attr_dev(input1, "type", "password");
    			add_location(input1, file$m, 20, 16, 1377);
    			attr_dev(div3, "class", "mt-4");
    			add_location(div3, file$m, 14, 12, 1011);
    			attr_dev(button, "class", "bg-red-500 text-white py-2 px-4 w-full tracking-wide rounded hover:bg-red-600 focus:outline-none focus:bg-gray-600");
    			add_location(button, file$m, 24, 16, 1714);
    			attr_dev(div4, "class", "mt-8");
    			add_location(div4, file$m, 23, 12, 1679);
    			attr_dev(span0, "class", "border-b dark:border-gray-600 w-1/5 md:w-1/4");
    			add_location(span0, file$m, 30, 16, 2011);
    			attr_dev(a1, "href", "/register");
    			attr_dev(a1, "class", "text-xs text-gray-500 dark:text-gray-400 uppercase hover:underline");
    			add_location(a1, file$m, 32, 16, 2095);
    			attr_dev(span1, "class", "border-b dark:border-gray-600 w-1/5 md:w-1/4");
    			add_location(span1, file$m, 34, 16, 2238);
    			attr_dev(div5, "class", "mt-4 flex items-center justify-between");
    			add_location(div5, file$m, 29, 12, 1942);
    			attr_dev(div6, "class", "w-full py-8 px-6 md:px-8 lg:w-1/2");
    			add_location(div6, file$m, 4, 8, 248);
    			attr_dev(div7, "class", "flex max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg my-24 shadow-lg overflow-hidden lg:max-w-4xl");
    			add_location(div7, file$m, 1, 4, 5);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div0);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, h2);
    			append_dev(div6, t2);
    			append_dev(div6, p);
    			append_dev(div6, t4);
    			append_dev(div6, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t6);
    			append_dev(div1, input0);
    			append_dev(div6, t7);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t9);
    			append_dev(div2, a0);
    			append_dev(div3, t11);
    			append_dev(div3, input1);
    			append_dev(div6, t12);
    			append_dev(div6, div4);
    			append_dev(div4, button);
    			append_dev(div6, t14);
    			append_dev(div6, div5);
    			append_dev(div5, span0);
    			append_dev(div5, t15);
    			append_dev(div5, a1);
    			append_dev(div5, t17);
    			append_dev(div5, span1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/pages/Manifesto.svelte generated by Svelte v3.31.2 */

    const file$n = "src/pages/Manifesto.svelte";

    function create_fragment$r(ctx) {
    	let div;
    	let embed;
    	let embed_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			embed = element("embed");
    			attr_dev(embed, "type", "application/pdf");
    			if (embed.src !== (embed_src_value = "../MANIFESTO_Action_Democratic_Party.pdf")) attr_dev(embed, "src", embed_src_value);
    			attr_dev(embed, "class", " w-full  h-screen ");
    			add_location(embed, file$n, 3, 4, 64);
    			attr_dev(div, "class", "p-0 mx-auto container my-10   min-h-screen ");
    			add_location(div, file$n, 2, 0, 2);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, embed);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Manifesto", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Manifesto> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Manifesto extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Manifesto",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file$o = "src/App.svelte";

    // (22:4) <Route path="/" >
    function create_default_slot_8(ctx) {
    	let index;
    	let current;
    	index = new Index({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(index.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(index, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(index.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(index.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(index, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(22:4) <Route path=\\\"/\\\" >",
    		ctx
    	});

    	return block;
    }

    // (25:4) <Route path="/about">
    function create_default_slot_7(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(25:4) <Route path=\\\"/about\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:4) <Route path="/constitution">
    function create_default_slot_6(ctx) {
    	let constitution;
    	let current;
    	constitution = new Constitution({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(constitution.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(constitution, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(constitution.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(constitution.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(constitution, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(28:4) <Route path=\\\"/constitution\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:4) <Route path="/structure">
    function create_default_slot_5(ctx) {
    	let structure;
    	let current;
    	structure = new Structure({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(structure.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(structure, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(structure.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(structure.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(structure, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(31:4) <Route path=\\\"/structure\\\">",
    		ctx
    	});

    	return block;
    }

    // (34:4) <Route path="/register">
    function create_default_slot_4(ctx) {
    	let register;
    	let current;
    	register = new Register({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(register.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(register, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(register.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(register.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(register, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(34:4) <Route path=\\\"/register\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:4) <Route path="/candidates">
    function create_default_slot_3(ctx) {
    	let candidates;
    	let current;
    	candidates = new Candidates({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(candidates.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(candidates, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(candidates.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(candidates.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(candidates, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(37:4) <Route path=\\\"/candidates\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:4) <Route path="/login">
    function create_default_slot_2$1(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(40:4) <Route path=\\\"/login\\\">",
    		ctx
    	});

    	return block;
    }

    // (43:4) <Route path="/contact">
    function create_default_slot_1$1(ctx) {
    	let contact;
    	let current;
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contact.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contact, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contact, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(43:4) <Route path=\\\"/contact\\\">",
    		ctx
    	});

    	return block;
    }

    // (46:4) <Route path="/manifesto">
    function create_default_slot$3(ctx) {
    	let manifesto;
    	let current;
    	manifesto = new Manifesto({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(manifesto.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(manifesto, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(manifesto.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(manifesto.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(manifesto, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(46:4) <Route path=\\\"/manifesto\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let navbar;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let t5;
    	let route5;
    	let t6;
    	let route6;
    	let t7;
    	let route7;
    	let t8;
    	let route8;
    	let t9;
    	let footer;
    	let current;

    	navbar = new Navbar({
    			props: { segment: /*segment*/ ctx[0] },
    			$$inline: true
    		});

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/about",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/constitution",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/structure",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/register",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "/candidates",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route6 = new Route({
    			props: {
    				path: "/login",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route7 = new Route({
    			props: {
    				path: "/contact",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route8 = new Route({
    			props: {
    				path: "/manifesto",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(route5.$$.fragment);
    			t6 = space();
    			create_component(route6.$$.fragment);
    			t7 = space();
    			create_component(route7.$$.fragment);
    			t8 = space();
    			create_component(route8.$$.fragment);
    			t9 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", " overflow-x-hidden pt-9");
    			add_location(main, file$o, 19, 0, 624);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(route0, main, null);
    			append_dev(main, t1);
    			mount_component(route1, main, null);
    			append_dev(main, t2);
    			mount_component(route2, main, null);
    			append_dev(main, t3);
    			mount_component(route3, main, null);
    			append_dev(main, t4);
    			mount_component(route4, main, null);
    			append_dev(main, t5);
    			mount_component(route5, main, null);
    			append_dev(main, t6);
    			mount_component(route6, main, null);
    			append_dev(main, t7);
    			mount_component(route7, main, null);
    			append_dev(main, t8);
    			mount_component(route8, main, null);
    			insert_dev(target, t9, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    			const route6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route6_changes.$$scope = { dirty, ctx };
    			}

    			route6.$set(route6_changes);
    			const route7_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route7_changes.$$scope = { dirty, ctx };
    			}

    			route7.$set(route7_changes);
    			const route8_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route8_changes.$$scope = { dirty, ctx };
    			}

    			route8.$set(route8_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			transition_in(route8.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    			destroy_component(route6);
    			destroy_component(route7);
    			destroy_component(route8);
    			if (detaching) detach_dev(t9);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let segment;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Index,
    		Structure,
    		NavBar: Navbar,
    		Constitution,
    		About,
    		Register,
    		Candidates,
    		Contact,
    		Footer,
    		Login,
    		Route,
    		Manifesto,
    		segment
    	});

    	$$self.$inject_state = $$props => {
    		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [segment];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
