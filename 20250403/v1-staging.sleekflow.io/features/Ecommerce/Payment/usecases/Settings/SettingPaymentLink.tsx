import React, { useEffect, useState } from "react";
import { Tab } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { MainTabEnum } from "types/SettingPaymentLinkTypes";
import styles from "./SettingPaymentLink.module.css";
import GeneralTab from "./General/GeneralTab";
import MessagesTab from "container/Settings/Messages/MessagesTab";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import { PaymentSettingsContext } from "./contracts/PaymentSettingsContext";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { CurrencySelector } from "features/Ecommerce/components/CurrencySelector/CurrencySelector";
import { CurrencyType } from "core/models/Ecommerce/Catalog/CurrencyType";
import { OrdersTab } from "container/Settings/Order/OrdersTab";
import { RefundTab } from "container/Settings/Refund/RefundTab";
import { SettingsPage } from "../../../components/Layout/SettingsPage";

const SettingPaymentLink = () => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<MainTabEnum>(
    MainTabEnum.general
  );
  const accessRuleGuard = useAccessRulesGuard();
  const regions = useSupportedRegions({ forceBoot: true });
  const [currency, setCurrency] = useState<CurrencyType>(
    regions.currenciesSupported[0]
  );
  const isCurrencySelectorVisible = [
    MainTabEnum.general,
    MainTabEnum.orders,
    MainTabEnum.refunds,
  ].includes(selectedItem);
  useEffect(() => {
    if (regions.booted) {
      setCurrency(regions.currenciesSupported[0]);
    }
  }, [regions.booted]);
  const mainPanes = [
    {
      menuItem: {
        content: t("settings.paymentLink.tab.general"),
        name: MainTabEnum.general,
      },
      isVisible: accessRuleGuard.isAdmin() && currency.currencyCode !== "myr",
      render: () => (
        <Tab.Pane attached={false} className={styles.paneContainer}>
          <div className={styles.paddedContent}>
            <GeneralTab />
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: {
        content: t("settings.paymentLink.tab.message"),
        name: MainTabEnum.message,
      },
      isVisible: accessRuleGuard.isAdmin(),
      render: () => (
        <Tab.Pane attached={false} className={styles.paneContainer}>
          <div className={styles.paddedContent}>
            <MessagesTab />
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: {
        content: t("settings.paymentLink.tab.orders"),
        name: MainTabEnum.orders,
      },
      isVisible: true,
      render: () => {
        return (
          <Tab.Pane attached={false} className={styles.paneContainer}>
            <OrdersTab />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: {
        content: t("settings.paymentLink.tab.refunds"),
        name: MainTabEnum.refunds,
      },
      isVisible: true,
      render: () => (
        <Tab.Pane attached={false} className={styles.paneContainer}>
          <RefundTab />
        </Tab.Pane>
      ),
    },
  ];

  const updateCurrency = (currencyCode: string) => {
    const currencyMatch = regions.currenciesSupported.find(
      (c) => c.currencyCode === currencyCode
    );
    if (currencyMatch) {
      setCurrency(currencyMatch);
    }
  };

  const visiblePanes = mainPanes.filter((v) => v.isVisible);
  useEffect(() => {
    setSelectedItem(visiblePanes[0].menuItem.name);
  }, [visiblePanes.map((m) => m.menuItem.name).join()]);
  const currencyTabItem = {
    pane: null,
    menuItem: (
      <div className={styles.controls}>
        <div className={isCurrencySelectorVisible ? "" : styles.hidden}>
          <CurrencySelector
            value={currency.currencyCode}
            onChange={updateCurrency}
            currencies={regions.currenciesSupported}
            format={"long"}
          />
        </div>
      </div>
    ),
  };

  return (
    <PaymentSettingsContext value={{ country: currency }}>
      <SettingsPage
        header={t("settings.paymentLink.header")}
        panes={[...visiblePanes, currencyTabItem]}
        hasTableContent={false}
        onItemSelected={setSelectedItem}
        selectedItem={selectedItem}
      />
    </PaymentSettingsContext>
  );
};
export default SettingPaymentLink;
