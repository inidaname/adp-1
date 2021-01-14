<script> 
import Hero from "./components/Hero/Hero.svelte";
import Footer from "./components/Footer/Footer.svelte"
import NewsBar from "./components/News_Panel/News_Bar.svelte"
import MissionBar from "./components/Mission_Panel/Mission_Bar.svelte";
import CardWithImage from "./components/Card/CardImage.svelte";
import CTAForm from "./components/Forms/CTA_Form.svelte";
import SideReg from "./components/Forms/SideRegForm.svelte";

const data = [ 
  {
      title:"Fact Number One",
      body:"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
      footer:"Learn more"
  },
    {
      title:"Fact Number Two",
      body:"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
      footer:"Learn more"
  },
    {
      title:"Fact Number Three",
      body:"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
      footer:"Learn more"
  },
    {
      title:"Fact Number Four",
      body:"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Totam repudiandae doloribus magni ratione accusamus accusantium quas odio veritatis dignissimos porro.",
      footer:"Learn more"
  },
]
    </script>
    
     <main>
       
   <Hero />
   <section class="text-gray-600 body-font">
    <div class="container mx-auto px-5 py-4 mx-auto flex flex-wrap">
      <h1 class="py-4 text-lg font-medium title-font sm:text-3xl text-2xl ">Some facts...</h1>
      <div class="flex flex-wrap -m-4">
        <CardWithImage properties={data} />
      </div>
    </div>
  </section>

  <section class="text-gray-600 body-font">
    <div class="container px-5 py-24 mx-auto flex flex-wrap">
      <h2 class="sm:text-3xl text-2xl text-red-900 font-medium title-font mb-10 md:w-2/5">I’ll Restore The Pride, Economy Of Nigeria
        <br>  - YY Sani</h2>
      <div class="md:w-3/5 md:pl-6">
        <p class="leading-relaxed text-base">Engr. Yabagi Yusuf Sani (YY Sani) is the presidential candidate of the Action Democratic Party (ADP) in the 2019 general elections. In this interview conducted during a meeting of all the candidates of the party held at the ADP National Secretariat in Abuja on January 9, he speaks on the necessity of the meeting, why Nigeria has become a laughing...</p>
        <div class="flex md:mt-4 mt-6">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="text-blue-500 inline-flex items-center ml-4">Learn More
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
  <!-- Carousel Of Image -->



  <!-- ./Carousel Of Image -->
  
 <!-- From the Chairman's Desk -->
<section class="text-gray-600 body-font overflow-hidden">
  <div class="container px-5 py-4 mx-auto">
    <div class="lg:w-4/5 mx-auto flex flex-wrap p-2">
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img alt="Chairman's photo" class="lg:w-1/2 w-full lg:h-auto h-64  rounded" src="../nChairman.jpg"/>
      <div class="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
        
        <h1 class="text-red-900 text-3xl title-font font-medium mb-1">From the Chairman's Desk</h1>
        <div class="flex mb-4">
        </div>
        <p class="leading-relaxed">The National Chairman of the Action Democratic Party (ADP), Engr. Yabagi Sani, spoke with Press men in Abuja. He expressed dissatisfaction with the way the economy of the country was being run, insisting that the interest of the masses do not feature in the decision made by the ruling party...
        </p>
        
          </div>
        </div>
       
    
  </div>
</section>

  <MissionBar />
<!-- <CTAForm /> -->
<SideReg />

  <NewsBar />
    </main>
    <Footer />
    
    <style>
    
    </style>