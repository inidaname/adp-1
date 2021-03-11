<script>
  import Hero from "../components/Hero/Hero.svelte";
  import Footer from "../components/Footer/Footer.svelte";
  import NewsBar from "../components/News_Panel/News_Bar.svelte";
  import MissionBar from "../components/Mission_Panel/Mission_Bar.svelte";
  import CardWithImage from "../components/Card/CardImage.svelte";
  import CTAForm from "../components/Forms/CTA_Form.svelte";
  import SideReg from "../components/Forms/SideRegForm.svelte";
  import Slides from "../components/Carousel/Carousel.svelte";
  import Card from "../components/Card/Card.svelte";

  // const data = [
  //   {
  //     title: "Fact Number One",
  //     body:
  //       "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
  //     footer: "Learn more",
  //     img: "../nChairman.jpg",
  //   },
  //   {
  //     title: "Fact Number Two",
  //     body:
  //       "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
  //     footer: "Learn more",
  //     img: "../nChairman.jpg",
  //   },
  //   {
  //     title: "Fact Number Three",
  //     body:
  //       "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
  //     footer: "Learn more",
  //     img: "../nChairman.jpg",
  //   },
  //   {
  //     title: "Fact Number Four",
  //     body:
  //       "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
  //     footer: "Learn more",
  //     img: "../nChairman.jpg",
  //   },
  // ];
</script>

<Slides />

<!-- <section class="text-gray-600 body-font py-20">
  <div class="container  px-5  mx-auto flex flex-wrap">
    <h1 class="py-4 font-medium title-font sm:text-4xl text-2xl text-blue-900 ">
      Some facts about Action Democratic Party
    </h1>
    <div class="flex flex-wrap justify-center -m-4 py-7 ">

      <Card properties={data} />
    </div>
  </div>
</section> -->
<svelte:head>
  <title>index</title>
</svelte:head>
<section class="text-gray-600 body-font py-24">
  <div class="container px-5  mx-auto flex flex-wrap items-center">
    <h2
      class="sm:text-3xl text-2xl text-red-900 font-medium title-font mb-10 md:w-2/5"
    >
      I’ll Restore The Pride, Economy Of Nigeria
      <br /> - YY Sani
    </h2>
    <div class="md:w-3/5 md:pl-6 shadow-lg rounded-md">
      <p class="leading-relaxed  md:text-2xl p-4 ">
        Engr. Yabagi Yusuf Sani (YY Sani) is the presidential candidate of the
        Action Democratic Party (ADP) in the 2019 general elections. In this
        interview conducted during a meeting of all the candidates of the party
        held at the ADP National Secretariat in Abuja on January 9, he speaks on
        the necessity of the meeting, why Nigeria has become a laughing...
      </p>
    </div>
  </div>
</section>
<!-- Carousel Of Image -->

<!-- ./Carousel Of Image -->

<!-- From the Chairman's Desk -->
<section class="text-gray-600 body-font overflow-hidden py-20">
  <div class="container px-5 mx-auto">
    <div class="lg:w-4/5 mx-auto flex flex-wrap p-0 items-center">
      <!-- svelte-ignore a11y-img-redundant-alt -->;
      <img
        alt="Chairman's photo"
        class="lg:w-96 w-full  md:w-1/2 rounded"
        src="../yychairman.jpg"
      />
      <div class="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
        <h1 class="text-red-900 text-3xl title-font font-medium mb-1">
          From the Chairman's Desk
        </h1>
        <div class="flex mb-4" />
        <p
          class="leading-relaxed md:text-2xl"
          data-aos="fade-up-left"
          data-aos-duration="1000"
        >
          The National Chairman of the Action Democratic Party (ADP), Engr.
          Yabagi Sani, spoke with Press men in Abuja. He expressed
          dissatisfaction with the way the economy of the country was being run,
          insisting that the interest of the masses do not feature in the
          decision made by the ruling party...
        </p>
      </div>
    </div>
  </div>
</section>

<MissionBar />
<!-- <CTAForm /> -->
<SideReg />

<NewsBar />

<style>
</style>
