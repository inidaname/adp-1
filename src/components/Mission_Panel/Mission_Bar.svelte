<script>
  
    import CardWithImage from "../Card/CardImage.svelte"
 
  const data = [ 
  {
      title:"Mission",
      body:"To provide Responsive leadership that is transparent and accountable to the people.",
      footer:"",
      img:"../rocketicon.png"
     
  },
    {
      title:"Vision",
      body:"A Secure, Stable and Egalitarian Nigeria where Democracy and Rule of Law Reign.",
      footer:"",
      img:"../sendicon.png"
      
  },
    
]
</script>
<section class="text-gray-600 body-font">
    <div class="container px-5 py-10 mx-auto">
      <h1 class="sm:text-3xl text-2xl font-medium title-font text-center text-gray-900 mb-10">
          Objectives
      </h1>
      <div class="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
        <CardWithImage properties={data}/>
      </div>
    </div>
  </section>
  