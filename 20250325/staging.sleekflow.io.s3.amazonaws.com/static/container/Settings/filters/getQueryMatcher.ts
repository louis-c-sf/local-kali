import { deburr, escapeRegExp } from "lodash-es";
import { curry } from "ramda";

export const getQueryMatcher = curry(
  <T extends any>(serialize: (data: T) => string, query: string) => {
    const strippedQuery = deburr(query);

    return (data: T) => {
      const textSpaced = serialize(data);
      const textNonSpaced = textSpaced.replace(/\s+/g, "");
      const reNonSpaced = new RegExp(
        escapeRegExp(strippedQuery.replace(/\s/g, "")),
        "ig"
      );

      return reNonSpaced.test(deburr(textNonSpaced));
    };
  }
);

export const parseQueryMatches = (
  query: string,
  text: string,
  limit?: number
) => {
  const strippedQuery = deburr(query);
  const searchPart = escapeRegExp(strippedQuery);
  const re = new RegExp(`(.+)?(${searchPart})(.+)?`, "i");
  const matches = text.match(re);
  if (matches === null) {
    return ["", "", ""];
  }
  const [_, before, fragment, after] = Array.from(matches);
  const beforeUntrimmed = before ?? "";
  const afterUntrimmed = after ?? "";
  if (limit === undefined) {
    return [beforeUntrimmed, fragment, afterUntrimmed];
  }
  if (limit === 0) {
    return ["", fragment, ""];
  }
  const afterTrimmed = afterUntrimmed.substr(0, limit + 1);
  const beforeTrimmed = beforeUntrimmed.substr(-limit - 1, limit + 1);

  return [beforeTrimmed, fragment, afterTrimmed];
};
