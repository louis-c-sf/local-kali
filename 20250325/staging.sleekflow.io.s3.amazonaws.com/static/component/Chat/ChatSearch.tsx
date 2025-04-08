import React from "react";
import { Icon, Input, InputOnChangeData } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../AppRootContext";

interface ChatSearchProps {
  searchText: string;
  updateSearching: Function;
}

export default (props: ChatSearchProps) => {
  const loginDispatch = useAppDispatch();
  const { searchText, updateSearching } = props;
  const { t } = useTranslation();

  const handleSearching = (e: React.ChangeEvent, data: InputOnChangeData) => {
    const { value } = data;
    updateSearching(data.value);
    if (!value) {
      loginDispatch({ type: "RESET_PROFILE" });
    }
  };

  return (
    <>
      <Input
        name="search"
        value={searchText}
        onChange={handleSearching}
        className={`search`}
        placeholder={t("chat.form.input.searchMessage.placeholder")}
        fluid
      >
        <Icon name="search" />
        <input />
        {searchText.trim() !== "" && (
          <Icon name="times" onClick={() => updateSearching("")} />
        )}
      </Input>
    </>
  );
};
