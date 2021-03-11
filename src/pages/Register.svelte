<script>
  import MemberForm from "../components/Forms/MemberForm.svelte";
  import SupporterForm from "../components/Forms/SupporterForm.svelte";

  const options = [
    { name: "Suppoters Form", component: SupporterForm },
    { name: "Members Form", component: MemberForm },
  ];
  let selected = options[0];
</script>

<svelte:head>
  <title>Sign up</title>
</svelte:head>
<section class="text-gray-600 body-font">
  <div class="flex items-center container mx-auto w-full">
    <select
      class="sm:text-xl text-md mx-4 mt-20 w-1/2 bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-1 leading-8 transition-colors duration-200 ease-in-out "
      bind:value={selected}
    >
      {#each options as opt}
        <option value={opt}>{opt.name}</option>
      {/each}
    </select>
  </div>
  <svelte:component this={selected.component} />
</section>
