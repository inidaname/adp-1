<script>
const biographies = [
    {
        name:"Engr. Yabagi Y. Sani",
        image:"../nChairman.jpg",
        position:"ADP Presidential Candidate",
        bio:"Engr. Yabagi Yusuf Sani is one of the leading lights in Nigerian Politics and Corporate Business World. Born on July 1, 1954 Yabagi Yusuf Sani attended East Primary School, Bida and Technical Secondary School, Kotangora, Niger State, Nigeria. He later proceeded to the Institute of Technology, New York, USA. Yabagi is also a product of Colombia University, New York, USA where he studied Industrial and Management Engineering with emphasis in Operations Research. Yabagi also attended an Executive Management Program in Havard Business School in Boston Massachusetts. Since his graduation and completion of the mandatory one - year National Youth Service (NYSC) in Nigeria, Engr. Yabagi has been a key player in Nigeria's Oil and Gas sector where he has helped the Government of Nigeria in the development of innovative schemes and strategies to block leakages in the ever porous sector.  "
    }, 
    {
        name:"Martin Kunle Olateru-Olagbegi",
        image:"../nChairman.jpg",
        position:"ADP Vice Presidential Candidate",
        bio:"Martin Kunle Olateru-Olagbegi, was born in Owo, Ondo State, Nigeria. Educated at Owo Government School and Olivet Baptist High School in Oyo, Martin's exceptional academic and athletic accomplishments opened numerous doors for him. As a teenager, Martin received a variety of admission and scholarship offers from colleges and universities throughout the United States, and ultimately decided to study architecture at Prairie View A & M University in Texas As a degreed architect, Martin quickly secured a position at ATTI in Baltimore, Maryland where he worked for two years before moving to Atlanta in 1986. For the next ten years, he served as the architectural program coordinator for the City of Atlanta overseeing complex projects such as the municipal court, firehouses, the city jail, traffic court, and the City Halt Annex. He had oversight of twenty-seven buildings, numerous employees, and an operational budget of over a $100,000,000. In 1996, Martin, recognized for his acute business acumen, founded Nite, Inc., a design, construction and environmental management firm where he served as president and chief executive officer. Headquartered in Atlanta, Georgia, Nile, Inc, had offices in Corpus Christi, Texas and Barnwell, South Carolina. Other locations included Alabama, Mississippi, Kissmmee, Florida and Washington, D.C. These outfits provided viable employment opportunities to numerous individuals, subcontractors and suppliers throughout the northeast and southeast regions of the United States."
    }, 


]
</script>
<style>
    
</style>
<section class="text-gray-600 body-font overflow-hidden">
    <div class="container px-5 py-24 mx-auto">
      <div class="-my-8 divide-y-2 divide-gray-100">
        {#each biographies as bio}
        <div class="py-8 flex flex-wrap md:flex-nowrap">
          <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
            <span class="font-semibold title-font text-gray-700"> <img src="{bio.image}" alt=""> </span>
         
          </div>
          <div class="md:flex-grow">
            <h1 class="text-2xl font-medium text-red-900 title-font mb-2">{bio.name}</h1>
            <h3 class="text-2xl font-medium text-blue-900 title-font mb-2">{bio.position}</h3>
            <p class="leading-relaxed">{bio.bio}</p>
            <!-- svelte-ignore a11y-missing-attribute -->
           
          </div>
        </div>
       {/each}
      </div>
    </div>
  </section>