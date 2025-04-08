import React, { useEffect, useState } from "react";
import styles from "./SearchForm.module.css";
import { Button, Icon } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

export function SearchForm(props: {
  placeholder: string;
  onChange: (text: string) => void;
  onSearch: (value: string) => void;
  loading: boolean;
  onReset: () => void;
  value: string;
  submittable: boolean;
}) {
  const {
    loading,
    onChange,
    onReset,
    onSearch,
    submittable,
    value,
    placeholder,
  } = props;
  const [formElement, setFormElement] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();
  const enableSubmit = submittable && value.trim() !== "";

  useEffect(() => {
    if (!(formElement && enableSubmit && value)) {
      return;
    }
    const submitHandler = (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        return onSearch(value);
      }
    };
    formElement.addEventListener("keypress", submitHandler);
    return () => {
      if (submitHandler && formElement) {
        formElement.removeEventListener("keypress", submitHandler);
      }
    };
  }, [formElement, enableSubmit, value]);

  return (
    <div className={styles.search} ref={setFormElement}>
      <div className={styles.input}>
        <div className="ui input">
          <input
            type={"text"}
            placeholder={placeholder}
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
            }}
          />
        </div>
        {value !== "" && (
          <div className={styles.reset} onClick={onReset}>
            <Icon name={"close"} />
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <Button
          className={"button-small"}
          primary
          content={t("form.buttons.search")}
          disabled={!enableSubmit}
          onClick={enableSubmit ? () => onSearch(value) : undefined}
        />
      </div>
    </div>
  );
}
