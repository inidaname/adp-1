<style>

</style>

<script>
    import GalleryBlock from "../components/Gallery/Gallery_Block.svelte";
import Hero from "../components/Hero/Hero.svelte";
   

</script>

<Hero>
    <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" slot="hero-image">
        <img class="object-cover object-center rounded" alt="hero" src="../nChairman.jpg">
      </div> 


      <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" slot="hero-texts">
        <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-red-500">The National Chairman</h1>
        
        <p class="mb-8 leading-relaxed">The role of the Party's National Chairman is often different from a party leader. The duties of the chairman/chairperson are typically concerned with the party membership as a whole and the activities of the party organization. Chairman often play important roles in strategies to recruit and retain members in campaign fundersing and in internal party governance, where they may serve as member of or preside over a governing board or council.</p>
       
      </div> 
</Hero>
<GalleryBlock>
    <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900" slot="gallery-heading">Board of Trustee Members</h1>
    <p class="lg:w-2/3 mx-auto leading-relaxed text-base" slot="gallery-subtitle">Whatever cardigan tote bag tumblr The ADP Board of Trustee (BoT) is a constitutionally mandated body with the Action Democratic Party of Nigeria that provides advice and cousel to the leadership of the National Working Committee and stuff. It is regarded by the party's constitution as the conscience of the party.</p> 

  
</GalleryBlock>

<GalleryBlock>
    <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-red-900" slot="gallery-heading">National Working Committee Members</h1>
    <p class="lg:w-2/3 mx-auto leading-relaxed text-base" slot="gallery-subtitle">The ADP National Working Committee Members also known as NWC, is the executive committee of the Action Democratic Party in Nigeria. The NWC is composed of 12 party members, all of which are elected to a four year term at the party's National Convention, The NWC is headed by the Chairman who also functions as the party's National Chairman. The NWC has the responsibility for the day-to-day governance of the party as well as oversight of its national activities.</p> 

  
</GalleryBlock>