export function parseWhatsappTemplateVars(input: string) {
  const matches = input.matchAll(/(\{\{\d+\}\})/gi);
  return Array.from(matches).map((m) => m[1]);
}
