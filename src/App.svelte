<script>
  import WhatsAppInput from "./components/WhatsappTextEditor2.svelte";
  let messageText = ""; // This will be bound to the input value


</script>

<!-- Basic usage dengan two-way binding -->
<div class=" container mx-auto">
  <WhatsAppInput bind:value={messageText} />
</div>
<!-- Tampilkan preview dari nilai yang di-bind -->
<p class="font-bold text-2xl">
  Output String: {messageText}</p>