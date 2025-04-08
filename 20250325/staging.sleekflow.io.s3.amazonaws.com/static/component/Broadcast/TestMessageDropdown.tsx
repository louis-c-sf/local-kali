import React, { useState } from "react";
import { useProfileDisplayName } from "../Chat/utils/useProfileDisplayName";
import { POST_USER_PROFILE_SEARCH } from "../../api/apiPath";
import { contactDescription } from "../Chat/utils/contactDescription";
import ProfileSearchType, {
  DisplayableProfileType,
  SearchContactResultType,
} from "../../types/ProfileSearchType";
import { post } from "../../api/apiRequest";
import SearchContact from "../SearchContact";
import {
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Label,
  LabelProps,
} from "semantic-ui-react";
import { useDebouncedCallback } from "use-debounce/lib";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { buildQuickSearchParam } from "../../api/Contacts/useContactsSuggest";
import { propEq } from "ramda";
import { getQueryMatcher } from "../../container/Settings/filters/getQueryMatcher";

interface UserItemType extends DropdownItemProps {
  contact: ProfileSearchType;
}

export default function TestMessageDropdown(props: {
  setProfileIdList: (idList: string[]) => void;
  profileIdList: string[];
  disabled?: boolean;
}) {
  const { profileIdList, setProfileIdList } = props;
  const [searchContactResult, setSearchContactResult] = useState<
    ProfileSearchType[]
  >([]);
  const { profileDisplayName } = useProfileDisplayName();
  const [idLists, setIdLists] = useState<DropdownItemProps[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const matchesContent = getQueryMatcher((item: UserItemType) => {
    return [item.text, contactDescription(item.contact)].join("|");
  });

  async function fetchEmailList(value: string) {
    let param = [...buildQuickSearchParam(value)];
    setLoading(true);
    try {
      let result: SearchContactResultType = await post(
        POST_USER_PROFILE_SEARCH + "?limit=20",
        { param }
      );
      const filteredProfileResult = result.userProfiles || [];

      if (filteredProfileResult.length > 0) {
        const fetchedIdChoices: DropdownItemProps[] = filteredProfileResult.map(
          (res) => {
            return {
              key: res.id,
              text: profileDisplayName(res),
              value: res.id,
              contact: res,
              content: (
                <SearchContact
                  id={res.id}
                  image={res.displayProfilePicture || ""}
                  title={profileDisplayName(res as DisplayableProfileType)}
                  description={contactDescription(res) || ""}
                />
              ),
            };
          }
        );
        setSearchContactResult([
          ...searchContactResult,
          ...filteredProfileResult.filter(
            (r) => !searchContactResult.some(propEq("id", r.id))
          ),
        ]);
        setIdLists([
          ...idLists,
          ...fetchedIdChoices.filter(
            (c) => !idLists.some((l) => l.key === c.key)
          ),
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const [debonceCallback] = useDebouncedCallback(() => {
    fetchEmailList(searchQuery);
  }, 1000);

  const handleInputSearch = (e: React.SyntheticEvent, data: DropdownProps) => {
    const { searchQuery } = data;
    if (searchQuery) {
      debonceCallback();
    }
    setSearchQuery(searchQuery ?? "");
  };

  const handleTestMsgInput = async (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    const { value } = data;
    const selectedValue = value as string[];
    const filterResult = (searchContactResult || []).filter((userProfile) =>
      selectedValue.includes(userProfile.id)
    );
    if (filterResult.length > 0) {
      const nonSelectedVal = selectedValue.filter(
        (val) => !profileIdList.includes(val)
      );
      if (nonSelectedVal.length > 0) {
        const updatedSelectedEmailList = [...profileIdList, ...nonSelectedVal];
        setProfileIdList([...updatedSelectedEmailList]);
      }
    }
    setSearchQuery("");
  };
  const onRemoveIcon = (e: React.MouseEvent, data: LabelProps) => {
    const { value } = data;
    if (profileIdList.includes(value)) {
      setProfileIdList([...profileIdList.filter((e) => e !== value)]);
    }
  };

  return (
    <InfoTooltip
      placement={"right"}
      children={t("broadcast.tooltip.campaign.test")}
      trigger={
        <Dropdown
          placeholder={t("broadcast.edit.test.field.user.placeholder")}
          className="testing-email"
          onSearchChange={handleInputSearch}
          onChange={handleTestMsgInput}
          search={(options) => {
            return options.filter(matchesContent(searchQuery));
          }}
          fluid
          multiple
          selection
          noResultsMessage={
            loading
              ? t("form.field.dropdown.loading")
              : t("form.field.dropdown.noResults")
          }
          renderLabel={(
            item: DropdownItemProps,
            index: number,
            defaultLabelProps: object
          ) => (
            <Label
              {...defaultLabelProps}
              content={item.text}
              onRemove={onRemoveIcon}
            />
          )}
          value={profileIdList}
          upward={false}
          loading={loading}
          options={idLists}
          searchQuery={searchQuery}
          disabled={props.disabled}
        />
      }
    />
  );
}
