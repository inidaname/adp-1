<!-- <section class="text-gray-600 body-font">
    <div class="container px-5 py-24 mx-auto">
      <div class="flex flex-col text-center w-full mb-12">
        <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Donate</h1>
        <p class="lg:w-2/3 mx-auto leading-relaxed text-base">Help build a better Nigeria
            </p>
      </div>
      <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end">
        <div class="relative flex-grow w-full">
          <label for="full-name" class="leading-7 text-sm text-gray-600">Full Name</label>
          <input type="text" id="full-name" name="full-name" class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div>
        <div class="relative flex-grow w-full">
          <label for="email" class="leading-7 text-sm text-gray-600">Email</label>
          <input type="email" id="email" name="email" class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div>
        <div class="relative flex-grow w-full">
          <label for="email" class="leading-7 text-sm text-gray-600">Amount</label>
          <input type="email" id="email" name="email" class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div>
        <button class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Button</button>
      </div>
    </div>
  </section> -->


<script>
  import {Modal} from "renderless-svelte" 
</script>

  <Modal let:payload let:close>
    <!-- This example requires Tailwind CSS v2.0+ -->
 <div class="fixed z-10 inset-0 overflow-y-auto mt-6 ">
   <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
   
     <div class="fixed inset-0 transition-opacity" aria-hidden="true">
       <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
     </div>
 
     <!-- This element is to trick the browser into centering the modal contents. -->
     <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
    
     <div class="inline-block align-bottom  rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
       <div class="bg-white px-4 pt-5  pb-4 sm:p-6 sm:pb-4">
         <div class="sm:flex sm:items-start">
           <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
             <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
               Donate
             </h3>
             <div class="mt-2">
       <form>
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
               <div class="-mb-2">
                   <label class="text-sm text-gray-700 dark:text-gray-200" for="fullname">Full Name</label>
                   <input id="fullname" type="text" class="mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
               </div>
 
               <div class="-mb-2">
                   <label class="text-sm text-gray-700 dark:text-gray-200" for="emailAddress">Email Address</label>
                   <input id="emailAddress" type="email" class="mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
               </div>
 
               <div class="-mb-2">
                   <label class="text-sm text-gray-700 dark:text-gray-200" for="password">Purpose</label>
                   <input id="purpose" type="text" class="mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
               </div>
 
               <div class="-mb-2">
                   <label class="text-sm text-gray-700 dark:text-gray-200" for="amount">Amount</label>
                   <input id="amount" type="text" class="mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
               </div>
               <div class="-mb-2">
                   <label class="text-sm text-gray-700 dark:text-gray-200" for="amount">Phone Number</label>
                   <input id="phonenumber" type="text" class="mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded  px-4 block w-full focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring">
               </div>
           </div>

       </form>
  
             </div>
           </div>
         </div>
       </div>
       <div class="bg-gray-50 px-4 py-1 sm:px-6 sm:flex sm:flex-row-reverse">
         <button type="button" class=" text-xs w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
           Donate
         </button>
         <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" on:click={close}>
           Cancel
         </button>
       </div>
     </div>
   </div>
 </div>
 
 </Modal>
         