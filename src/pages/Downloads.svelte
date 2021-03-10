<script>
  let downloadFiles = [
    {
      name: "Position_on_IPAC.docx",
      link: "../documents/Position_on_IPAC.docx",
    },
    {
      name: "2020-12-11_175659.pdf",
      link: "../documents/2020-12-11_175659.pdf",
    },
    {
      name: "PRESS_STATEMENT_ON _OGUN_GOVERNOR_February.docx",
      link: "../documents/PRESS_STATEMENT_ON _OGUN_GOVERNOR_February.docx",
    },
    {
      name: "The_appointment_of_Okonjo_Ngozi_Nwaela.docx",
      link: "../documents/The_appointment_of_Okonjo_Ngozi_Nwaela.docx",
    },
    {
      name: "The_editor_rejoinder.docx",
      link: "../documents/The_editor_rejoinder.docx",
    },
    {
      name: "Towards_2023_Should_the_North_Central_Still_be_Left_Out.docx",
      link:
        "../documents/Towards_2023_Should_the_North_Central_Still_be_Left_Out.docx",
    },
    {
      name: "MANIFESTO_Action_Democratic_Party.pdf",
      link: "../documents/MANIFESTO_Action_Democratic_Party.pdf",
    },
    {
      name: "The_Constitution_of_the_Action_Democratic_Party.pdf",
      link: "../documents/The_Constitution_of_the_Action_Democratic_Party.pdf",
    },
  ];
</script>

<div class="p-0 mx-auto container my-10   min-h-screen ">
  <section class="bg-white dark:bg-gray-800">
    <div class="container px-6 py-8 mx-auto">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each downloadFiles as file}
          <div>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              /></svg
            >
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              {file.name}
            </p>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              <a
                href={file.link}
                class="inline-flex text-white text-xs bg-red-500 border-0 py-1 px-3 md:py-2 md:px-6 focus:outline-none hover:bg-red-600 rounded md:text-lg lg:mt-3"
                target="_blank"
                download
              >
                Download file
              </a>
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>
