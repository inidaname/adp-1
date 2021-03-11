<script>
  import MissionBar from "../components/Mission_Panel/Mission_Bar.svelte";
  import NewsBar from "../components/News_Panel/News_Bar.svelte";
  import Hero from "../components/Hero/Hero.svelte";
</script>

<svelte:head>
  <title>About ADP</title>
</svelte:head>
<Hero>
  <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
    <img
      class="object-cover object-center rounded mb-6 sm:mb-0"
      alt="hero"
      src="../office.jpg"
    />
  </div>
  <div
    class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center py-24"
    slot="hero-texts"
  >
    <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-red-500">
      About ADP
    </h1>
    <p class="mb-8 leading-relaxed text-lg sm:text-2xl">
      TTHE ACTION DEMOCRATIC PARTY (ADP) is a registered political party in
      Nigeria. The party was formed and established in 2017 to deal with the
      lapses that have over the years been complained about by Nigerians because
      the tenets of true democracy have been lost thereby giving some select few
      a godlike image where political parties are being dictated upon by the few
      and powerful.
    </p>
    <div class="flex justify-center">
      <a
        href="/register"
        class="inline-flex text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded text-lg"
        >Join Us!</a
      >
    </div>
  </div>
</Hero>
<section class="container mx-auto sm:text-2xl">
  <div class="p-4">
    <h2
      class=" py-5 font-medium title-font sm:text-4xl text-2xl text-blue-900 text-left "
    >
      ADP's Three Points Agenda
    </h2>
    <p class="font-medium py-2">In the ADP, the three point agenda are:</p>

    <ul class="list-disc px-7">
      <li>All Inclusiveness</li>
      <li>Democracy Empowerment of the Youth and Women</li>
      <li>Party Supremacy</li>
    </ul>
    <p class="py-4">
      The keyword is democracy and this democracy is the same that is
      universally accepted and practiced all over; no one man or woman is
      greater than the party or one's view much better than the other member's
      when that view has not been examined and discussed. The ADP is the
      Nigeria's credible alternative with modern thinking and applications in
      its manifesto.
    </p>
    <p class="py-4">
      ADP is the party for every Nigerian who believes that the traditional and
      archaic methods of attending to the Nigerian quagmire should be revisited
      . ADP is the political party that is building a better future for a more
      unified Nigeria.
    </p>
  </div>
</section>

<MissionBar />

<!-- Picture update -->

<!-- ./picture update -->
<NewsBar />
