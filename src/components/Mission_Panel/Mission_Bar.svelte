<script>
  import CardWithImage from "../Card/CardImage.svelte";

  const data = [
    {
      title: "Mission",
      body:
        "To provide Responsive leadership that is transparent and accountable to the people.",
      footer: "",
      img: "../rocketicon.png",
    },
    {
      title: "Vision",
      body:
        "A Secure, Stable and Egalitarian Nigeria where Democracy and Rule of Law Reign.",
      footer: "",
      img: "../sendicon.png",
    },
  ];
</script>

<section class="text-gray-600 body-font py-20">
  <div class="container px-5  mx-auto">
    <!-- <h1 class="sm:text-3xl text-2xl font-medium title-font text-center text-gray-900 mb-10">
          Objectives
      </h1> -->
    <h1
      class="py-5 font-medium title-font sm:text-4xl text-2xl text-blue-900 sm:text-right "
    >
      The Party's Mission and Vision
    </h1>
    <div
      class="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6"
    >
      <CardWithImage properties={data} />
    </div>
  </div>
</section>
