
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    			add_location(img0, file, 14, 20, 477);
    			attr_dev(a0, "class", "text-gray-800 dark:text-white text-xl font-bold md:text-2xl hover:text-gray-700 dark:hover:text-gray-300");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file, 13, 16, 331);
    			add_location(div0, file, 12, 12, 309);
    			if (img1.src !== (img1_src_value = /*isNav*/ ctx[0] ? "../xtimes.svg" : "../ham.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "border-0 focus:outline-none");
    			add_location(img1, file, 21, 20, 904);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400");
    			attr_dev(button, "aria-label", "Toggle menu");
    			add_location(button, file, 20, 16, 667);
    			attr_dev(div1, "class", "md:hidden");
    			add_location(div1, file, 19, 12, 627);
    			attr_dev(div2, "class", "flex justify-between items-center");
    			add_location(div2, file, 11, 8, 249);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a1, file, 29, 12, 1246);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a2, file, 30, 12, 1410);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a3, file, 31, 12, 1578);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a4, file, 32, 12, 1751);
    			attr_dev(a5, "href", "#");
    			attr_dev(a5, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a5, file, 33, 12, 1921);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a6, file, 34, 12, 2090);
    			attr_dev(a7, "href", "#");
    			attr_dev(a7, "class", "py-2 px-2 text-sm text-gray-800 dark:text-gray-200 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2");
    			add_location(a7, file, 35, 12, 2261);
    			attr_dev(div3, "class", div3_class_value = "flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block " + `${/*isNav*/ ctx[0] ? "block" : "hidden"}`);
    			add_location(div3, file, 28, 8, 1134);
    			attr_dev(div4, "class", "md:flex items-center justify-between");
    			add_location(div4, file, 10, 4, 190);
    			attr_dev(nav, "class", "px-6 py-3 shadow");
    			add_location(nav, file, 9, 0, 155);
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
    				dispose = listen_dev(button, "click", /*openNav*/ ctx[1], false, false, false);
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

    	function openNav() {
    		isNav === false
    		? $$invalidate(0, isNav = true)
    		: $$invalidate(0, isNav = false);

    		console.log(isNav);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ isNav, openNav });

    	$$self.$inject_state = $$props => {
    		if ("isNav" in $$props) $$invalidate(0, isNav = $$props.isNav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isNav, openNav];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Hero/Hero.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/components/Hero/Hero.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let navbar;
    	let t0;
    	let section;
    	let div3;
    	let div1;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let div0;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let div2;
    	let img;
    	let img_src_value;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			section = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Action Democratic Party";
    			t2 = space();
    			p = element("p");
    			p.textContent = "THE ACTION DEMOCRATIC PARTY (ADP) is a registered political party in Nigeria. The party was formed and established in 2017 to deal with the lapses that have over the years been complained about by Nigerians because the tenets of true democracy have been lost thereby giving some select few a godlike image where political parties are being dictated upon by the few and powerful.";
    			t4 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Join Us!";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Explore";
    			t8 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(h1, "class", "title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900");
    			add_location(h1, file$1, 12, 12, 434);
    			attr_dev(p, "class", "mb-8 leading-relaxed");
    			add_location(p, file$1, 14, 12, 563);
    			attr_dev(button0, "class", "inline-flex text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg");
    			add_location(button0, file$1, 16, 14, 1038);
    			attr_dev(button1, "class", "ml-4 inline-flex text-gray-700 bg-white py-2 px-6 focus:outline-none hover:text-red-500 rounded text-lg border-red-500");
    			add_location(button1, file$1, 17, 14, 1191);
    			attr_dev(div0, "class", "flex justify-center");
    			add_location(div0, file$1, 15, 12, 990);
    			attr_dev(div1, "class", "lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center");
    			add_location(div1, file$1, 11, 10, 287);
    			attr_dev(img, "class", "object-cover object-center rounded");
    			attr_dev(img, "alt", "hero");
    			if (img.src !== (img_src_value = "../office.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 21, 12, 1452);
    			attr_dev(div2, "class", "lg:max-w-lg lg:w-full md:w-1/2 w-5/6");
    			add_location(div2, file$1, 20, 10, 1389);
    			attr_dev(div3, "class", "container mx-auto flex px-5 py-24 md:flex-row flex-col items-center");
    			add_location(div3, file$1, 10, 8, 195);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$1, 9, 4, 145);
    			attr_dev(header, "class", "bg-white dark:bg-gray-800");
    			add_location(header, file$1, 7, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(navbar, header, null);
    			append_dev(header, t0);
    			append_dev(header, section);
    			append_dev(section, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t6);
    			append_dev(div0, button1);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(navbar);
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
    	validate_slots("Hero", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NavBar: Navbar });
    	return [];
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
    			p0.textContent = "Air plant banjo lyft occupy retro adaptogen indego";
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
    			add_location(img, file$2, 4, 12, 395);
    			attr_dev(a0, "class", "flex title-font font-medium items-center md:justify-start justify-center text-gray-900");
    			add_location(a0, file$2, 3, 8, 284);
    			attr_dev(p0, "class", "mt-2 text-sm text-gray-500");
    			add_location(p0, file$2, 6, 8, 470);
    			attr_dev(div0, "class", "w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left md:mt-0 mt-10");
    			add_location(div0, file$2, 2, 6, 188);
    			attr_dev(h20, "class", "title-font font-medium text-gray-900 tracking-widest text-sm mb-3");
    			add_location(h20, file$2, 10, 10, 736);
    			add_location(li0, file$2, 12, 12, 896);
    			attr_dev(nav0, "class", "list-none mb-10");
    			add_location(nav0, file$2, 11, 10, 854);
    			attr_dev(div1, "class", "lg:w-1/2 md:w-1/2 w-full px-4");
    			add_location(div1, file$2, 9, 8, 682);
    			attr_dev(h21, "class", "title-font font-medium text-gray-900 tracking-widest text-sm mb-3");
    			add_location(h21, file$2, 23, 10, 1226);
    			add_location(li1, file$2, 25, 12, 1376);
    			add_location(li2, file$2, 27, 15, 1435);
    			add_location(li3, file$2, 28, 13, 1476);
    			add_location(li4, file$2, 29, 13, 1519);
    			attr_dev(nav1, "class", "list-none mb-10");
    			add_location(nav1, file$2, 24, 10, 1334);
    			attr_dev(div2, "class", "lg:w-1/2 md:w-1/2 w-full px-4");
    			add_location(div2, file$2, 22, 8, 1172);
    			attr_dev(div3, "class", "flex-grow flex flex-wrap md:pr-20 -mb-10 md:text-left text-center order-first");
    			add_location(div3, file$2, 8, 6, 582);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col");
    			add_location(div4, file$2, 1, 4, 57);
    			attr_dev(p1, "class", "text-gray-500 text-sm text-center sm:text-left");
    			add_location(p1, file$2, 38, 8, 1750);
    			attr_dev(path0, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path0, file$2, 44, 14, 2187);
    			attr_dev(svg0, "fill", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "class", "w-5 h-5");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$2, 43, 12, 2047);
    			attr_dev(a1, "class", "text-gray-500");
    			add_location(a1, file$2, 42, 10, 2009);
    			attr_dev(path1, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path1, file$2, 50, 14, 2551);
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "class", "w-5 h-5");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$2, 49, 12, 2411);
    			attr_dev(a2, "class", "ml-3 text-gray-500");
    			add_location(a2, file$2, 48, 10, 2368);
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$2, 56, 14, 3030);
    			attr_dev(path2, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01");
    			add_location(path2, file$2, 57, 14, 3107);
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "class", "w-5 h-5");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$2, 55, 12, 2876);
    			attr_dev(a3, "class", "ml-3 text-gray-500");
    			add_location(a3, file$2, 54, 10, 2833);
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "d", "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z");
    			add_location(path3, file$2, 63, 14, 3487);
    			attr_dev(circle, "cx", "4");
    			attr_dev(circle, "cy", "4");
    			attr_dev(circle, "r", "2");
    			attr_dev(circle, "stroke", "none");
    			add_location(circle, file$2, 64, 14, 3618);
    			attr_dev(svg3, "fill", "currentColor");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			attr_dev(svg3, "stroke-width", "0");
    			attr_dev(svg3, "class", "w-5 h-5");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			add_location(svg3, file$2, 62, 12, 3325);
    			attr_dev(a4, "class", "ml-3 text-gray-500");
    			add_location(a4, file$2, 61, 10, 3282);
    			attr_dev(span, "class", "inline-flex sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start");
    			add_location(span, file$2, 40, 8, 1860);
    			attr_dev(div5, "class", "container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row");
    			add_location(div5, file$2, 37, 6, 1664);
    			attr_dev(div6, "class", "bg-gray-100");
    			add_location(div6, file$2, 36, 4, 1632);
    			attr_dev(footer, "class", "text-gray-600 body-font bg-gray-400");
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
    			add_location(img, file$3, 11, 5, 383);
    			attr_dev(div0, "class", "w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-white-100 flex-shrink-0");
    			add_location(div0, file$3, 10, 6, 253);
    			attr_dev(h2, "class", "text-gray-900 text-lg title-font font-medium mb-3");
    			add_location(h2, file$3, 14, 8, 470);
    			attr_dev(p, "class", "leading-relaxed text-base");
    			add_location(p, file$3, 15, 8, 558);
    			attr_dev(a, "class", "mt-3 text-blue-500 inline-flex items-center");
    			attr_dev(a, "href", a_href_value = /*prop*/ ctx[1].url);
    			add_location(a, file$3, 17, 8, 673);
    			attr_dev(div1, "class", "flex-grow");
    			add_location(div1, file$3, 13, 6, 438);
    			attr_dev(div2, "class", "flex border-0 rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col shadow-lg border-0");
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
    			add_location(h1, file$4, 29, 8, 1328);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-10");
    			add_location(div0, file$4, 28, 6, 1267);
    			attr_dev(div1, "class", "flex flex-wrap -m-4");
    			add_location(div1, file$4, 31, 6, 1434);
    			attr_dev(div2, "class", "container px-5 py-10 mx-auto");
    			add_location(div2, file$4, 27, 4, 1218);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$4, 26, 0, 1172);
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
    			img: "../newsImg1.jpg",
    			footer: "Read more",
    			url: "https://www.facebook.com"
    		},
    		{
    			title: "ADP presidential candidate says oil money should be used to develop country",
    			body: "Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
    			img: "../newsImg1.jpg",
    			footer: "Read more",
    			url: "https://www.facebook.com"
    		},
    		{
    			title: "ADP presidential candidate says oil money should be used to develop country",
    			body: "Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
    			img: "../newsImg1.jpg",
    			footer: "Read more",
    			url: "https://www.facebook.com"
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
    			h1.textContent = "Objectives";
    			t1 = space();
    			div0 = element("div");
    			create_component(cardwithimage.$$.fragment);
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font text-center text-gray-900 mb-10");
    			add_location(h1, file$5, 22, 6, 503);
    			attr_dev(div0, "class", "flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6");
    			add_location(div0, file$5, 25, 6, 631);
    			attr_dev(div1, "class", "container px-5 py-10 mx-auto");
    			add_location(div1, file$5, 21, 4, 454);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$5, 20, 0, 408);
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
    			footer: ""
    		},
    		{
    			title: "Vision",
    			body: "A Secure, Stable and Egalitarian Nigeria where Democracy and Rule of Law Reign.",
    			footer: ""
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
    			p1.textContent = "Literally you probably haven't heard of them jean shorts.";
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

    /* src/index.svelte generated by Svelte v3.31.2 */
    const file$8 = "src/index.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let hero;
    	let t0;
    	let section0;
    	let div1;
    	let h10;
    	let t2;
    	let div0;
    	let cardwithimage;
    	let t3;
    	let section1;
    	let div4;
    	let h2;
    	let t4;
    	let br;
    	let t5;
    	let t6;
    	let div3;
    	let p0;
    	let t8;
    	let div2;
    	let a;
    	let t9;
    	let svg;
    	let path;
    	let t10;
    	let section2;
    	let div8;
    	let div7;
    	let img;
    	let img_src_value;
    	let t11;
    	let div6;
    	let h11;
    	let t13;
    	let div5;
    	let t14;
    	let p1;
    	let t16;
    	let missionbar;
    	let t17;
    	let sidereg;
    	let t18;
    	let newsbar;
    	let t19;
    	let footer;
    	let current;
    	hero = new Hero({ $$inline: true });

    	cardwithimage = new CardImage({
    			props: { properties: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	missionbar = new Mission_Bar({ $$inline: true });
    	sidereg = new SideRegForm({ $$inline: true });
    	newsbar = new News_Bar({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Some facts...";
    			t2 = space();
    			div0 = element("div");
    			create_component(cardwithimage.$$.fragment);
    			t3 = space();
    			section1 = element("section");
    			div4 = element("div");
    			h2 = element("h2");
    			t4 = text("I’ll Restore The Pride, Economy Of Nigeria\n        ");
    			br = element("br");
    			t5 = text("  - YY Sani");
    			t6 = space();
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "Engr. Yabagi Yusuf Sani (YY Sani) is the presidential candidate of the Action Democratic Party (ADP) in the 2019 general elections. In this interview conducted during a meeting of all the candidates of the party held at the ADP National Secretariat in Abuja on January 9, he speaks on the necessity of the meeting, why Nigeria has become a laughing...";
    			t8 = space();
    			div2 = element("div");
    			a = element("a");
    			t9 = text("Learn More\n            ");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t10 = space();
    			section2 = element("section");
    			div8 = element("div");
    			div7 = element("div");
    			img = element("img");
    			t11 = space();
    			div6 = element("div");
    			h11 = element("h1");
    			h11.textContent = "From the Chairman's Desk";
    			t13 = space();
    			div5 = element("div");
    			t14 = space();
    			p1 = element("p");
    			p1.textContent = "The National Chairman of the Action Democratic Party (ADP), Engr. Yabagi Sani, spoke with Press men in Abuja. He expressed dissatisfaction with the way the economy of the country was being run, insisting that the interest of the masses do not feature in the decision made by the ruling party...";
    			t16 = space();
    			create_component(missionbar.$$.fragment);
    			t17 = space();
    			create_component(sidereg.$$.fragment);
    			t18 = space();
    			create_component(newsbar.$$.fragment);
    			t19 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h10, "class", "py-4 text-lg font-medium title-font sm:text-3xl text-2xl ");
    			add_location(h10, file$8, 38, 6, 1595);
    			attr_dev(div0, "class", "flex flex-wrap -m-4");
    			add_location(div0, file$8, 39, 6, 1690);
    			attr_dev(div1, "class", "container mx-auto px-5 py-4 mx-auto flex flex-wrap");
    			add_location(div1, file$8, 37, 4, 1524);
    			attr_dev(section0, "class", "text-gray-600 body-font");
    			add_location(section0, file$8, 36, 3, 1478);
    			add_location(br, file$8, 48, 8, 2053);
    			attr_dev(h2, "class", "sm:text-3xl text-2xl text-red-900 font-medium title-font mb-10 md:w-2/5");
    			add_location(h2, file$8, 47, 6, 1918);
    			attr_dev(p0, "class", "leading-relaxed text-base");
    			add_location(p0, file$8, 50, 8, 2119);
    			attr_dev(path, "d", "M5 12h14M12 5l7 7-7 7");
    			add_location(path, file$8, 55, 14, 2855);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "class", "w-4 h-4 ml-2");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$8, 54, 12, 2696);
    			attr_dev(a, "class", "text-blue-500 inline-flex items-center ml-4");
    			add_location(a, file$8, 53, 10, 2618);
    			attr_dev(div2, "class", "flex md:mt-4 mt-6");
    			add_location(div2, file$8, 51, 8, 2520);
    			attr_dev(div3, "class", "md:w-3/5 md:pl-6");
    			add_location(div3, file$8, 49, 6, 2080);
    			attr_dev(div4, "class", "container px-5 py-24 mx-auto flex flex-wrap");
    			add_location(div4, file$8, 46, 4, 1854);
    			attr_dev(section1, "class", "text-gray-600 body-font");
    			add_location(section1, file$8, 45, 2, 1808);
    			attr_dev(img, "alt", "Chairman's photo");
    			attr_dev(img, "class", "lg:w-1/2 w-full lg:h-auto h-64  rounded");
    			if (img.src !== (img_src_value = "../nChairman.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$8, 73, 6, 3296);
    			attr_dev(h11, "class", "text-red-900 text-3xl title-font font-medium mb-1");
    			add_location(h11, file$8, 76, 8, 3480);
    			attr_dev(div5, "class", "flex mb-4");
    			add_location(div5, file$8, 77, 8, 3580);
    			attr_dev(p1, "class", "leading-relaxed");
    			add_location(p1, file$8, 79, 8, 3627);
    			attr_dev(div6, "class", "lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0");
    			add_location(div6, file$8, 74, 6, 3403);
    			attr_dev(div7, "class", "lg:w-4/5 mx-auto flex flex-wrap p-2");
    			add_location(div7, file$8, 71, 4, 3188);
    			attr_dev(div8, "class", "container px-5 py-4 mx-auto");
    			add_location(div8, file$8, 70, 2, 3142);
    			attr_dev(section2, "class", "text-gray-600 body-font overflow-hidden");
    			add_location(section2, file$8, 69, 0, 3082);
    			add_location(main, file$8, 33, 5, 1448);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(hero, main, null);
    			append_dev(main, t0);
    			append_dev(main, section0);
    			append_dev(section0, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(cardwithimage, div0, null);
    			append_dev(main, t3);
    			append_dev(main, section1);
    			append_dev(section1, div4);
    			append_dev(div4, h2);
    			append_dev(h2, t4);
    			append_dev(h2, br);
    			append_dev(h2, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, p0);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, t9);
    			append_dev(a, svg);
    			append_dev(svg, path);
    			append_dev(main, t10);
    			append_dev(main, section2);
    			append_dev(section2, div8);
    			append_dev(div8, div7);
    			append_dev(div7, img);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, h11);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div6, t14);
    			append_dev(div6, p1);
    			append_dev(main, t16);
    			mount_component(missionbar, main, null);
    			append_dev(main, t17);
    			mount_component(sidereg, main, null);
    			append_dev(main, t18);
    			mount_component(newsbar, main, null);
    			insert_dev(target, t19, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(cardwithimage.$$.fragment, local);
    			transition_in(missionbar.$$.fragment, local);
    			transition_in(sidereg.$$.fragment, local);
    			transition_in(newsbar.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(cardwithimage.$$.fragment, local);
    			transition_out(missionbar.$$.fragment, local);
    			transition_out(sidereg.$$.fragment, local);
    			transition_out(newsbar.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(cardwithimage);
    			destroy_component(missionbar);
    			destroy_component(sidereg);
    			destroy_component(newsbar);
    			if (detaching) detach_dev(t19);
    			destroy_component(footer, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Src", slots, []);

    	const data = [
    		{
    			title: "Fact Number One",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more"
    		},
    		{
    			title: "Fact Number Two",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more"
    		},
    		{
    			title: "Fact Number Three",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more"
    		},
    		{
    			title: "Fact Number Four",
    			body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
    			footer: "Learn more"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Hero,
    		Footer,
    		NewsBar: News_Bar,
    		MissionBar: Mission_Bar,
    		CardWithImage: CardImage,
    		CTAForm: CTA_Form,
    		SideReg: SideRegForm,
    		data
    	});

    	return [data];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    function create_fragment$9(ctx) {
    	let index;
    	let current;
    	index = new Src({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(index.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(index, target, anchor);
    			current = true;
    		},
    		p: noop,
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Index: Src });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
