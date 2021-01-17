
{#each galleries as image }
<div class="lg:w-1/3 sm:w-1/2 p-4">
    <div class="flex relative ">
      <img alt="gallery" class="absolute inset-0 w-full h-full object-cover object-center" src="{image.img}">
      <div class="px-10 py-20 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
       
        <h1 class="title-font text-lg font-medium text-gray-900 mb-3">{image.name}</h1>
        <p class="leading-relaxed">{image.position}</p>
      </div>
    </div>
  </div>
  {/each}
  <script>
      export let galleries;
  </script>