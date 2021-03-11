<!-- {#each galleries as image }
<div class="lg:w-1/3 sm:w-1/2 p-4">
    <div class="flex relative ">
      <img alt="gallery" class="absolute inset-0 w-full h-full object-cover object-center" src="{image.img}">
      <div class="px-10 py-20 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
        <h1 class="title-font text-lg font-medium text-gray-900 mb-3">{image.name}</h1>
        <p class="leading-relaxed">{image.position}</p>
      </div>
    </div>
  </div>
  {/each} -->
<script>
  export let galleries;
</script>

{#each galleries as image}
  <div
    class="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-90 max-w-xs bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mx-auto my-4"
    data-aos="fade-up"
    data-aos-duration="{image.id}00"
  >
    <img class="w-full h-56 " src={image.img} alt="avatar" />

    <div class="py-5 text-center">
      <!-- svelte-ignore a11y-invalid-attribute -->
      <a href="#" class="block text-xl text-gray-900  font-bold">{image.name}</a
      >
      <p class="text-sm font-medium text-red-900 ">
        {image.position}
      </p>

      <p class="text-sm font-medium text-red-900">{image.email}</p>
      <p class="text-sm font-medium text-red-900">{image.tel}</p>
    </div>
  </div>
{/each}
