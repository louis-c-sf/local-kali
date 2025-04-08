import insertText from "insert-text-at-cursor";

export function pasteHtmlAtCaret(html: string, element: HTMLTextAreaElement) {
  insertText(element, html);
}
