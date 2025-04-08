import { escapeRegExp, deburr } from "lodash-es";

export function parseMatchSentence(text: string, search: string) {
  const searchSafe = escapeRegExp(deburr(search));
  const regex = new RegExp(
    `(((([\.;!?]|^)\s*.*)(${searchSafe}).*?))(?=([.;!?]))([.;!?]+)?`,
    "im"
  );
  const matches = text.match(regex);
  if (!matches) {
    return text.match(new RegExp(searchSafe, "im")) ? text : undefined;
  }
  return `${matches[2].trim()}${matches[7] ?? ""}`;
}
