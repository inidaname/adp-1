<script>
  import ImageCard from "../Card/ImageCard.svelte";
  const galleries = [
    {
      img: "../fingesi.jpeg",
      position: "National Secretary",
      name: "Hon. Victor Fingesi",
      tel: "unavailable",
      email: "unavailable",
      id: 3,
    },
    {
      img: "../maricana.jpeg",
      position: "Acting National Publicity Secretary",
      name: "Marikana Stanley Ibiang",
      tel: "+2348033332963",
      email: "marikanaurp@gmail.com",
      id: 6,
    },

    {
      img: "../solomon.jpeg",
      position: "Leader, ADP",
      name: "Solomon Abraham Maichibi",
      tel: "+2348035332132 ",
      email: "cleanhandsventure@gmail.com",
      id: 9,
    },

    {
      img: "../pastor.jpeg",
      position: "National Treasurer",
      name: "Pastor Okey Udo",
      tel: "+2348033499059",
      email: "unavailable",
      id: 11,
    },
    {
      img: "../sam.jpeg",
      position: "National Welfare Secretary",
      name: " Hon. Sam Gyang",
      tel: "+2348034518232",
      email: "pamget1@gmail.com",
      id: 14,
    },
  ];
</script>

<section class="text-gray-600 body-font">
  <div class="container px-5 py-20 mx-auto">
    <div class="flex flex-col text-center w-full mb-20">
      <slot name="gallery-heading" />
      <slot name="gallery-subtitle" />

      <!-- <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Board of Trustee Members</h1>
        <p class="lg:w-2/3 mx-auto leading-relaxed text-base"> The ADP Board of Trustee (BoT) is a constitutionally mandated body with the Action Democratic Party of Nigeria that provides advice and cousel to the leadership of the National Working Committee and stuff. It is regarded by the party's constitution as the conscience of the party.</p> -->
    </div>
    <div class="flex flex-wrap -m-4 justify-center">
      <ImageCard {galleries} />
    </div>
  </div>
</section>

<style>
</style>
