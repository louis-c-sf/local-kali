import { Dropdown } from "semantic-ui-react";
import React from "react";
import { useTranslation } from "react-i18next";

export function ExpirationInput(props: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { onChange, value } = props;
  const { t } = useTranslation();
  const options = [3, 7, 14, 30].map((d, i) => {
    return {
      text: t("settings.user.modal.add.field.expiration.text", { days: d }),
      value: d,
      key: i,
    };
  });

  return (
    <Dropdown
      selection
      fluid
      options={options}
      value={value}
      onChange={(event, { value }) => {
        onChange(value as number);
      }}
    />
  );
}
