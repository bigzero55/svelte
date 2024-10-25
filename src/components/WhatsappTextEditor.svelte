<script>
  import { onMount, createEventDispatcher } from "svelte";
  import "emoji-picker-element";
  import "whatsapp-editor/styles/prosemirror.css";
  import "whatsapp-editor/styles/whatsapp-editor.css";
  import { WhatsAppEditor } from "whatsapp-editor";

  const dispatch = createEventDispatcher();

  let editorContainer;
  let editor;
  let showEmojiPicker = false;
  let pickerPosition = "top";
  let isFocused = false;
  let internalValue = "";

  // Props untuk kustomisasi
  export let value = "";

  export let borderColorFocus = "#00A8E8";
  export let borderColorBlur = "#808080";

  // Two-way binding untuk value
  $: if (value !== internalValue) {
    updateEditorContent(value);
  }

  // Format teks sesuai aturan WhatsApp
  function formatWhatsAppText(text) {
    return (
      text
        // Format bold
        .replace(/\*([\s]*)(.*?)([\s]*)\*/g, " *$2* ")
        // Format italic
        .replace(/_([\s]*)(.*?)([\s]*?)_/g, " _$2_ ")
        // Format strikethrough
        .replace(/~([\s]*)(.*?)([\s]*)~/g, " ~$2~ ")
        // Format monospace
        .replace(/```([\s]*)(.*?)([\s]*)```/g, " ```$2``` ")
        // Bersihkan spasi berlebih
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const formattedText = formatWhatsAppText(text);

    const { state, dispatch: editorDispatch } = editor;
    const tr = state.tr.insertText(formattedText, state.selection.from);
    editorDispatch(tr);

    handleChange();
  }
  function updateEditorContent(newValue) {
    if (editor && newValue !== internalValue) {
      const formattedValue = formatWhatsAppText(newValue);
      const { state, dispatch: editorDispatch } = editor;
      const tr = state.tr.delete(0, state.doc.content.size);
      tr.insertText(formattedValue, 0);
      editorDispatch(tr);
      internalValue = formattedValue;
    }
  }

  onMount(() => {
    // Initialize WhatsApp editor
    editor = new WhatsAppEditor(
      {
        position: "TOP",
        distance: 10,
      },
      editorContainer
    );

    // Set initial value
    if (value) {
      updateEditorContent(value);
    }

    // Setup content change handler
    editor.dom.addEventListener("input", handleChange);
    editor.dom.addEventListener("focus", () => handleFocusChange(true));
    editor.dom.addEventListener("blur", () => handleFocusChange(false));
    editor.dom.addEventListener("paste", handlePaste);

    // Setup emoji picker
    const pickerElement = document.querySelector("emoji-picker");
    if (pickerElement) {
      pickerElement.addEventListener("emoji-click", handleEmojiSelect);
    }

    return () => {
      editor.dom.removeEventListener("input", handleChange);
      editor.dom.addEventListener("paste", handlePaste);
      editor.dom.removeEventListener("focus", () => handleFocusChange(true));
      editor.dom.removeEventListener("blur", () => handleFocusChange(false));
      if (pickerElement) {
        pickerElement.removeEventListener("emoji-click", handleEmojiSelect);
      }
    };
  });

  function handleChange() {
    const newValue = formatWhatsAppText(getFormattedText());
    if (newValue !== internalValue) {
      internalValue = newValue;
      value = newValue;
      dispatch("change", { value: newValue });
    }
  }

  function handleFocusChange(focused) {
    isFocused = focused;
    dispatch(focused ? "focus" : "blur");
  }

  function handleEmojiSelect(event) {
    if (editor) {
      const { unicode } = event.detail;
      const { state } = editor;
      const tr = state.tr.insertText(unicode, state.selection.from);
      editor.dispatch(tr);
      showEmojiPicker = false;
      handleChange();
    }
  }

  function calculatePickerPosition(buttonElement) {
    if (!buttonElement) return;
    const viewportHeight = window.innerHeight;
    const buttonRect = buttonElement.getBoundingClientRect();
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const pickerHeight = 360;
    pickerPosition =
      spaceBelow < pickerHeight && spaceAbove > pickerHeight ? "top" : "bottom";
  }

  function toggleEmojiPicker(event) {
    calculatePickerPosition(event.target);
    showEmojiPicker = !showEmojiPicker;
  }

  // Public methods
  export function getFormattedText() {
    return editor?.getWhatsappMarkdown() || "";
  }

  export function getText() {
    return editor?.dom.innerText || "";
  }

  export function setText(text) {
    if (editor) {
      updateEditorContent(text);
      handleChange();
    }
  }

  export function focus() {
    editor?.focus();
  }

  export function blur() {
    editor?.dom.blur();
  }

  function handleClickOutside(event) {
    handleChange();
    const emojiContainer = event.target.closest(".emoji-picker-container");
    const emojiButton = event.target.closest(".emoji-button");

    if (!emojiContainer && !emojiButton && showEmojiPicker) {
      showEmojiPicker = false;
    }
  }

  $: if (showEmojiPicker) {
    setTimeout(() => {
      const pickerElement = document.querySelector("emoji-picker");
      if (pickerElement) {
        pickerElement.addEventListener("emoji-click", handleEmojiSelect);
      }
    }, 0);
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div
  class="message-input-container"
  class:focused={isFocused}
  style="--border-color-focus: {borderColorFocus}; --border-color-blur: {borderColorBlur};"
>
  <div class="editor-wrapper" bind:this={editorContainer}></div>

  <div class="emoji-section">
    <button
      class="emoji-button"
      on:click={toggleEmojiPicker}
      type="button"
      aria-label="Insert emoji"
    >
      😊
    </button>

    {#if showEmojiPicker}
      <div
        class="emoji-picker-container"
        class:top={pickerPosition === "top"}
        class:bottom={pickerPosition === "bottom"}
      >
        <emoji-picker></emoji-picker>
      </div>
    {/if}
  </div>
</div>

<style>
  .message-input-container {
    position: relative;
    width: 90%;
    min-height: 50px;
    border: 0.5px solid var(--border-color-blur);
    border-radius: 10px;
    padding: 8px 45px 8px 12px;
    background: white;
    transition: border-color 0.2s ease;
  }

  .message-input-container.focused {
    border-color: var(--border-color-focus);
  }

  .editor-wrapper {
    width: 100%;
    min-height: 24px;
  }

  .editor-wrapper :global(.ProseMirror) {
    min-height: 24px;
    outline: none;
    line-height: 1.5;
    font-size: 15px;
    padding-right: 5px;
  }

  .editor-wrapper :global(.ProseMirror p) {
    margin: 0;
  }

  .emoji-section {
    position: absolute;
    right: 8px;
    bottom: 8px;
  }

  .emoji-button {
    background: none;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    width: 32px;
    height: 32px;
  }

  .emoji-button:hover {
    background-color: #f0f0f0;
  }

  .emoji-picker-container {
    position: absolute;
    z-index: 1000;
  }

  .emoji-picker-container.top {
    bottom: calc(100% + 10px);
    right: 0;
  }

  .emoji-picker-container.bottom {
    top: calc(100% + 10px);
    right: 0;
  }

  :global(emoji-picker) {
    --background: white;
    --category-emoji-size: 1.25rem;
    --emoji-size: 1.25rem;
    --indicator-color: var(--border-color-focus);
    --border-radius: 8px;
    --border-size: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    height: 350px;
  }
</style>
