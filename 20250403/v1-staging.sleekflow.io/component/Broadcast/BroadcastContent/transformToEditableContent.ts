export function transformToEditableContent(
  templateContent: string,
  templateParams: string[]
) {
  let content = templateContent;
  for (const i in templateParams) {
    let paramPlaceholder = `{{${templateParams[i].replace(/^@/, "")}}}`;
    let paramPattern = new RegExp(`\\{${i}\\}`, "g");
    content = content.replace(paramPattern, paramPlaceholder.toLowerCase());
  }
  return content;
}
