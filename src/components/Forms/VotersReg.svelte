<div class="container px-5 py-10 mx-auto">
    <div class="flex flex-col text-justify w-full mb-12">
      <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Register as a voter</h1>
      <section class="text-gray-600 body-font">
          <div class="container flex flex-wrap px-5 py-5 mx-auto items-center">
            <div class="md:w-1/2 md:pr-12 md:py-4 md:border-r md:border-b-0 mb-10 md:mb-0 pb-10 border-b border-gray-200">
              <p class="leading-relaxed text-base mb-3">All fields marked <span class="text-red-500">*</span> are all important</p>
              <ul class="list-disc">
                  <li class="mb-4 text-sm font-light">Please note that Full Name must contain at least First and Last Name preferably, a third name may be added.</li>
                  <li class="mb-4 text-sm font-light">Please provide at least a phone number and/or email address</li>
              </ul>
            </div>
            <div class="flex flex-col md:w-1/2 md:pl-12">
              <h2 class="title-font font-semibold text-gray-800 tracking-wider text-sm mb-3">Upload Profile Picture</h2>
              <div>
                  
                  <div class="mt-2 flex items-center">
                    <input type="file"  name="ppics" id="fileupload" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
                    
                  </div>
                </div>
            </div>
          </div>
        </section>
    </div>
    <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-end">

<div class="relative flex-grow w-full">
<!-- Hello Side one -->
<div class="relative mb-4">
  <label for="fullname" class="leading-7 text-sm text-gray-600">Full Name <span class="text-red-500">*</span></label>
  <input type="text" id="fullname" name="fullname" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
</div>
<div class="relative mb-4">
  <label for="password" class="leading-7 text-sm text-gray-600">Password <span class="text-red-500">*</span></label>
  <input type="text" id="password" name="password" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
</div>
<div class="relative mb-4">
  <label for="phonenumber" class="leading-7 text-sm text-gray-600">Telephone Number <span class="text-red-500">*</span></label>
  <input type="text" id="phonenumber" name="phonenumber" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
</div>
<div class="relative mb-4">
  <label for="gender" class="leading-7 text-sm text-gray-600">Gender<span class="text-red-500">*</span></label>
  <select id="gender" name="gender" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out">
      <option value="male"> Male</option>
      <option value="female"> Female</option>
  </select>
</div>
<div class="relative mb-4">
  <label for="state" class="leading-7 text-sm text-gray-600">State<span class="text-red-500">*</span></label>
  <select id="state" name="state" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out">
      <option value=""> select state</option>
     
  </select>
</div>
<div class="relative mb-4">
  <label for="ward" class="leading-7 text-sm text-gray-600">Ward<span class="text-red-500">*</span></label>
  <select id="ward" name="ward" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out">
      <option value=""> select ward</option>
  </select>
</div>

  
  
</div>

<div class="relative flex-grow w-full">
       <!-- Hello Side Two -->
       <div class="relative mb-4">
          <label for="pvc_number" class="leading-7 text-sm text-gray-600">PVC Number <span class="text-red-500"> *</span> </label>
          <input type="pvc_number" id="pvc_number" name="pvc_number" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
       
        <div class="relative mb-4">
          <label for="confirm_password" class="leading-7 text-sm text-gray-600">Confirm Password <span class="text-red-500"> *</span></label>
          <input type="confirm_password" id="confirm_password" name="confirm_password" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div> 
        <div class="relative mb-4">
          <label for="email" class="leading-7 text-sm text-gray-600">Email Address <span class="text-red-500"> *</span></label>
          <input type="email" id="email" name="email" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div> 
        <div class="relative mb-4">
          <label for="dob" class="leading-7 text-sm text-gray-600">Date of Birth <span class="text-red-500"> *</span></label>
          <input type="date" id="dob" name="dob" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div> 
        <div class="relative mb-4">
          <label for="lga" class="leading-7 text-sm text-gray-600">Local Goverment Area <span class="text-red-500"> *</span></label>
          <select id="lga" name="lga" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out">
              <option value=""> select LGA</option>
             
          </select>
        </div> 
        <div class="relative mb-4">
          <label for="voting_unit" class="leading-7 text-sm text-gray-600">Voting Unit <span class="text-red-500"> *</span></label>
          <select id="voting_unit" name="voting_unit" class="w-full bg-white rounded border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out">
              <option value=""> select voting unit</option>
             
          </select>
        </div> 
      </div>
      
    </div>
    <div class="container mx-auto w-32" ><button class="text-white bg-red-500 border-0 py-2 px-8 focus:outline-none hover:bg-red-600 rounded text-lg mx-auto my-3">Sign Up</button> <br>
      <p class="text-sm text-center"> Already have an account? <a href="/login" class="text-blue-500">Sign in</a> </p>
    </div>
    
  </div>