<script>
  const news = [
    {
      title:
        "ADP presidential candidate says oil money should be used to develop country",
      body:
        "Mr Yabagi Sani, the Action Democratic Party (ADP) presidential candidate, has experessed the need to use Nigeria’s oil revenue to develop the nation. ",
      img: "../withkunle.jpeg",
      footer: "Read more",
      url:
        "https://medium.com/action-democratic-party/adp-presidential-candidate-says-oil-money-should-be-used-to-develop-country-b9d330ddf4b4",
      id: 3,
    },
    {
      title: "ADP Presidential Candidate, Sani Meet Obasanjo",
      body:
        "The Presidential candidate of the Action Democratic Party (ADP), met with the former President, Chief Olusegun Obasanjo on Wednesday, the meeting took place at the Presidential library in Ogun State capital city, Abeokuta. ",
      img: "../withobj.jpeg",
      footer: "Read more",
      url:
        "https://medium.com/action-democratic-party/2019-adp-presidential-candidate-sani-meet-obasanjo-f95602ef175b",
      id: 6,
    },
    {
      title:
        "ADP Presidential Candidate, Engr YY Sani Recognized Internationally",
      body:
        "United Nations honor Engr. Sani with the coveted UN Humanitarian Award in recognition of his contributions to the social, economic and political development in Africa . The historic event took place on Thursday 13th September 2018 at the UN Headquartrs in New York USA.",
      img: "../withwhyte.jpeg",
      footer: "Read more",
      url:
        "https://medium.com/action-democratic-party/pictorial-of-the-presidential-candidate-and-national-chairman-of-adp-engr-e30ecfce1079",
      id: 9,
    },
    {
      title: "ADP Plateau State Meeting",
      body:
        "ADP Plateau state meeting was held at junction hotel Jos South on 10/03/202. National officers of the party in attendance were: Hon Solomon Maichibi (Nat. Vice Chairman NC) Hon. Pam Ibrahim (Dir General Duties) Hon Sam Gyang (nat welfare sec.) others were Engr Damulak, Alphonsus Jibgwan, SWC, Local Govt. Chairmen, critical stakeholders, former candidates of the party in the last national elections. and valuable resolutions were passed at the end of the meeting",
      img: "../mlatest.jpeg",
      footer: "Read more",
      url: "#",
      id: 11,
    },
  ];
  import CardWithImage from "../Card/CardImage.svelte";
</script>

<section class="text-gray-600 body-font">
  <div class="container px-5 py-10 mx-auto">
    <div class="flex flex-col text-center w-full mb-10">
      <h1 class="sm:text-3xl text-2xl font-medium title-font text-blue-900">
        Latest News
      </h1>
    </div>
    <div class="flex flex-wrap -m-4">
      <CardWithImage properties={news} />
    </div>
  </div>
</section>
