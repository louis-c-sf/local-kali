import React from "react";
import styles from "./Filter.module.css";
import { Dropdown } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../component/shared/Button/Button";
import { useFilterFlow } from "./useFilterFlow";
import { SearchInput } from "../../../../component/shared/input/SearchInput";
import { FilterProps, FilterSearchableType, OptionType } from "./contracts";

function toDropdownOption(s: OptionType) {
  return {
    text: s.title,
    value: s.value,
    key: s.value,
  };
}

export function Filter<Filter extends FilterSearchableType>(
  props: FilterProps<Filter>
) {
  const { loading, filter, isResultsAreFiltered } = props;
  const { t } = useTranslation();
  let searchText = "";
  if (!props.disabled) {
    searchText =
      typeof props.filter.search === "string" ? props.filter.search : "";
  }
  const searchDisabled = searchText.trim() === "";

  const api = useFilterFlow({ ...props, searchDisabled });

  return (
    <div className={`${styles.root} ui form`}>
      <div className={styles.section}>
        <div className={`${styles.searchGroup} `}>
          <SearchInput
            onChange={(event) => {
              api.handleSearch("search", event.target.value, false);
            }}
            hasQuery={!!searchText}
            loading={false}
            reset={() => {
              api.handleSearch("search", "", true);
            }}
            query={searchText}
            disabled={props.disabled || loading}
            placeholder={t("salesforce.table.filter.search.placeholder")}
            onSubmit={api.submit}
            noMargins
            showSearchIcon={false}
          />
          <div className={styles.button}>
            <Button
              content={t("form.buttons.search")}
              disabled={props.disabled || loading || searchDisabled}
              customSize={"input"}
              onClick={() => api.submit()}
            />
          </div>
        </div>
      </div>
      {props.inputs?.map(({ name, options, placeholder, render }) => {
        const key = filter?.[name] ? (name as string) : `reset_${name}`;
        const value = filter?.[name] ?? undefined;
        const disabled = Boolean(props.disabled || loading);

        return (
          <div className={styles.section}>
            {render ? (
              render(value, key, disabled, api.handleDropdown(name))
            ) : (
              <Dropdown
                key={key}
                fluid
                selection
                search
                selectOnBlur={false}
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onChange={api.handleDropdown(name)}
                options={options?.map(toDropdownOption) ?? []}
              />
            )}
          </div>
        );
      })}

      {isResultsAreFiltered && (
        <div className={styles.section}>
          <a onClick={api.reset}>{t("salesforce.actions.clearFilters")}</a>
        </div>
      )}
    </div>
  );
}
