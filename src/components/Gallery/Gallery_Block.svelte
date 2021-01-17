<script>
 import ImageCard from "../Card/ImageCard.svelte";
    const galleries = [
        {
       img:"../blank.jpg", position:"Leader, ADP",
            name:"No image"
        },
        {
            img:"../blank.jpg", position:"Leader, ADP",
            name:"No image"
        },
        {
            img:"../blank.jpg", position:"Leader, ADP",
            name:"No image"
        },
        {
            img:"../blank.jpg", position:"Leader, ADP",
            name:"No image"
        },
        {
            img:"../blank.jpg", position:"Leader, ADP",
            name:"No image"
        },
        {
            img:"../blank.jpg", position:"Leader, ADP",
            name:"No image"
        },
    ]
      </script>
<section class="text-gray-600 body-font">
    <div class="container px-5 py-20 mx-auto">
      <div class="flex flex-col text-center w-full mb-20">
          <slot name="gallery-heading"></slot>
          <slot name="gallery-subtitle"></slot>
          
        <!-- <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Board of Trustee Members</h1>
        <p class="lg:w-2/3 mx-auto leading-relaxed text-base">Whatever cardigan tote bag tumblr The ADP Board of Trustee (BoT) is a constitutionally mandated body with the Action Democratic Party of Nigeria that provides advice and cousel to the leadership of the National Working Committee and stuff. It is regarded by the party's constitution as the conscience of the party.</p> -->
      </div>
      <div class="flex flex-wrap -m-4 justify-center">
       <ImageCard {galleries}/>
      </div>
    </div>
  </section>
  
  <style>

  </style>