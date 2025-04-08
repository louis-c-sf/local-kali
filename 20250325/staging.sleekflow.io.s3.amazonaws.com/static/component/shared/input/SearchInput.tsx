import styles from "./SearchInput.module.css";
import SearchIcon from "../../../assets/tsx/icons/SearchIcon";
import { Icon, Loader } from "semantic-ui-react";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

export function SearchInput(props: {
  setInputRef?: (input: HTMLInputElement | null) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  hasQuery: boolean;
  loading: boolean;
  reset: () => void;
  query: string;
  disabled?: boolean;
  placeholder?: string;
  noMargins?: boolean;
  showSearchIcon?: boolean;
  onSubmit?: () => void;
}) {
  const {
    hasQuery,
    loading,
    onChange,
    reset,
    setInputRef,
    placeholder,
    noMargins = false,
    showSearchIcon = true,
  } = props;
  const { t } = useTranslation();

  function submitOnEnter(ev: React.KeyboardEvent) {
    if (ev.key === "Enter" && props.onSubmit) {
      props.onSubmit();
    }
  }

  return (
    <div
      className={`ui input 
        ${styles.searchInputWrap}
        ${noMargins ? styles.noMargins : ""}
        ${!showSearchIcon ? styles.noSearchIcon : ""}
      `}
    >
      {showSearchIcon && (
        <div className={styles.searchIconWrap}>
          <SearchIcon color="var(--GRAY-MID)" />
        </div>
      )}
      <input
        type={"text"}
        ref={setInputRef}
        value={props.query}
        onChange={onChange}
        placeholder={placeholder ?? t("chat.form.input.search.placeholder")}
        disabled={props.disabled}
        onKeyUp={submitOnEnter}
      />
      {hasQuery && !loading && (
        <Icon name="times" className={styles.close} onClick={reset} />
      )}
      {loading && <Loader active size={"small"} className={styles.loader} />}
    </div>
  );
}
