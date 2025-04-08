export function htmlEntities(value: any): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/<br>/gi, "\\n");
}
