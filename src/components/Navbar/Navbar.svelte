<style>

</style>

<script>
let isNav = false;
export let activePage;
export let segment;
console.log(activePage)
function openNav () {
    isNav === false ? isNav = true: isNav=false;
    console.log(isNav)
    }
</script>
<nav class="px-6 py-3 border-b-2 border-gray-900 fixed w-full top-0 z-30 bg-white">
    <div class="md:flex items-center justify-between">
        <div class="flex justify-between items-center">
            <div>
                <a class="text-gray-800 dark:text-white text-xl font-bold md:text-2xl hover:text-gray-700 dark:hover:text-gray-300" href="/">
                    <img src="../adplogo.jpg" width="90" alt="adplogos">
                </a>
            </div>
    
            <!-- Mobile menu button -->
            <div class="md:hidden">
                <button type="button" class="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400" aria-label="Toggle menu" on:click={openNav}>
                    <img src={isNav?"../xtimes.svg":"../ham.svg"} alt="" class="border-0 focus:outline-none">

                </button>
            </div>
        </div>
    
        <!-- Mobile Menu open: "block", Menu closed: "hidden" -->
        <div class="flex flex-col -mx-2 mt-2 md:mt-0 md:flex-row md:block {`${isNav? "block":"hidden"}`}" >
            <a href="/" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2" class:bg-red-500={segment === undefined}
            >Home</a>
            <a href="/about" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2" class:bg-red-500={segment === "about"}>About Us</a>
            <a href="/constitution" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2" class:bg-red-500={segment === "constitution"}>Constitution </a>
            <a href="/structure" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2" class:bg-red-500={segment === "structure"}>Structure </a>
            <a href="/register" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"class:bg-red-500={segment === "register"}>Register </a>
            <a href="/candidates" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"class:bg-red-500={segment === "candidate"}>Candidates </a>
            <a href="contact" class="py-2 px-2 transition duration-500 ease-in-out text-sm text-gray-900 rounded hover:bg-gray-900 hover:text-gray-100 hover:font-medium md:mx-2"class:bg-red-500={segment === "contact"}>Contact Us </a>
        </div>
    </div>
</nav>



