import { DropdownItemProps } from "semantic-ui-react";
import { useMemo, useEffect, useState } from "react";
import { getQueryMatcher } from "container/Settings/filters/getQueryMatcher";
import { postWithExceptions } from "api/apiRequest";

export interface LangRow {
  language_iso_code: string;
  language_name: string;
  native_language_name: string;
}

const matchesQuery = getQueryMatcher(
  (row: LangRow) =>
    `${row.language_iso_code} ${row.language_name} ${row.native_language_name}`
);

const CACHE_TIMESTAMP = "Ecommerce.languages.cachedAt";
const CACHE_DATA = "Ecommerce.languages.data";
const TTL = 60 * 60 * 1000; // 1h

export function useLanguageChoices() {
  const [choicesCached, setChoicesCached] = useState<LangRow[]>([]);

  async function fetchChoices(): Promise<LangRow[]> {
    const data: { data: { languages: LangRow[] } } = await postWithExceptions(
      "/CommerceHub/Languages/GetLanguages",
      { param: {} }
    );
    return data.data.languages;
  }

  useEffect(() => {
    const lastStamp =
      parseInt(localStorage.getItem(CACHE_TIMESTAMP) || "0") || 0;
    const nowStamp = Date.now();
    let lastCached = [];
    try {
      lastCached = JSON.parse(localStorage.getItem(CACHE_DATA) || "[]");
    } catch (e) {
      console.error("Cache error ", e);
    }
    if (lastStamp + TTL < nowStamp) {
      try {
        fetchChoices().then((result) => {
          localStorage.setItem(CACHE_DATA, JSON.stringify(result));
          localStorage.setItem(CACHE_TIMESTAMP, nowStamp.toFixed(0));
          setChoicesCached(result);
        });
      } catch (e) {
        localStorage.setItem(
          CACHE_TIMESTAMP,
          (nowStamp - TTL + 60000).toFixed(0) // try in 1 minute
        );
        console.error(e);
      }
    }
    setChoicesCached(lastCached);
  }, []);

  const languageChoices: DropdownItemProps[] = useMemo(
    () =>
      choicesCached.map((row, idx) => ({
        text: row.language_name,
        value: row.language_iso_code,
        key: idx,
      })),
    [JSON.stringify(choicesCached)]
  );

  return {
    choices: languageChoices,
    match: (query: string, options: DropdownItemProps[]) => {
      return (choice: DropdownItemProps) => {
        const langMatches = choicesCached.filter(matchesQuery(query));
        return (
          langMatches.some(
            (match) => choice.value === match.language_iso_code
          ) && options.some((opt) => opt.value === choice.value)
        );
      };
    },
  };
}
