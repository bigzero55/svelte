<script>
  import WhatsAppInput from "./components/WhatsappTextEditor2.svelte";
  let messageText = ""; // This will be bound to the input value
</script>

<!-- Basic usage dengan two-way binding -->
<WhatsAppInput bind:value={messageText} />

<!-- Tampilkan preview dari nilai yang di-bind -->
<p>Output String: {messageText}</p>
