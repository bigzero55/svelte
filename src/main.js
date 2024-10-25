import "./app.css";
import App from "./App.svelte";
import "whatsapp-editor/styles/prosemirror.css";
import "whatsapp-editor/styles/whatsapp-editor.css";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
