<script>
  import Toastify from 'toastify-js'
	import Navbar from './components/Navbar.svelte';
  import WhatsAppInput from "./components/WhatsappTextEditor2.svelte";
  let messageText = ""; // This will be bound to the input value
let number = '';

function formatPhoneNumber(input) {
  // Remove any non-digit characters
  let cleaned = input.replace(/\D/g, '');
  
  // Handle numbers starting with '0'
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // Handle numbers starting with '+'
  if (input.startsWith('+')) {
    cleaned = cleaned;
  }
  
  // Handle numbers starting with '62'
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

$: number = formatPhoneNumber(number);

 
let showModal = false;
    let apiKey = '';
    
    // Load API key from localStorage on component mount
    import { onMount } from 'svelte';
    
    onMount(() => {
      const savedApiKey = localStorage.getItem('apiKey');
      if (savedApiKey) {
        apiKey = savedApiKey;
      }
    });
  
    function saveApiKey() {
      localStorage.setItem('apiKey', apiKey);
      showModal = false;
    }

    async function handleSend() {
      console.log('Sending message:', messageText, number);
      
      try {
        const response = await fetch('https://api.dripsender.id/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
           
          },
          body: JSON.stringify({
            api_key: apiKey,
            phone: formatPhoneNumber(number),
            text: messageText,
          })
        });
        
       
        console.log(response);
        if (response.ok) {
          
        
            messageText = '';
            number = '';
            Toastify({
              text: "Message sent successfully!",
              duration: 3000,
              gravity: "top",
              position: "right",
              backgroundColor: "#4CAF50",
            }).showToast();
          
        } else {
          console.error('Error sending message:', response.statusText);
          Toastify({
            text: "Failed to send message: " + response.statusText,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#F44336",
          }).showToast();
        }
      } catch (error) {
        console.error('Error sending message:', error);
        Toastify({
          text: "Error sending message: " + error.message,
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#F44336",
        }).showToast();
      }
    }</script>

<main>
  <Navbar />
  <div class=" container mx-auto h-screen flex flex-col items-center justify-center p-5">
    <div class="form-control w-full mb-4">
          <label class="input-group">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <input type="tel" placeholder="Enter phone number" class="input input-bordered w-full bg-white" bind:value={number} />
          </label>
        </div>
    
    <div class="flex gap-4 w-full">
      <div class="flex-1">
        <WhatsAppInput bind:value={messageText} />
      </div>
      <div class="self-end">
        <button class='btn btn-circle btn-neutral' on:click={handleSend}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>    
    </div>
  </div>
  

  
  <!-- Modal -->
  <input type="checkbox" id="api-key-modal" class="modal-toggle" bind:checked={showModal} />
  <div class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Set API Key</h3>
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Enter your API Key</span>
        </label>
        <input 
          type="password" 
          placeholder={apiKey ? '********' : 'Enter API Key'} 
          class="input input-bordered w-full" 
          bind:value={apiKey}
        />
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" on:click={() => showModal = false}>Cancel</button>
        <button class="btn btn-primary" on:click={saveApiKey}>Save</button>
      </div>
    </div>
  </div>
  
</main>
