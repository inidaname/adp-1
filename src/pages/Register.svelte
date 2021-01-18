<script>
import CandidateReg from "../components/Forms/CandidateReg.svelte"
import VotersReg from "../components/Forms/VotersReg.svelte"


  const options = [
		{   name:"Voter Form", component: VotersReg },
		{ name:"Candidate Form",component: CandidateReg  },
  ];
  let selected = options[0];
</script>

  <section class="text-gray-600 body-font">
    <div class="flex items-center container mx-auto w-full">
      <select class="sm:text-2xl text-md px-2 mt-40 " bind:value={selected}>
          {#each options as opt }
            <option value="{opt}">{opt.name}</option>
          {/each}   
      </select> 
    </div>
    <svelte:component this={selected.component} />

  
  </section>