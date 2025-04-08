import React from "react";
import styles from "features/Ecommerce/components/CurrencySelector/CurrencySelector.module.css";
import { Dropdown } from "semantic-ui-react";
import { CurrencyType } from "core/models/Ecommerce/Catalog/CurrencyType";
import { useTranslation } from "react-i18next";

export function CurrencySelector(props: {
  value: CurrencyType["currencyCode"] | undefined;
  onChange: (currencyCode: CurrencyType["currencyCode"]) => void;
  currencies: CurrencyType[];
  format?: "short" | "long";
}) {
  const { currencies, format = "short", onChange, value } = props;
  const { t } = useTranslation();
  const currencyChoices = currencies.map((c, idx) => {
    const currencyCode = c.currencyCode;
    return {
      key: idx,
      value: currencyCode,
      text:
        format === "short"
          ? currencyCode.toUpperCase()
          : t("salesforce.currency.account", {
              currency: c.countryCode.toUpperCase(),
            }),
    };
  });

  return (
    <div className={"ui form"}>
      <Dropdown
        className={`${styles.root} ${styles[format]}`}
        selection
        value={value}
        options={currencyChoices}
        onChange={(_, { value }) => {
          onChange(value as string);
        }}
      />
    </div>
  );
}
