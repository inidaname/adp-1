<style>

</style>


<script>
export let properties;
</script>

{#each properties as prop}
<div class="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110  p-4 md:w-1/3 card shadow-lg rounded-md border-0 mx-5 my-5 bg-white">
    <div class="flex rounded-lg h-full  p- justify-center flex-col">
      <div class="flex items-center mb-3">
        <div class="card-title">
           <h2 class="text-red-900  text-lg title-font font-medium"> {prop.title}</h2>
        </div> 
      </div>
      <div class="flex-grow">
        <p class="leading-relaxed sm:text-sm font-light">{prop.body}</p>
        <!-- svelte-ignore a11y-missing-attribute -->
       
      </div>
    </div>
  </div> 
{/each}