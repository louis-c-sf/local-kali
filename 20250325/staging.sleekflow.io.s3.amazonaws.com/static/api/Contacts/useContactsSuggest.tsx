import {
  DisplayableProfileType,
  SearchCategoryItemType,
  SearchContactResultType,
} from "../../types/ProfileSearchType";
import { post } from "../apiRequest";
import { POST_USER_PROFILE_SEARCH } from "../apiPath";
import { contactDescription } from "../../component/Chat/utils/contactDescription";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useProfileDisplayName } from "../../component/Chat/utils/useProfileDisplayName";
import { FilterConditionCommonType } from "../../types/BroadcastCampaignType";

export function buildQuickSearchParam(
  typedValue: string
): FilterConditionCommonType[] {
  return [
    {
      fieldName: "displayname",
      conditionOperator: "Contains",
      values: [typedValue],
      nextOperator: "Or",
    },
    {
      fieldName: "phonenumber",
      conditionOperator: "Contains",
      values: [typedValue],
      nextOperator: "Or",
    },
    {
      fieldName: "email",
      conditionOperator: "Contains",
      values: [typedValue],
      nextOperator: "Or",
    },
  ];
}

export function useContactsSuggest() {
  const [open, isOpen] = useState(false);
  const [loading, isLoading] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const [debounceCallback] = useDebouncedCallback(() => fetchResult(), 800);
  const { profileDisplayName } = useProfileDisplayName();
  const [searchResult, setSearchResult] = useState<SearchCategoryItemType[]>(
    []
  );

  const handleSearchChange = (searchQuery: string) => {
    if (searchQuery && searchQuery.trim()) {
      setTypedValue(searchQuery);
    } else {
      setTypedValue("");
    }
  };

  useEffect(() => {
    if (!open) {
      setSearchResult([]);
    }
  }, [open]);

  useEffect(() => {
    debounceCallback();
  }, [typedValue]);

  const fetchResult = async () => {
    if (typedValue) {
      isLoading(true);
      try {
        const result: SearchContactResultType = await post(
          POST_USER_PROFILE_SEARCH + "?limit=10",
          { param: buildQuickSearchParam(typedValue) }
        );
        setSearchResult(
          (result.userProfiles || []).map((profileSearch) => {
            return {
              id: profileSearch.id,
              title: profileDisplayName(
                profileSearch as DisplayableProfileType
              ),
              image: profileSearch.displayProfilePicture || "",
              description: contactDescription(profileSearch),
            };
          })
        );
        isOpen(true);
      } catch (e) {
        console.error(e);
        isOpen(false);
      } finally {
        isLoading(false);
      }
    } else {
      isOpen(false);
    }
  };
  return {
    loading,
    handleSearchChange,
    typedValue,
    resetSearch: () => {
      setTypedValue("");
      //todo cancel pending requests
    },
    searchResult,
  };
}
