<script>
  const news= [
    {
      title:"ADP presidential candidate says oil money should be used to develop country",
      body:"Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
      img:"../newsImg1.jpg",
      footer:"Read more",
      url:"https://www.facebook.com"
  },
    {
      title:"ADP presidential candidate says oil money should be used to develop country",
      body:"Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
      img:"../newsImg1.jpg",
      footer:"Read more",
      url:"https://www.facebook.com"
  },
    {
      title:"ADP presidential candidate says oil money should be used to develop country",
      body:"Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
      img:"../newsImg1.jpg",
      footer:"Read more",
      url:"https://www.facebook.com"
  },
  ]
  import CardWithImage  from "../Card/CardImage.svelte"
</script>
<section class="text-gray-600 body-font">
    <div class="container px-5 py-10 mx-auto">
      <div class="flex flex-col text-center w-full mb-10">
        <h1 class="sm:text-3xl text-2xl font-medium title-font text-gray-900">Latest News</h1>
      </div>
      <div class="flex flex-wrap -m-4">
       <CardWithImage  properties={news}/>
      </div>
    </div>
  </section>