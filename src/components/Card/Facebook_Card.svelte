<style>

</style>


<script>
export let updates;
</script>

{#each updates as prop}
<div class="p-4 md:w-1/3 card shadow-lg border-0">
    <div class="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
      <div class="flex items-center mb-3">
        <div class="card-title">
           <h2 class="text-gray-900 text-lg title-font font-medium"> {prop.title}</h2>
        </div> 
      </div>
      <div class="flex-grow">
        <p class="leading-relaxed text-base">{prop.body}</p>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="mt-3 text-indigo-500 inline-flex items-center">{prop.footer}
          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </div>
  </div> 
{/each}