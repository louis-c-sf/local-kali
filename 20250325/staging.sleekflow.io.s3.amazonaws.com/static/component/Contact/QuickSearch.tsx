import React, { useState } from "react";
import { Button, Icon, Input } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";

export function QuickSearch(props: {
  onSearchExecute: (search: string) => void;
  onChange: (search: string) => void;
}) {
  const { t } = useTranslation();

  const handleReset = () => {
    props.onChange("");
    props.onSearchExecute("");
    setValue("");
    setLastSearchExecuted("");
  };
  const [value, setValue] = useState("");
  const isEmpty = value.trim() === "";
  const [lastSearchExecuted, setLastSearchExecuted] = useState<string>();

  const needsResetEmpty =
    value === "" &&
    lastSearchExecuted !== undefined &&
    lastSearchExecuted !== "";

  const [handleChange] = useDebouncedCallback((text: string) => {
    props.onChange(text);
  }, 90);

  function executeSearch() {
    if (searchComplete) {
      return;
    }
    props.onSearchExecute(value);
    setLastSearchExecuted(value);
  }

  const searchComplete =
    lastSearchExecuted === undefined ? isEmpty : lastSearchExecuted === value;
  return (
    <div className="quick-search">
      <Input
        placeholder={t("profile.list.quickSearch.placeholder")}
        value={value}
        className={"search-input"}
        icon={!isEmpty && <Icon name={"close"} onClick={handleReset} />}
        onChange={(event, data) => {
          setValue(data.value);
          handleChange(data.value);
        }}
        onKeyPress={(event: React.KeyboardEvent) => {
          if (event.nativeEvent.code === "Enter") {
            executeSearch();
          }
        }}
      />
      <Button
        onClick={executeSearch}
        disabled={searchComplete}
        content={
          needsResetEmpty
            ? t("form.field.any.reset")
            : t("profile.list.quickSearch.action.search")
        }
      />
    </div>
  );
}
