export function copyToClipboard(text: string) {
  const listener = (e: ClipboardEvent) => {
    if (!e.clipboardData) {
      return;
    }
    e.clipboardData.setData("text/plain", text);
    e.preventDefault();
    document.removeEventListener("copy", listener);
  };
  document.addEventListener("copy", listener);
  document.execCommand("copy");
}
