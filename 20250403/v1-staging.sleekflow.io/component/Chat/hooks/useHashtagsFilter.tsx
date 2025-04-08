import { useState, useCallback } from "react";
import { HashTagCountedType } from "types/ConversationType";
import { useDebouncedCallback } from "use-debounce";
import { getQueryMatcher } from "container/Settings/filters/getQueryMatcher";
import { prop } from "ramda";

const matcher = getQueryMatcher(prop("hashtag"));

export type TagsFilterHookInterface = ReturnType<typeof useHashtagsFilter>;

export function useHashtagsFilter(props: {
  collatorLang: string;
  availableItems: HashTagCountedType[];
  allItems: HashTagCountedType[];
  limit: number;
}) {
  const [itemsFiltered, setItemsFiltered] = useState<HashTagCountedType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  let items = props.availableItems.slice(0, props.limit); //todo limit param
  let hasExactMatch = false;

  if (searchActive) {
    items = itemsFiltered;
    hasExactMatch = props.allItems.some(
      (i) => i.hashtag.toLowerCase() === searchQuery.toLowerCase()
    );
  }
  const collator = new Intl.Collator(props.collatorLang);

  const [performSearch] = useDebouncedCallback((query: string) => {
    const result = props.availableItems
      .filter(matcher(query))
      .sort((a, b) => {
        const queryNorm = query.toLowerCase();
        const aNorm = a.hashtag.toLowerCase();
        const bNorm = b.hashtag.toLowerCase();
        const rankA = aNorm.indexOf(queryNorm);
        const rankB = bNorm.indexOf(queryNorm);
        if (rankA === rankB) {
          const aNormSub = aNorm.slice(rankA);
          const bNormSub = bNorm.slice(rankB);
          const rank = collator.compare(aNormSub, bNormSub);
          return rank;
        }

        const rank = rankA - rankB;
        return rank;
      })
      .slice(0, props.limit);
    setItemsFiltered(result);
    return result;
  }, 100);

  const search = (query: string) => {
    setSearchActive(query.trim() !== "");
    setSearchQuery(query);
    return performSearch(query);
  };

  const resetSearch = useCallback(() => {
    setSearchActive(false);
    setSearchQuery("");
  }, []);

  return {
    itemsFiltered,
    items,
    hasExactMatch,
    searchActive,
    searchQuery,
    search,
    resetSearch,
  };
}
