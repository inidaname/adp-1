
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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

    /* src/components/Navbar/Navbar.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file = "src/components/Navbar/Navbar.svelte";

    function create_fragment(ctx) {
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
    			attr_dev(img0, "width", "90");
    			attr_dev(img0, "alt", "adplogos");
    			add_location(img0, file, 17, 20, 544);
    			attr_dev(a0, "class", "text-gray-800 dark:text-white text-xl font-bold md:text-2xl hover:text-gray-700 dark:hover:text-gray-300");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 16, 16, 398);
    			add_location(div0, file, 15, 12, 376);
    			if (img1.src !== (img1_src_value = /*isNav*/ ctx[1] ? "../xtimes.svg" : "../ham.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "border-0 focus:outline-none");
    			add_location(img1, file, 24, 20, 971);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400");
    			attr_dev(button, "aria-label", "Toggle menu");
    			add_location(button, file, 23, 16, 734);
    			attr_dev(div1, "class", "md:hidden");
    			add_location(div1, file, 22, 12, 694);
    			attr_dev(div2, "class", "flex justify-between items-center");
    			add_location(div2, file, 14, 8, 316);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a1, "bg-red-500", /*segment*/ ctx[0] === undefined);
    			add_location(a1, file, 32, 12, 1313);
    			attr_dev(a2, "href", "/about");
    			attr_dev(a2, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a2, "bg-red-500", /*segment*/ ctx[0] === "about");
    			add_location(a2, file, 34, 12, 1512);
    			attr_dev(a3, "href", "/constitution");
    			attr_dev(a3, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a3, "bg-red-500", /*segment*/ ctx[0] === "constitution");
    			add_location(a3, file, 35, 12, 1705);
    			attr_dev(a4, "href", "/structure");
    			attr_dev(a4, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a4, "bg-red-500", /*segment*/ ctx[0] === "structure");
    			add_location(a4, file, 36, 12, 1917);
    			attr_dev(a5, "href", "/register");
    			attr_dev(a5, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a5, "bg-red-500", /*segment*/ ctx[0] === "register");
    			add_location(a5, file, 37, 12, 2120);
    			attr_dev(a6, "href", "/candidates");
    			attr_dev(a6, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a6, "bg-red-500", /*segment*/ ctx[0] === "candidate");
    			add_location(a6, file, 38, 12, 2319);
    			attr_dev(a7, "href", "contact");
    			attr_dev(a7, "class", "py-2 px-2 text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			toggle_class(a7, "bg-red-500", /*segment*/ ctx[0] === "contact");
    			add_location(a7, file, 39, 12, 2523);
    			attr_dev(div3, "class", div3_class_value = "flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block " + `${/*isNav*/ ctx[1] ? "block" : "hidden"}`);
    			add_location(div3, file, 31, 8, 1201);
    			attr_dev(div4, "class", "md:flex items-center justify-between");
    			add_location(div4, file, 13, 4, 257);
    			attr_dev(nav, "class", "px-6 py-3 shadow");
    			add_location(nav, file, 12, 0, 222);
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
    				dispose = listen_dev(button, "click", /*openNav*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isNav*/ 2 && img1.src !== (img1_src_value = /*isNav*/ ctx[1] ? "../xtimes.svg" : "../ham.svg")) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*segment, undefined*/ 1) {
    				toggle_class(a1, "bg-red-500", /*segment*/ ctx[0] === undefined);
    			}

    			if (dirty & /*segment*/ 1) {
    				toggle_class(a2, "bg-red-500", /*segment*/ ctx[0] === "about");
    			}

    			if (dirty & /*segment*/ 1) {
    				toggle_class(a3, "bg-red-500", /*segment*/ ctx[0] === "constitution");
    			}

    			if (dirty & /*segment*/ 1) {
    				toggle_class(a4, "bg-red-500", /*segment*/ ctx[0] === "structure");
    			}

    			if (dirty & /*segment*/ 1) {
    				toggle_class(a5, "bg-red-500", /*segment*/ ctx[0] === "register");
    			}

    			if (dirty & /*segment*/ 1) {
    				toggle_class(a6, "bg-red-500", /*segment*/ ctx[0] === "candidate");
    			}

    			if (dirty & /*segment*/ 1) {
    				toggle_class(a7, "bg-red-500", /*segment*/ ctx[0] === "contact");
    			}

    			if (dirty & /*isNav*/ 2 && div3_class_value !== (div3_class_value = "flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block " + `${/*isNav*/ ctx[1] ? "block" : "hidden"}`)) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			dispose();
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
    	validate_slots("Navbar", slots, []);
    	let isNav = false;
    	let { activePage } = $$props;
    	let { segment } = $$props;
    	console.log(activePage);

    	function openNav() {
    		isNav === false
    		? $$invalidate(1, isNav = true)
    		: $$invalidate(1, isNav = false);

    		console.log(isNav);
    	}

    	const writable_props = ["activePage", "segment"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("activePage" in $$props) $$invalidate(3, activePage = $$props.activePage);
    		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
    	};

    	$$self.$capture_state = () => ({ isNav, activePage, segment, openNav });

    	$$self.$inject_state = $$props => {
    		if ("isNav" in $$props) $$invalidate(1, isNav = $$props.isNav);
    		if ("activePage" in $$props) $$invalidate(3, activePage = $$props.activePage);
    		if ("segment" in $$props) $$invalidate(0, segment = $$props.segment);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [segment, isNav, openNav, activePage];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { activePage: 3, segment: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activePage*/ ctx[3] === undefined && !("activePage" in props)) {
    			console_1.warn("<Navbar> was created without expected prop 'activePage'");
    		}

    		if (/*segment*/ ctx[0] === undefined && !("segment" in props)) {
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

    /* src/components/Hero/Hero.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/components/Hero/Hero.svelte";
    const get_hero_image_slot_changes = dirty => ({});
    const get_hero_image_slot_context = ctx => ({});
    const get_hero_texts_slot_changes = dirty => ({});
    const get_hero_texts_slot_context = ctx => ({});

    function create_fragment$1(ctx) {
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
    			attr_dev(div, "class", "container mx-auto flex px-5 py-24 md:flex-row flex-col items-center");
    			add_location(div, file$1, 10, 8, 181);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$1, 9, 4, 131);
    			attr_dev(header, "class", "bg-white dark:bg-gray-800");
    			add_location(header, file$1, 8, 0, 84);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, ['hero-texts','hero-image']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ NavBar: Navbar });
    	return [$$scope, slots];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Footer/Footer.svelte generated by Svelte v3.31.2 */

    const file$2 = "src/components/Footer/Footer.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(img, file$2, 5, 12, 447);
    			attr_dev(a0, "class", "flex title-font font-medium items-center md:justify-start justify-center text-gray-900");
    			add_location(a0, file$2, 4, 8, 336);
    			attr_dev(p0, "class", "mt-2 text-sm text-gray-500");
    			add_location(p0, file$2, 7, 8, 522);
    			attr_dev(div0, "class", "w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left md:mt-0 mt-10");
    			add_location(div0, file$2, 2, 6, 186);
    			attr_dev(h20, "class", "title-font font-medium text-gray-900 tracking-widest text-sm mb-3");
    			add_location(h20, file$2, 11, 10, 761);
    			add_location(li0, file$2, 13, 12, 921);
    			attr_dev(nav0, "class", "list-none mb-10");
    			add_location(nav0, file$2, 12, 10, 879);
    			attr_dev(div1, "class", "lg:w-1/2 md:w-1/2 w-full px-4");
    			add_location(div1, file$2, 10, 8, 707);
    			attr_dev(h21, "class", "title-font font-medium text-gray-900 tracking-widest text-sm mb-3");
    			add_location(h21, file$2, 24, 10, 1251);
    			add_location(li1, file$2, 26, 12, 1401);
    			add_location(li2, file$2, 28, 15, 1460);
    			add_location(li3, file$2, 29, 13, 1501);
    			add_location(li4, file$2, 30, 13, 1544);
    			attr_dev(nav1, "class", "list-none mb-10");
    			add_location(nav1, file$2, 25, 10, 1359);
    			attr_dev(div2, "class", "lg:w-1/2 md:w-1/2 w-full px-4");
    			add_location(div2, file$2, 23, 8, 1197);
    			attr_dev(div3, "class", "flex-grow flex flex-wrap md:pr-20 -mb-10 md:text-left text-center order-first");
    			add_location(div3, file$2, 9, 6, 607);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col");
    			add_location(div4, file$2, 1, 4, 55);
    			attr_dev(p1, "class", "text-gray-500 text-sm text-center sm:text-left");
    			add_location(p1, file$2, 39, 8, 1787);
    			attr_dev(path0, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path0, file$2, 45, 14, 2224);
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "class", "w-5 h-5");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$2, 44, 12, 2084);
    			attr_dev(a1, "class", "text-gray-500");
    			add_location(a1, file$2, 43, 10, 2046);
    			attr_dev(path1, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path1, file$2, 51, 14, 2588);
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "class", "w-5 h-5");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$2, 50, 12, 2448);
    			attr_dev(a2, "class", "ml-3 text-gray-500");
    			add_location(a2, file$2, 49, 10, 2405);
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$2, 57, 14, 3067);
    			attr_dev(path2, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01");
    			add_location(path2, file$2, 58, 14, 3144);
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "class", "w-5 h-5");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$2, 56, 12, 2913);
    			attr_dev(a3, "class", "ml-3 text-gray-500");
    			add_location(a3, file$2, 55, 10, 2870);
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "d", "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z");
    			add_location(path3, file$2, 64, 14, 3524);
    			attr_dev(circle, "cx", "4");
    			attr_dev(circle, "cy", "4");
    			attr_dev(circle, "r", "2");
    			attr_dev(circle, "stroke", "none");
    			add_location(circle, file$2, 65, 14, 3655);
    			attr_dev(svg3, "fill", "currentColor");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			attr_dev(svg3, "stroke-width", "0");
    			attr_dev(svg3, "class", "w-5 h-5");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			add_location(svg3, file$2, 63, 12, 3362);
    			attr_dev(a4, "class", "ml-3 text-gray-500");
    			add_location(a4, file$2, 62, 10, 3319);
    			attr_dev(span, "class", "inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start");
    			add_location(span, file$2, 41, 8, 1897);
    			attr_dev(div5, "class", "container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row text-white");
    			add_location(div5, file$2, 38, 6, 1690);
    			attr_dev(div6, "class", "bg-gray-800 ");
    			add_location(div6, file$2, 37, 4, 1657);
    			attr_dev(footer, "class", "text-white body-font bg-gray-900 ");
    			add_location(footer, file$2, 0, 0, 0);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Card/CardImage.svelte generated by Svelte v3.31.2 */

    const file$3 = "src/components/Card/CardImage.svelte";

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
    			add_location(img, file$3, 11, 5, 392);
    			attr_dev(div0, "class", "w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-white-100 flex-shrink-0");
    			add_location(div0, file$3, 10, 6, 262);
    			attr_dev(h2, "class", "text-gray-900 text-lg title-font font-medium mb-3");
    			add_location(h2, file$3, 14, 8, 479);
    			attr_dev(p, "class", "leading-relaxed text-base");
    			add_location(p, file$3, 15, 8, 567);
    			attr_dev(a, "class", "mt-3 text-blue-500 inline-flex items-center");
    			attr_dev(a, "href", a_href_value = /*prop*/ ctx[1].url);
    			add_location(a, file$3, 17, 8, 682);
    			attr_dev(div1, "class", "flex-grow");
    			add_location(div1, file$3, 13, 6, 447);
    			attr_dev(div2, "class", "flex  rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col shadow-lg border-0 hover:shadow-xl ");
    			add_location(div2, file$3, 9, 4, 130);
    			attr_dev(div3, "class", "p-4 lg:w-1/2 md:w-full ");
    			add_location(div3, file$3, 8, 0, 88);
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

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { properties: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardImage",
    			options,
    			id: create_fragment$3.name
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
    const file$4 = "src/components/News_Panel/News_Bar.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font text-gray-900");
    			add_location(h1, file$4, 29, 8, 1781);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-10");
    			add_location(div0, file$4, 28, 6, 1720);
    			attr_dev(div1, "class", "flex flex-wrap -m-4");
    			add_location(div1, file$4, 31, 6, 1887);
    			attr_dev(div2, "class", "container px-5 py-10 mx-auto");
    			add_location(div2, file$4, 27, 4, 1671);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$4, 26, 0, 1625);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News_Bar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Mission_Panel/Mission_Bar.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/components/Mission_Panel/Mission_Bar.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div1;
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
    			div0 = element("div");
    			create_component(cardwithimage.$$.fragment);
    			attr_dev(div0, "class", "flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6");
    			add_location(div0, file$5, 27, 6, 700);
    			attr_dev(div1, "class", "container px-5 py-10 mx-auto");
    			add_location(div1, file$5, 23, 4, 514);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$5, 22, 0, 468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mission_Bar",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Forms/CTA_Form.svelte generated by Svelte v3.31.2 */

    const file$6 = "src/components/Forms/CTA_Form.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(h1, file$6, 3, 8, 156);
    			attr_dev(p, "class", "lg:w-2/3 mx-auto leading-relaxed text-base");
    			add_location(p, file$6, 4, 8, 252);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-12");
    			add_location(div0, file$6, 2, 6, 95);
    			attr_dev(label0, "for", "full-name");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$6, 8, 10, 606);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "full-name");
    			attr_dev(input0, "name", "full-name");
    			attr_dev(input0, "class", "w-full bg-gray-100 bg-opacity-50 rounded border border-blue-300 focus:border-blue-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$6, 9, 10, 697);
    			attr_dev(div1, "class", "relative flex-grow w-full");
    			add_location(div1, file$6, 7, 8, 556);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$6, 12, 10, 1072);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "class", "w-full bg-gray-100 bg-opacity-50 rounded border border-blue-300 focus:border-blue-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$6, 13, 10, 1155);
    			attr_dev(div2, "class", "relative flex-grow w-full");
    			add_location(div2, file$6, 11, 8, 1022);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 px-8 py-3 focus:outline-none hover:bg-red-600 rounded text-sm");
    			add_location(button, file$6, 15, 8, 1473);
    			attr_dev(div3, "class", "flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end");
    			add_location(div3, file$6, 6, 6, 425);
    			attr_dev(div4, "class", "container px-5 py-10 mx-auto");
    			add_location(div4, file$6, 1, 4, 46);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$6, 0, 0, 0);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CTA_Form",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/Forms/SideRegForm.svelte generated by Svelte v3.31.2 */

    const file$7 = "src/components/Forms/SideRegForm.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let div4;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let div3;
    	let h2;
    	let t5;
    	let div1;
    	let label0;
    	let t7;
    	let input0;
    	let t8;
    	let div2;
    	let label1;
    	let t10;
    	let input1;
    	let t11;
    	let button;
    	let t13;
    	let p1;
    	let a;
    	let t15;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Join Us!";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Whatever change you think you can bring to this great nation, you can always start with a step.";
    			t3 = space();
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Sign Up";
    			t5 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Full Name";
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			button = element("button");
    			button.textContent = "Register";
    			t13 = space();
    			p1 = element("p");
    			a = element("a");
    			a.textContent = "Register";
    			t15 = text(" for an account with us");
    			attr_dev(h1, "class", "title-font font-medium text-3xl text-gray-900");
    			add_location(h1, file$7, 3, 8, 185);
    			attr_dev(p0, "class", "leading-relaxed mt-4");
    			add_location(p0, file$7, 4, 8, 265);
    			attr_dev(div0, "class", "lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0");
    			add_location(div0, file$7, 2, 6, 123);
    			attr_dev(h2, "class", "text-gray-900 text-lg font-medium title-font mb-5");
    			add_location(h2, file$7, 7, 8, 529);
    			attr_dev(label0, "for", "full-name");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$7, 9, 10, 650);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "full-name");
    			attr_dev(input0, "name", "full-name");
    			attr_dev(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$7, 10, 10, 741);
    			attr_dev(div1, "class", "relative mb-4");
    			add_location(div1, file$7, 8, 8, 612);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$7, 13, 10, 1064);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$7, 14, 10, 1147);
    			attr_dev(div2, "class", "relative mb-4");
    			add_location(div2, file$7, 12, 8, 1026);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-8 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(button, file$7, 16, 8, 1425);
    			attr_dev(a, "href", "/register");
    			attr_dev(a, "class", "text-blue-500");
    			add_location(a, file$7, 17, 46, 1598);
    			attr_dev(p1, "class", "text-xs text-gray-500 mt-3");
    			add_location(p1, file$7, 17, 8, 1560);
    			attr_dev(div3, "class", "lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0");
    			add_location(div3, file$7, 6, 6, 416);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex flex-wrap items-center");
    			add_location(div4, file$7, 1, 4, 46);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$7, 0, 0, 0);
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
    			append_dev(div0, p0);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t7);
    			append_dev(div1, input0);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t10);
    			append_dev(div2, input1);
    			append_dev(div3, t11);
    			append_dev(div3, button);
    			append_dev(div3, t13);
    			append_dev(div3, p1);
    			append_dev(p1, a);
    			append_dev(p1, t15);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideRegForm",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Carousel/Carousel.svelte generated by Svelte v3.31.2 */

    const file$8 = "src/components/Carousel/Carousel.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let div1;
    	let img;
    	let img_src_value;
    	let t;
    	let div0;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			img = element("img");
    			t = space();
    			div0 = element("div");
    			if (img.src !== (img_src_value = "../office.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "h-full w-full");
    			attr_dev(img, "alt", "banner");
    			add_location(img, file$8, 2, 8, 90);
    			attr_dev(div0, "class", " w-full h-2/3 md:h-screen bg-black absolute z-10 top-0 left-0 opacity-20");
    			add_location(div0, file$8, 4, 8, 169);
    			attr_dev(div1, "class", "slide-content h-2/3 md:h-screen w-full ");
    			add_location(div1, file$8, 1, 1, 28);
    			attr_dev(section, "class", "relative");
    			add_location(section, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, img);
    			append_dev(div1, t);
    			append_dev(div1, div0);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/pages/Index.svelte generated by Svelte v3.31.2 */
    const file$9 = "src/pages/Index.svelte";

    // (42:6) <div slot="hero-texts" class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
    function create_hero_texts_slot(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let button0;
    	let t5;
    	let button1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Action Democratic Party";
    			t1 = space();
    			p = element("p");
    			p.textContent = "THE ACTION DEMOCRATIC PARTY (ADP) is a registered political party in Nigeria. The party was formed and established in 2017 to deal with the lapses that have over the years been complained about by Nigerians because the tenets of true democracy have been lost thereby giving some select few a godlike image where political parties are being dictated upon by the few and powerful.";
    			t3 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Join Us!";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Explore";
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900");
    			add_location(h1, file$9, 42, 8, 1830);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$9, 44, 8, 1951);
    			attr_dev(button0, "class", "inline-flex text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(button0, file$9, 46, 10, 2418);
    			attr_dev(button1, "class", "ml-4 inline-flex text-gray-700 bg-white py-2 px-6 focus:outline-none hover:text-red-500 rounded text-lg border-red-500");
    			add_location(button1, file$9, 47, 10, 2567);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$9, 45, 8, 2374);
    			attr_dev(div0, "slot", "hero-texts");
    			attr_dev(div0, "class", "lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center");
    			add_location(div0, file$9, 41, 6, 1669);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div0, t3);
    			append_dev(div0, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t5);
    			append_dev(div1, button1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_hero_texts_slot.name,
    		type: "slot",
    		source: "(42:6) <div slot=\\\"hero-texts\\\" class=\\\"lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:6) <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
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
    			if (img.src !== (img_src_value = "../adplogo.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$9, 53, 8, 2840);
    			attr_dev(div, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6");
    			attr_dev(div, "slot", "hero-image");
    			add_location(div, file$9, 52, 6, 2763);
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
    		source: "(53:6) <div class=\\\"lg:max-w-lg lg:w-full md:w-1/2 w-5/6\\\" slot=\\\"hero-image\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:3) <Hero>
    function create_default_slot(ctx) {
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(40:3) <Hero>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let carousel;
    	let t0;
    	let hero;
    	let t1;
    	let section0;
    	let div1;
    	let h10;
    	let t3;
    	let div0;
    	let cardwithimage;
    	let t4;
    	let section1;
    	let div3;
    	let h2;
    	let t5;
    	let br;
    	let t6;
    	let t7;
    	let div2;
    	let p0;
    	let t9;
    	let section2;
    	let div7;
    	let div6;
    	let img;
    	let img_src_value;
    	let t10;
    	let div5;
    	let h11;
    	let t12;
    	let div4;
    	let t13;
    	let p1;
    	let t15;
    	let missionbar;
    	let t16;
    	let sidereg;
    	let t17;
    	let newsbar;
    	let current;
    	carousel = new Carousel({ $$inline: true });

    	hero = new Hero({
    			props: {
    				$$slots: {
    					default: [create_default_slot],
    					"hero-image": [create_hero_image_slot],
    					"hero-texts": [create_hero_texts_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	cardwithimage = new CardImage({
    			props: { properties: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	missionbar = new Mission_Bar({ $$inline: true });
    	sidereg = new SideRegForm({ $$inline: true });
    	newsbar = new News_Bar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(carousel.$$.fragment);
    			t0 = space();
    			create_component(hero.$$.fragment);
    			t1 = space();
    			section0 = element("section");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Some facts about Action Democratic Party...";
    			t3 = space();
    			div0 = element("div");
    			create_component(cardwithimage.$$.fragment);
    			t4 = space();
    			section1 = element("section");
    			div3 = element("div");
    			h2 = element("h2");
    			t5 = text("I’ll Restore The Pride, Economy Of Nigeria\n        ");
    			br = element("br");
    			t6 = text("  - YY Sani");
    			t7 = space();
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Engr. Yabagi Yusuf Sani (YY Sani) is the presidential candidate of the Action Democratic Party (ADP) in the 2019 general elections. In this interview conducted during a meeting of all the candidates of the party held at the ADP National Secretariat in Abuja on January 9, he speaks on the necessity of the meeting, why Nigeria has become a laughing...";
    			t9 = space();
    			section2 = element("section");
    			div7 = element("div");
    			div6 = element("div");
    			img = element("img");
    			t10 = space();
    			div5 = element("div");
    			h11 = element("h1");
    			h11.textContent = "From the Chairman's Desk";
    			t12 = space();
    			div4 = element("div");
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "The National Chairman of the Action Democratic Party (ADP), Engr. Yabagi Sani, spoke with Press men in Abuja. He expressed dissatisfaction with the way the economy of the country was being run, insisting that the interest of the masses do not feature in the decision made by the ruling party...";
    			t15 = space();
    			create_component(missionbar.$$.fragment);
    			t16 = space();
    			create_component(sidereg.$$.fragment);
    			t17 = space();
    			create_component(newsbar.$$.fragment);
    			attr_dev(h10, "class", "py-4 text-lg font-medium title-font sm:text-3xl text-2xl ");
    			add_location(h10, file$9, 60, 6, 3075);
    			attr_dev(div0, "class", "flex flex-wrap -m-4");
    			add_location(div0, file$9, 61, 6, 3200);
    			attr_dev(div1, "class", "container mx-auto px-5 py-4 mx-auto flex flex-wrap");
    			add_location(div1, file$9, 59, 4, 3004);
    			attr_dev(section0, "class", "text-gray-600 body-font");
    			add_location(section0, file$9, 58, 3, 2958);
    			add_location(br, file$9, 70, 8, 3563);
    			attr_dev(h2, "class", "sm:text-3xl text-2xl text-red-900 font-medium title-font mb-10 md:w-2/5");
    			add_location(h2, file$9, 69, 6, 3428);
    			attr_dev(p0, "class", "leading-relaxed text-base p-4 ");
    			add_location(p0, file$9, 72, 8, 3650);
    			attr_dev(div2, "class", "md:w-3/5 md:pl-6 shadow-lg rounded-md");
    			add_location(div2, file$9, 71, 6, 3590);
    			attr_dev(div3, "class", "container px-5 py-24 mx-auto flex flex-wrap");
    			add_location(div3, file$9, 68, 4, 3364);
    			attr_dev(section1, "class", "text-gray-600 body-font");
    			add_location(section1, file$9, 67, 2, 3318);
    			attr_dev(img, "alt", "Chairman's photo");
    			attr_dev(img, "class", "lg:w-1/2 w-full lg:h-auto h-64  rounded");
    			if (img.src !== (img_src_value = "../nChairman.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$9, 87, 6, 4400);
    			attr_dev(h11, "class", "text-red-900 text-3xl title-font font-medium mb-1");
    			add_location(h11, file$9, 90, 8, 4584);
    			attr_dev(div4, "class", "flex mb-4");
    			add_location(div4, file$9, 91, 8, 4684);
    			attr_dev(p1, "class", "leading-relaxed");
    			add_location(p1, file$9, 93, 8, 4731);
    			attr_dev(div5, "class", "lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0");
    			add_location(div5, file$9, 88, 6, 4507);
    			attr_dev(div6, "class", "lg:w-4/5 mx-auto flex flex-wrap p-2");
    			add_location(div6, file$9, 85, 4, 4292);
    			attr_dev(div7, "class", "container px-5 py-4 mx-auto");
    			add_location(div7, file$9, 84, 2, 4246);
    			attr_dev(section2, "class", "text-gray-600 body-font overflow-hidden");
    			add_location(section2, file$9, 83, 0, 4186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(carousel, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(hero, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			mount_component(cardwithimage, div0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div3);
    			append_dev(div3, h2);
    			append_dev(h2, t5);
    			append_dev(h2, br);
    			append_dev(h2, t6);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div7);
    			append_dev(div7, div6);
    			append_dev(div6, img);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div5, h11);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div5, t13);
    			append_dev(div5, p1);
    			insert_dev(target, t15, anchor);
    			mount_component(missionbar, target, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(sidereg, target, anchor);
    			insert_dev(target, t17, anchor);
    			mount_component(newsbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hero_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				hero_changes.$$scope = { dirty, ctx };
    			}

    			hero.$set(hero_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(cardwithimage.$$.fragment, local);
    			transition_in(missionbar.$$.fragment, local);
    			transition_in(sidereg.$$.fragment, local);
    			transition_in(newsbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(cardwithimage.$$.fragment, local);
    			transition_out(missionbar.$$.fragment, local);
    			transition_out(sidereg.$$.fragment, local);
    			transition_out(newsbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(carousel, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(hero, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section0);
    			destroy_component(cardwithimage);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t15);
    			destroy_component(missionbar, detaching);
    			if (detaching) detach_dev(t16);
    			destroy_component(sidereg, detaching);
    			if (detaching) detach_dev(t17);
    			destroy_component(newsbar, detaching);
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

    function instance$9($$self, $$props, $$invalidate) {
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
    		Carousel,
    		data
    	});

    	return [data];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Card/ImageCard.svelte generated by Svelte v3.31.2 */

    const file$a = "src/components/Card/ImageCard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (17:0) {#each galleries as image }
    function create_each_block$1(ctx) {
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
    			add_location(img, file$a, 18, 2, 700);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "block text-2xl text-gray-800 dark:text-white font-bold");
    			add_location(a, file$a, 21, 6, 812);
    			attr_dev(span, "class", "text-sm text-gray-700 dark:text-gray-200");
    			add_location(span, file$a, 22, 6, 910);
    			attr_dev(div0, "class", "py-5 text-center");
    			add_location(div0, file$a, 20, 2, 775);
    			attr_dev(div1, "class", "max-w-xs bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mx-auto my-4");
    			add_location(div1, file$a, 17, 0, 599);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(17:0) {#each galleries as image }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let each_1_anchor;
    	let each_value = /*galleries*/ ctx[0];
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
    			if (dirty & /*galleries*/ 1) {
    				each_value = /*galleries*/ ctx[0];
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { galleries: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageCard",
    			options,
    			id: create_fragment$a.name
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
    const file$b = "src/components/Gallery/Gallery_Block.svelte";
    const get_gallery_subtitle_slot_changes = dirty => ({});
    const get_gallery_subtitle_slot_context = ctx => ({});
    const get_gallery_heading_slot_changes = dirty => ({});
    const get_gallery_heading_slot_context = ctx => ({});

    function create_fragment$b(ctx) {
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
    			add_location(div0, file$b, 31, 6, 916);
    			attr_dev(div1, "class", "flex flex-wrap -m-4 justify-center");
    			add_location(div1, file$b, 38, 6, 1597);
    			attr_dev(div2, "class", "container px-5 py-20 mx-auto");
    			add_location(div2, file$b, 30, 4, 867);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$b, 29, 0, 821);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery_Block",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/pages/Structure.svelte generated by Svelte v3.31.2 */
    const file$c = "src/pages/Structure.svelte";

    // (11:4) <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
    function create_hero_image_slot$1(ctx) {
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
    			add_location(img, file$c, 11, 8, 256);
    			attr_dev(div, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6");
    			attr_dev(div, "slot", "hero-image");
    			add_location(div, file$c, 10, 4, 179);
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
    		source: "(11:4) <div class=\\\"lg:max-w-lg lg:w-full md:w-1/2 w-5/6\\\" slot=\\\"hero-image\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:6) <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" slot="hero-texts">
    function create_hero_texts_slot$1(ctx) {
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
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900");
    			add_location(h1, file$c, 16, 8, 522);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$c, 18, 8, 641);
    			attr_dev(div, "class", "lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center");
    			attr_dev(div, "slot", "hero-texts");
    			add_location(div, file$c, 15, 6, 361);
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
    		id: create_hero_texts_slot$1.name,
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

    // (24:4) <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900" slot="gallery-heading">
    function create_gallery_heading_slot_1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Board of Trustee Members";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900");
    			attr_dev(h1, "slot", "gallery-heading");
    			add_location(h1, file$c, 23, 4, 1171);
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
    		source: "(24:4) <h1 class=\\\"sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900\\\" slot=\\\"gallery-heading\\\">",
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
    			add_location(p, file$c, 24, 4, 1303);
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

    // (31:4) <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900" slot="gallery-heading">
    function create_gallery_heading_slot(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "National Working Committee Members";
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900");
    			attr_dev(h1, "slot", "gallery-heading");
    			add_location(h1, file$c, 30, 4, 1741);
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
    		source: "(31:4) <h1 class=\\\"sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900\\\" slot=\\\"gallery-heading\\\">",
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
    			add_location(p, file$c, 31, 4, 1883);
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

    function create_fragment$c(ctx) {
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
    					"hero-texts": [create_hero_texts_slot$1],
    					"hero-image": [create_hero_image_slot$1]
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Structure",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    /* src/pages/Constitution.svelte generated by Svelte v3.31.2 */

    const file$d = "src/pages/Constitution.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(embed, file$d, 3, 4, 64);
    			attr_dev(div, "class", "p-0 mx-auto container my-10   min-h-screen ");
    			add_location(div, file$d, 2, 0, 2);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Constitution",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/pages/About.svelte generated by Svelte v3.31.2 */
    const file$e = "src/pages/About.svelte";

    // (8:4) <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
    function create_hero_image_slot$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "object-cover object-center rounded");
    			attr_dev(img, "alt", "hero");
    			if (img.src !== (img_src_value = "../office.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$e, 8, 8, 295);
    			attr_dev(div, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6");
    			attr_dev(div, "slot", "hero-image");
    			add_location(div, file$e, 7, 4, 218);
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
    		id: create_hero_image_slot$2.name,
    		type: "slot",
    		source: "(8:4) <div class=\\\"lg:max-w-lg lg:w-full md:w-1/2 w-5/6\\\" slot=\\\"hero-image\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:6) <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" slot="hero-texts">
    function create_hero_texts_slot$2(ctx) {
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
    			h1.textContent = "About Action Democratic Party";
    			t1 = space();
    			p = element("p");
    			p.textContent = "TTHE ACTION DEMOCRATIC PARTY (ADP) is a registered political party in Nigeria. The party was formed and established in 2017 to deal with the lapses that have over the years been complained about by Nigerians because the tenets of true democracy have been lost thereby giving some select few a godlike image where political parties are being dictated upon by the few and powerful.";
    			t3 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "Join Us!";
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-blue-900");
    			add_location(h1, file$e, 11, 8, 556);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$e, 12, 8, 674);
    			attr_dev(a, "href", "/register");
    			attr_dev(a, "class", "inline-flex text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(a, file$e, 14, 12, 1144);
    			attr_dev(div1, "class", "flex justify-center");
    			add_location(div1, file$e, 13, 8, 1098);
    			attr_dev(div0, "class", "lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center");
    			attr_dev(div0, "slot", "hero-texts");
    			add_location(div0, file$e, 10, 6, 395);
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
    		id: create_hero_texts_slot$2.name,
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

    function create_fragment$e(ctx) {
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
    	let t12;
    	let p2;
    	let t14;
    	let missionbar;
    	let t15;
    	let newsbar;
    	let current;

    	hero = new Hero({
    			props: {
    				$$slots: {
    					default: [create_default_slot$2],
    					"hero-texts": [create_hero_texts_slot$2],
    					"hero-image": [create_hero_image_slot$2]
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
    			p1.textContent = "The keyword is democracy and this democracy is the same that is universally accepted and practiced all over; no one man or woman is greater than the party or one's view much better than the other member's when that view has not been examined and discussed. The ADP is the Nigeria's credible alternative with modern thinking and applications in its manifesto.";
    			t12 = space();
    			p2 = element("p");
    			p2.textContent = "ADP is the party for every Nigerian who believes that the traditional and archaic methods of attending to the Nigerian quagmire should be revisited . ADP is the political party that is building a better future for a more unified Nigeria.";
    			t14 = space();
    			create_component(missionbar.$$.fragment);
    			t15 = space();
    			create_component(newsbar.$$.fragment);
    			attr_dev(h2, "class", " font-medium text-lg py-2 ");
    			add_location(h2, file$e, 22, 3, 1403);
    			attr_dev(p0, "class", "font-medium py-2");
    			add_location(p0, file$e, 23, 3, 1478);
    			add_location(li0, file$e, 28, 4, 1588);
    			add_location(li1, file$e, 29, 4, 1619);
    			add_location(li2, file$e, 30, 4, 1677);
    			attr_dev(ul, "class", "list-disc px-7");
    			add_location(ul, file$e, 27, 0, 1556);
    			attr_dev(p1, "class", "py-4");
    			add_location(p1, file$e, 32, 0, 1708);
    			attr_dev(p2, "class", "py-4");
    			add_location(p2, file$e, 34, 0, 2089);
    			attr_dev(div, "class", "p-4");
    			add_location(div, file$e, 20, 4, 1381);
    			attr_dev(section, "class", "container mx-auto");
    			add_location(section, file$e, 19, 0, 1341);
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
    			append_dev(div, t12);
    			append_dev(div, p2);
    			insert_dev(target, t14, anchor);
    			mount_component(missionbar, target, anchor);
    			insert_dev(target, t15, anchor);
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
    			if (detaching) detach_dev(t14);
    			destroy_component(missionbar, detaching);
    			if (detaching) detach_dev(t15);
    			destroy_component(newsbar, detaching);
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/pages/Register.svelte generated by Svelte v3.31.2 */

    const file$f = "src/pages/Register.svelte";

    function create_fragment$f(ctx) {
    	let section1;
    	let div22;
    	let div5;
    	let h1;
    	let t1;
    	let section0;
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
    			section1 = element("section");
    			div22 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Register";
    			t1 = space();
    			section0 = element("section");
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
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900");
    			add_location(h1, file$f, 5, 8, 161);
    			attr_dev(span0, "class", "text-red-500");
    			add_location(span0, file$f, 9, 76, 583);
    			attr_dev(p0, "class", "leading-relaxed text-base mb-3");
    			add_location(p0, file$f, 9, 16, 523);
    			attr_dev(li0, "class", "mb-4");
    			add_location(li0, file$f, 11, 20, 700);
    			attr_dev(li1, "class", "mb-4");
    			add_location(li1, file$f, 12, 20, 850);
    			attr_dev(ul, "class", "list-disc");
    			add_location(ul, file$f, 10, 16, 657);
    			attr_dev(div0, "class", "md:w-1/2 md:pr-12 md:py-8 md:border-r md:border-b-0 mb-10 md:mb-0 pb-10 border-b border-gray-200");
    			add_location(div0, file$f, 8, 14, 396);
    			attr_dev(h2, "class", "title-font font-semibold text-gray-800 tracking-wider text-sm mb-3");
    			add_location(h2, file$f, 16, 16, 1051);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "ppics");
    			attr_dev(input0, "id", "fileupload");
    			attr_dev(input0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input0, file$f, 20, 22, 1280);
    			attr_dev(div1, "class", "mt-2 flex items-center");
    			add_location(div1, file$f, 19, 20, 1221);
    			add_location(div2, file$f, 17, 16, 1174);
    			attr_dev(div3, "class", "flex flex-col md:w-1/2 md:pl-12");
    			add_location(div3, file$f, 15, 14, 989);
    			attr_dev(div4, "class", "container flex flex-wrap px-5 py-5 mx-auto items-center");
    			add_location(div4, file$f, 7, 12, 312);
    			attr_dev(section0, "class", "text-gray-600 body-font");
    			add_location(section0, file$f, 6, 8, 258);
    			attr_dev(div5, "class", "flex flex-col text-justify w-full mb-12");
    			add_location(div5, file$f, 4, 6, 99);
    			attr_dev(span1, "class", "text-red-500");
    			add_location(span1, file$f, 33, 76, 1985);
    			attr_dev(label0, "for", "fullname");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$f, 33, 4, 1913);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "fullname");
    			attr_dev(input1, "name", "fullname");
    			attr_dev(input1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input1, file$f, 34, 4, 2033);
    			attr_dev(div6, "class", "relative mb-4");
    			add_location(div6, file$f, 32, 0, 1881);
    			attr_dev(span2, "class", "text-red-500");
    			add_location(span2, file$f, 37, 75, 2401);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$f, 37, 4, 2330);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input2, file$f, 38, 4, 2449);
    			attr_dev(div7, "class", "relative mb-4");
    			add_location(div7, file$f, 36, 0, 2298);
    			attr_dev(span3, "class", "text-red-500");
    			add_location(span3, file$f, 41, 86, 2830);
    			attr_dev(label2, "for", "phonenumber");
    			attr_dev(label2, "class", "leading-7 text-sm text-gray-600");
    			add_location(label2, file$f, 41, 4, 2748);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "phonenumber");
    			attr_dev(input3, "name", "phonenumber");
    			attr_dev(input3, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input3, file$f, 42, 4, 2878);
    			attr_dev(div8, "class", "relative mb-4");
    			add_location(div8, file$f, 40, 0, 2716);
    			attr_dev(span4, "class", "text-red-500");
    			add_location(span4, file$f, 45, 70, 3249);
    			attr_dev(label3, "for", "gender");
    			attr_dev(label3, "class", "leading-7 text-sm text-gray-600");
    			add_location(label3, file$f, 45, 4, 3183);
    			option0.__value = "male";
    			option0.value = option0.__value;
    			add_location(option0, file$f, 47, 8, 3548);
    			option1.__value = "female";
    			option1.value = option1.__value;
    			add_location(option1, file$f, 48, 8, 3592);
    			attr_dev(select0, "id", "gender");
    			attr_dev(select0, "name", "gender");
    			attr_dev(select0, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select0, file$f, 46, 4, 3297);
    			attr_dev(div9, "class", "relative mb-4");
    			add_location(div9, file$f, 44, 0, 3151);
    			attr_dev(span5, "class", "text-red-500");
    			add_location(span5, file$f, 52, 68, 3751);
    			attr_dev(label4, "for", "state");
    			attr_dev(label4, "class", "leading-7 text-sm text-gray-600");
    			add_location(label4, file$f, 52, 4, 3687);
    			option2.__value = "";
    			option2.value = option2.__value;
    			add_location(option2, file$f, 54, 8, 4048);
    			attr_dev(select1, "id", "state");
    			attr_dev(select1, "name", "state");
    			attr_dev(select1, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select1, file$f, 53, 4, 3799);
    			attr_dev(div10, "class", "relative mb-4");
    			add_location(div10, file$f, 51, 0, 3655);
    			attr_dev(span6, "class", "text-red-500");
    			add_location(span6, file$f, 59, 66, 4213);
    			attr_dev(label5, "for", "ward");
    			attr_dev(label5, "class", "leading-7 text-sm text-gray-600");
    			add_location(label5, file$f, 59, 4, 4151);
    			option3.__value = "";
    			option3.value = option3.__value;
    			add_location(option3, file$f, 61, 8, 4508);
    			attr_dev(select2, "id", "ward");
    			attr_dev(select2, "name", "ward");
    			attr_dev(select2, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select2, file$f, 60, 4, 4261);
    			attr_dev(div11, "class", "relative mb-4");
    			add_location(div11, file$f, 58, 0, 4119);
    			attr_dev(div12, "class", "relative flex-grow w-full");
    			add_location(div12, file$f, 30, 0, 1817);
    			attr_dev(span7, "class", "text-red-500");
    			add_location(span7, file$f, 72, 87, 4788);
    			attr_dev(label6, "for", "pvc_number");
    			attr_dev(label6, "class", "leading-7 text-sm text-gray-600");
    			add_location(label6, file$f, 72, 12, 4713);
    			attr_dev(input4, "type", "pvc_number");
    			attr_dev(input4, "id", "pvc_number");
    			attr_dev(input4, "name", "pvc_number");
    			attr_dev(input4, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input4, file$f, 73, 12, 4846);
    			attr_dev(div13, "class", "relative mb-4");
    			add_location(div13, file$f, 71, 9, 4673);
    			attr_dev(span8, "class", "text-red-500");
    			add_location(span8, file$f, 77, 99, 5276);
    			attr_dev(label7, "for", "confirm_password");
    			attr_dev(label7, "class", "leading-7 text-sm text-gray-600");
    			add_location(label7, file$f, 77, 12, 5189);
    			attr_dev(input5, "type", "confirm_password");
    			attr_dev(input5, "id", "confirm_password");
    			attr_dev(input5, "name", "confirm_password");
    			attr_dev(input5, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input5, file$f, 78, 12, 5333);
    			attr_dev(div14, "class", "relative mb-4");
    			add_location(div14, file$f, 76, 10, 5149);
    			attr_dev(span9, "class", "text-red-500");
    			add_location(span9, file$f, 81, 85, 5760);
    			attr_dev(label8, "for", "email");
    			attr_dev(label8, "class", "leading-7 text-sm text-gray-600");
    			add_location(label8, file$f, 81, 12, 5687);
    			attr_dev(input6, "type", "email");
    			attr_dev(input6, "id", "email");
    			attr_dev(input6, "name", "email");
    			attr_dev(input6, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input6, file$f, 82, 12, 5817);
    			attr_dev(div15, "class", "relative mb-4");
    			add_location(div15, file$f, 80, 10, 5647);
    			attr_dev(span10, "class", "text-red-500");
    			add_location(span10, file$f, 85, 83, 6209);
    			attr_dev(label9, "for", "dob");
    			attr_dev(label9, "class", "leading-7 text-sm text-gray-600");
    			add_location(label9, file$f, 85, 12, 6138);
    			attr_dev(input7, "type", "date");
    			attr_dev(input7, "id", "dob");
    			attr_dev(input7, "name", "dob");
    			attr_dev(input7, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input7, file$f, 86, 12, 6266);
    			attr_dev(div16, "class", "relative mb-4");
    			add_location(div16, file$f, 84, 10, 6098);
    			attr_dev(span11, "class", "text-red-500");
    			add_location(span11, file$f, 89, 90, 6660);
    			attr_dev(label10, "for", "lga");
    			attr_dev(label10, "class", "leading-7 text-sm text-gray-600");
    			add_location(label10, file$f, 89, 12, 6582);
    			option4.__value = "";
    			option4.value = option4.__value;
    			add_location(option4, file$f, 91, 16, 6970);
    			attr_dev(select3, "id", "lga");
    			attr_dev(select3, "name", "lga");
    			attr_dev(select3, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select3, file$f, 90, 12, 6717);
    			attr_dev(div17, "class", "relative mb-4");
    			add_location(div17, file$f, 88, 10, 6542);
    			attr_dev(span12, "class", "text-red-500");
    			add_location(span12, file$f, 96, 89, 7191);
    			attr_dev(label11, "for", "voting_unit");
    			attr_dev(label11, "class", "leading-7 text-sm text-gray-600");
    			add_location(label11, file$f, 96, 12, 7114);
    			option5.__value = "";
    			option5.value = option5.__value;
    			add_location(option5, file$f, 98, 16, 7517);
    			attr_dev(select4, "id", "voting_unit");
    			attr_dev(select4, "name", "voting_unit");
    			attr_dev(select4, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(select4, file$f, 97, 12, 7248);
    			attr_dev(div18, "class", "relative mb-4");
    			add_location(div18, file$f, 95, 10, 7074);
    			attr_dev(div19, "class", "relative flex-grow w-full");
    			add_location(div19, file$f, 69, 0, 4591);
    			attr_dev(div20, "class", "flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end");
    			add_location(div20, file$f, 28, 6, 1693);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-8 focus:outline-none hover:bg-red-600 rounded text-lg mx-auto my-3");
    			add_location(button, file$f, 105, 43, 7699);
    			add_location(br, file$f, 105, 182, 7838);
    			attr_dev(a, "href", "/login");
    			attr_dev(a, "class", "text-blue-500");
    			add_location(a, file$f, 106, 65, 7908);
    			attr_dev(p1, "class", "text-sm text-center");
    			add_location(p1, file$f, 106, 8, 7851);
    			attr_dev(div21, "class", "container mx-auto w-32");
    			add_location(div21, file$f, 105, 6, 7662);
    			attr_dev(div22, "class", "container px-5 py-24 mx-auto");
    			add_location(div22, file$f, 3, 4, 50);
    			attr_dev(section1, "class", "text-gray-600 body-font");
    			add_location(section1, file$f, 2, 2, 4);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div22);
    			append_dev(div22, div5);
    			append_dev(div5, h1);
    			append_dev(div5, t1);
    			append_dev(div5, section0);
    			append_dev(section0, div4);
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
    			if (detaching) detach_dev(section1);
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

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Register", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/pages/Candidates.svelte generated by Svelte v3.31.2 */

    const file$g = "src/pages/Candidates.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (23:8) {#each biographies as bio}
    function create_each_block$2(ctx) {
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
    			add_location(img, file$g, 25, 66, 3161);
    			attr_dev(span, "class", "font-semibold title-font text-gray-700");
    			add_location(span, file$g, 25, 12, 3107);
    			attr_dev(div0, "class", "md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col");
    			add_location(div0, file$g, 24, 10, 3032);
    			attr_dev(h1, "class", "text-2xl font-medium text-red-900 title-font mb-2");
    			add_location(h1, file$g, 29, 12, 3282);
    			attr_dev(h3, "class", "text-2xl font-medium text-blue-900 title-font mb-2");
    			add_location(h3, file$g, 30, 12, 3372);
    			attr_dev(p, "class", "leading-relaxed");
    			add_location(p, file$g, 31, 12, 3467);
    			attr_dev(div1, "class", "md:flex-grow pl-10");
    			add_location(div1, file$g, 28, 10, 3237);
    			attr_dev(div2, "class", "py-8 flex flex-wrap md:flex-nowrap");
    			add_location(div2, file$g, 23, 8, 2973);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:8) {#each biographies as bio}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let each_value = /*biographies*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			add_location(div0, file$g, 21, 6, 2883);
    			attr_dev(div1, "class", "container px-5 py-24 mx-auto");
    			add_location(div1, file$g, 20, 4, 2834);
    			attr_dev(section, "class", "text-gray-600 body-font overflow-hidden");
    			add_location(section, file$g, 19, 0, 2772);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Candidates",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/pages/Contact.svelte generated by Svelte v3.31.2 */

    const file$h = "src/pages/Contact.svelte";

    function create_fragment$h(ctx) {
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
    			add_location(iframe, file$h, 3, 8, 160);
    			attr_dev(div0, "class", "absolute inset-0 bg-gray-300");
    			add_location(div0, file$h, 1, 4, 55);
    			attr_dev(h2, "class", "text-white text-lg mb-1 font-medium title-font");
    			add_location(h2, file$h, 8, 8, 784);
    			add_location(br, file$h, 9, 198, 1058);
    			attr_dev(p0, "class", "leading-relaxed mb-2 text-gray-600 text-xs bg-white rounded-md shadow-lg p-3");
    			add_location(p0, file$h, 9, 8, 868);
    			attr_dev(p1, "class", "leading-relaxed mb-2 text-gray-600 text-xs ");
    			add_location(p1, file$h, 12, 8, 1134);
    			if (img0.src !== (img0_src_value = "../addressicon.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", " w-5");
    			add_location(img0, file$h, 14, 47, 1301);
    			attr_dev(span0, "class", "block mb-1 leading-5");
    			add_location(span0, file$h, 14, 11, 1265);
    			if (img1.src !== (img1_src_value = "../telephoneicon.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", " w-5 mr-2");
    			add_location(img1, file$h, 15, 49, 1516);
    			attr_dev(span1, "class", "flex mb-1 items-center");
    			add_location(span1, file$h, 15, 11, 1478);
    			if (img2.src !== (img2_src_value = "../whatsappicon.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", " w-5 mr-2");
    			add_location(img2, file$h, 16, 50, 1651);
    			attr_dev(span2, "class", "flex mb-1 items-center");
    			add_location(span2, file$h, 16, 11, 1612);
    			if (img3.src !== (img3_src_value = "../mailicon.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", " w-5 mr-2");
    			add_location(img3, file$h, 17, 48, 1784);
    			attr_dev(span3, "class", "flex mb-1 items-center");
    			add_location(span3, file$h, 17, 11, 1747);
    			attr_dev(p2, "class", "text-xs bg-white rounded-md shadow-lg p-3");
    			add_location(p2, file$h, 13, 10, 1200);
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "leading-7 text-sm text-gray-600");
    			add_location(label0, file$h, 22, 10, 1933);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "id", "email");
    			attr_dev(input, "name", "email");
    			attr_dev(input, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out");
    			add_location(input, file$h, 23, 10, 2016);
    			attr_dev(div1, "class", "relative mb-4");
    			add_location(div1, file$h, 21, 8, 1895);
    			attr_dev(label1, "for", "message");
    			attr_dev(label1, "class", "leading-7 text-sm text-gray-600");
    			add_location(label1, file$h, 26, 10, 2330);
    			attr_dev(textarea, "id", "message");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "class", "w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out");
    			add_location(textarea, file$h, 27, 10, 2417);
    			attr_dev(div2, "class", "relative mb-4");
    			add_location(div2, file$h, 25, 8, 2292);
    			attr_dev(button, "class", "text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(button, file$h, 29, 8, 2715);
    			attr_dev(div3, "class", "lg:w-1/3 md:w-1/2 bg-gray-900 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md");
    			add_location(div3, file$h, 7, 6, 647);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex");
    			add_location(div4, file$h, 5, 4, 592);
    			attr_dev(section, "class", "text-gray-600 body-font relative");
    			add_location(section, file$h, 0, 0, 0);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/pages/Login.svelte generated by Svelte v3.31.2 */

    const file$i = "src/pages/Login.svelte";

    function create_fragment$i(ctx) {
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
    			add_location(div0, file$i, 2, 8, 131);
    			attr_dev(h2, "class", "text-2xl font-semibold text-gray-700 dark:text-white text-center text-blue-900");
    			add_location(h2, file$i, 5, 12, 308);
    			attr_dev(p, "class", "text-xl text-red-600 dark:text-red-200 text-center");
    			add_location(p, file$i, 7, 12, 441);
    			attr_dev(label0, "class", "block text-gray-600 dark:text-gray-200 text-sm font-medium mb-2");
    			attr_dev(label0, "for", "LoggingEmailAddress");
    			add_location(label0, file$i, 10, 16, 569);
    			attr_dev(input0, "id", "LoggingEmailAddress");
    			attr_dev(input0, "class", "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded py-2 px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			attr_dev(input0, "type", "email");
    			add_location(input0, file$i, 11, 16, 712);
    			attr_dev(div1, "class", "mt-4");
    			add_location(div1, file$i, 9, 12, 534);
    			attr_dev(label1, "class", "block text-gray-600 dark:text-gray-200 text-sm font-medium mb-2");
    			attr_dev(label1, "for", "loggingPassword");
    			add_location(label1, file$i, 16, 20, 1101);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "text-xs text-gray-500 dark:text-gray-300 hover:underline");
    			add_location(a0, file$i, 17, 20, 1239);
    			attr_dev(div2, "class", "flex justify-between");
    			add_location(div2, file$i, 15, 16, 1046);
    			attr_dev(input1, "id", "loggingPassword");
    			attr_dev(input1, "class", "bg-wbg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded py-2 px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring");
    			attr_dev(input1, "type", "password");
    			add_location(input1, file$i, 20, 16, 1377);
    			attr_dev(div3, "class", "mt-4");
    			add_location(div3, file$i, 14, 12, 1011);
    			attr_dev(button, "class", "bg-red-500 text-white py-2 px-4 w-full tracking-wide rounded hover:bg-red-600 focus:outline-none focus:bg-gray-600");
    			add_location(button, file$i, 24, 16, 1714);
    			attr_dev(div4, "class", "mt-8");
    			add_location(div4, file$i, 23, 12, 1679);
    			attr_dev(span0, "class", "border-b dark:border-gray-600 w-1/5 md:w-1/4");
    			add_location(span0, file$i, 30, 16, 2011);
    			attr_dev(a1, "href", "/register");
    			attr_dev(a1, "class", "text-xs text-gray-500 dark:text-gray-400 uppercase hover:underline");
    			add_location(a1, file$i, 32, 16, 2095);
    			attr_dev(span1, "class", "border-b dark:border-gray-600 w-1/5 md:w-1/4");
    			add_location(span1, file$i, 34, 16, 2238);
    			attr_dev(div5, "class", "mt-4 flex items-center justify-between");
    			add_location(div5, file$i, 29, 12, 1942);
    			attr_dev(div6, "class", "w-full py-8 px-6 md:px-8 lg:w-1/2");
    			add_location(div6, file$i, 4, 8, 248);
    			attr_dev(div7, "class", "flex max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg my-24 shadow-lg overflow-hidden lg:max-w-4xl");
    			add_location(div7, file$i, 1, 4, 5);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file$j = "src/App.svelte";

    function create_fragment$j(ctx) {
    	let navbar;
    	let t0;
    	let main;
    	let switch_instance;
    	let t1;
    	let footer;
    	let current;

    	navbar = new Navbar({
    			props: { segment: /*segment*/ ctx[1] },
    			$$inline: true
    		});

    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$j, 54, 0, 1408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};
    			if (dirty & /*segment*/ 2) navbar_changes.segment = /*segment*/ ctx[1];
    			navbar.$set(navbar_changes);

    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
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
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
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

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let page$1;
    	let activePage;
    	let segment;

    	page("/", () => {
    		$$invalidate(0, page$1 = Index);

    		// activePage="current"
    		$$invalidate(1, segment = undefined);
    	});

    	page("/structure", () => {
    		$$invalidate(0, page$1 = Structure);

    		// activePage="current"
    		$$invalidate(1, segment = "structure");
    	});

    	page("/constitution", () => {
    		$$invalidate(0, page$1 = Constitution);

    		// activePage="current"
    		$$invalidate(1, segment = "constitution");
    	});

    	page("/about", () => {
    		$$invalidate(0, page$1 = About);

    		// activePage="current"
    		$$invalidate(1, segment = "about");
    	});

    	page("/register", () => {
    		$$invalidate(0, page$1 = Register);

    		// activePage="current"
    		$$invalidate(1, segment = "register");
    	});

    	page("/candidates", () => {
    		$$invalidate(0, page$1 = Candidates);

    		// activePage="current"
    		$$invalidate(1, segment = "candidate");
    	});

    	page("/contact", () => {
    		$$invalidate(0, page$1 = Contact);

    		// activePage="current"
    		$$invalidate(1, segment = "contact");
    	});

    	page("/login", () => {
    		$$invalidate(0, page$1 = Login);
    	}); // activePage="current"

    	page.start({ hashbang: true });
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Index,
    		Structure,
    		NavBar: Navbar,
    		router: page,
    		Constitution,
    		About,
    		Register,
    		Candidates,
    		Contact,
    		Footer,
    		Login,
    		page: page$1,
    		activePage,
    		segment
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page$1 = $$props.page);
    		if ("activePage" in $$props) activePage = $$props.activePage;
    		if ("segment" in $$props) $$invalidate(1, segment = $$props.segment);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page$1, segment];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
