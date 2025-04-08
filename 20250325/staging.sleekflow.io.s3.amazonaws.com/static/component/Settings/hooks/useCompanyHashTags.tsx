import equals from "fast-deep-equal";
import {
  HashTagType,
  HashTagCountedType,
} from "../../../types/ConversationType";
import { useAppSelector, useAppDispatch } from "../../../AppRootContext";
import { useCallback, useMemo } from "react";
import { fetchCompanyTags } from "../../../api/Company/fetchCompanyTags";

export function useCompanyHashTags() {
  const companyTags = useAppSelector(
    (s) => s.company?.companyHashtags ?? [],
    equals
  );
  const loginDispatch = useAppDispatch();

  const refreshCompanyTags = useCallback(async () => {
    try {
      const tags: HashTagCountedType[] = await fetchCompanyTags();
      loginDispatch({ type: "UPDATE_COMPANY_TAGS", tags });
    } catch (e) {
      console.error("refreshCompanyTags", e);
    }
  }, [loginDispatch]);

  const tagsMap = useMemo(
    () => companyTags.reduce((m, t) => m.set(t.hashtag, t), new Map()),
    [companyTags.length, companyTags.reduce((s, t) => s + ":" + t.hashtag, "")]
  );

  const getActualTagsOnly = useCallback(
    <T extends HashTagType>(tags: T[]): T[] =>
      tags.reduce<T[]>((acc, next) => {
        const match = tagsMap.has(next.hashtag);
        return match ? [...acc, next] : acc;
      }, []),
    [tagsMap]
  );

  return {
    companyTags: companyTags,
    getActualTagsOnly,
    refreshCompanyTags,
  };
}
