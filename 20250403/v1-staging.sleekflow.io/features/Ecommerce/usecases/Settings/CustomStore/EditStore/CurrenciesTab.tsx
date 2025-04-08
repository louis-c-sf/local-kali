import React, { useEffect } from "react";
import styles from "./CurrenciesTab.module.css";
import { useTranslation } from "react-i18next";
import { useCurrenciesSettings } from "./CurrenciesTab/useCurrenciesSettings";
import { Dimmer } from "semantic-ui-react";
import { TogglableItem } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/CurrenciesTab/TogglableItem";
import { Button } from "component/shared/Button/Button";

export function CurrenciesTab(props: { storeId: string }) {
  const { t } = useTranslation();

  const settingsFlow = useCurrenciesSettings(props.storeId);
  const disableSubmit = settingsFlow.values.every((v) => !v.enabled);
  const disableForm = settingsFlow.booted?.hasProducts;

  useEffect(() => {
    settingsFlow.boot();
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        {t("settings.commerce.currencies.head")}
      </div>
      <div className={styles.subhead}>
        {t("settings.commerce.currencies.subhead")}
      </div>
      <div className={styles.form}>
        <Dimmer.Dimmable>
          <div className={styles.items}>
            {settingsFlow.booted &&
              settingsFlow.values.map((curr) => (
                <TogglableItem
                  key={curr.currency_iso_code}
                  title={curr.currency_name}
                  subtitle={curr.currency_iso_code.toUpperCase()}
                  onToggle={() =>
                    settingsFlow.toggleCurrency(curr.currency_iso_code)
                  }
                  value={curr.enabled}
                  disabled={disableForm}
                />
              ))}
          </div>
          <div className={styles.actions}>
            <Button
              primary
              content={t("form.button.save")}
              onClick={settingsFlow.saveCurrencies}
              disabled={settingsFlow.loading || disableForm || disableSubmit}
              loading={settingsFlow.loading}
            />
          </div>
        </Dimmer.Dimmable>
      </div>
    </div>
  );
}
