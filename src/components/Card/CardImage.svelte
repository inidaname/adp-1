<style>

</style>


<script>
export let properties;
</script>

{#each properties as prop}
<div class="p-4 lg:w-1/2 md:w-full ">
    <div class="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex  rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col shadow-lg border-0 hover:shadow-xl ">
      <div class="w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-white-100 flex-shrink-0">
     <img src="{prop.img}" alt="...">   
      </div>
      <div class="flex-grow">
        <h2 class="text-gray-900 text-lg title-font font-medium mb-3">{prop.title}</h2>
        <p class="leading-relaxed text-sm font-light">{prop.body}</p>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="mt-3 text-blue-500 inline-flex items-center text-sm" href="{prop.url}">{prop.footer}
          
        </a>
      </div>
    </div>
  </div>
{/each}