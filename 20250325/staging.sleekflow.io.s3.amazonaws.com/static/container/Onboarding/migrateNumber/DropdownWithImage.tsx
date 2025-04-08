import React from "react";
import { Dropdown, DropdownProps, Image } from "semantic-ui-react";
import { OptionType } from "./types";
import { Choice } from "./Choice";
import TickIcon from "../../../assets/images/icons/tick-circle-blue.svg";
import styles from "./DropdownList.module.css";
import { useTranslation } from "react-i18next";

export const DropdownWithImage = (props: {
  label: string;
  options: OptionType[];
  value: string | boolean;
  handleChange: (value: string | boolean) => void;
  disabled: boolean;
  loading?: boolean;
  hide?: boolean;
  placeholder?: string;
}) => {
  const {
    label,
    options,
    value,
    handleChange,
    disabled,
    loading = false,
    hide = false,
  } = props;
  const { t } = useTranslation();
  const placeholder = props.placeholder
    ? props.placeholder
    : t("form.field.any.placeholder.selectOption");

  const dropdownChoices = options.map((choice: OptionType, index: number) => ({
    key: choice.key,
    value: choice.value,
    content: <Choice index={index} text={choice.text} />,
    text: <Choice index={index} text={choice.text} />,
  }));

  return (
    <>
      {!hide && (
        <div className={styles.dropdownRow}>
          <div className={styles.rowContainer}>
            <Image src={TickIcon} alt="dropdown" className={styles.tick} />
            <label className={styles.label}>{label}</label>
          </div>
          <div className={styles.rowContainer}>
            <div className={styles.line}></div>
            <Dropdown
              placeholder={placeholder}
              selection
              options={dropdownChoices}
              selectOnBlur={false}
              onChange={(e: React.SyntheticEvent, data: DropdownProps) => {
                const { value } = data;
                if (typeof value === "string") {
                  handleChange(value as string);
                } else if (typeof value === "boolean") {
                  handleChange(value as boolean);
                }
              }}
              value={value}
              disabled={disabled}
              loading={loading}
            />
          </div>
        </div>
      )}
    </>
  );
};
