<script>
  let isNav = false;
  export let activePage;

  console.log(activePage);
  function openNav() {
    isNav === false ? (isNav = true) : (isNav = false);
  }
  import { active } from "tinro";
</script>

<nav
  class="px-6 py-3 border-b-2 border-gray-900 fixed w-full top-0 z-30  bg-gray-800"
>
  <div class="md:flex items-center justify-between">
    <div class="flex justify-between items-center">
      <div>
        <a
          class="text-gray-800 dark:text-white text-xl font-bold md:text-2xl hover:text-gray-700 dark:hover:text-gray-300"
          href="/"
        >
          <img
            src="../adplogo.jpg"
            width="70"
            alt="adplogos"
            class="rounded-lg"
          />
        </a>
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          type="button"
          class="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400"
          aria-label="Toggle menu"
          on:click={openNav}
        >
          <img
            src={isNav ? "../xtimes.svg" : "../ham.svg"}
            alt=""
            class="border-0 focus:outline-none"
          />
        </button>
      </div>
    </div>

    <!-- Mobile Menu open: "block", Menu closed: "hidden" -->
    <div
      class="flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block {`${
        isNav ? 'block' : 'hidden'
      }`}"
    >
      <a
        href="/"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500"
        exact>Home</a
      >
      <a
        href="/about"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500">About Us</a
      >

      <a
        href="/structure"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500"
        >Structure
      </a>
      <a
        href="/register"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500"
        >Register
      </a>
      <a
        href="/candidates"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500"
        >Candidates
      </a>
      <a
        href="/downloads"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500"
        >Downloads
      </a>
      <a
        href="contact"
        class="py-2 px-2 transition duration-500 ease-in-out text-sm text-white rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"
        use:active
        active-class="bg-red-500"
        >Contact Us
      </a>
    </div>
  </div>
</nav>

<style>
</style>
