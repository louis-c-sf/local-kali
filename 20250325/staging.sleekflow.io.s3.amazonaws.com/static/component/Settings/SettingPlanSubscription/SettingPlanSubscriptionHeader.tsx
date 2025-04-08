import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Header, Menu, MenuItemProps } from "semantic-ui-react";
import { useAppSelector } from "../../../AppRootContext";
import styles from "./SettingPlanSubscriptionHeader.module.css";
import useCountryCodeCurrencyMapping from "../../../config/localizable/useCountryCodeCurrencyMapping";
import { equals } from "ramda";
import { HIDE_CURRENCY_SWITCHER_COUNTRYCODES } from "./SettingPlanUtils";
import { isFreeOrFreemiumPlan, PlanType } from "types/PlanSelectionType";
import { useFeaturesGuard } from "../hooks/useFeaturesGuard";
import { ExcludedAddOn } from "./SettingPlan/SettingPlan";
import { BillRecordsType } from "types/CompanyType";
export function getLatestPaidSubscription(billRecords: BillRecordsType[]) {
  return billRecords.find(
    (s) => ExcludedAddOn(s) && !isFreeOrFreemiumPlan(s.subscriptionPlan)
  );
}

const CurrencySwitcher = ({
  countryCode,
  selectedCurrency,
  setSelectedCurrency,
}: {
  setSelectedCurrency: (value: string) => void;
  selectedCurrency: string;
  countryCode: string;
}) => {
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const latestPaidSubscription = useAppSelector(
    (s) => getLatestPaidSubscription(s.company?.billRecords ?? []),
    equals
  );
  const shouldHideCurrencySwitcher =
    HIDE_CURRENCY_SWITCHER_COUNTRYCODES.includes(countryCode) ||
    !isFreeOrFreemiumPlan(currentPlan) ||
    (latestPaidSubscription && isFreeOrFreemiumPlan(currentPlan));

  const { currency: localCurrency } =
    useCountryCodeCurrencyMapping(countryCode);

  const localCurrencyOption = {
    key: localCurrency,
    value: localCurrency,
    text: localCurrency,
  };

  const currencyOptions =
    localCurrency === "USD"
      ? [localCurrencyOption]
      : [
          localCurrencyOption,
          {
            key: "USD",
            value: "USD",
            text: "USD",
          },
        ];
  if (shouldHideCurrencySwitcher) {
    return null;
  }

  return (
    <div className={`ui form ${styles.currencySelector}`}>
      <Dropdown
        onChange={(_, data) => setSelectedCurrency(data.value as string)}
        value={selectedCurrency}
        selection={true}
        options={currencyOptions}
      />
    </div>
  );
};

export default function SettingPlanSubscriptionHeader({
  switchSelectedIndex,
  selectedItem,
  countryCode,
  selectedCurrency,
  setSelectedCurrency,
  currentPlan,
}: {
  currentPlan: PlanType;
  countryCode: string;
  switchSelectedIndex: (_: any, itemData: MenuItemProps) => void;
  selectedItem: string;
  setSelectedCurrency: (currency: string) => void;
  selectedCurrency: string;
}) {
  const { t } = useTranslation();

  const featureGuard = useFeaturesGuard();

  const planTabItems: Array<MenuItemProps> = [
    {
      text: t("settings.plan.title"),
      content: <span>{t("settings.plan.title")}</span>,
      visible: true,
      name: "Subscriptions",
    },
    {
      text: t("settings.plan.selection.section.addOn.header"),
      content: <span>{t("settings.plan.selection.section.addOn.header")}</span>,
      visible:
        !isFreeOrFreemiumPlan(currentPlan) && !featureGuard.isShopifyAccount(),
      name: "AddOn",
    },
    {
      text: t("settings.plan.supportPlans.header"),
      content: <span>{t("settings.plan.supportPlans.header")}</span>,
      visible:
        !isFreeOrFreemiumPlan(currentPlan) && !featureGuard.isShopifyAccount(),
      name: "SupportPlans",
    },
    {
      text: t("settings.plan.counter.header"),
      content: <span>{t("settings.plan.counter.header")}</span>,
      visible: !featureGuard.isShopifyAccount(),
      name: "AccountData",
    },
    {
      text: t("settings.plan.billing.header"),
      content: <span>{t("settings.plan.billing.header")}</span>,
      visible:
        !isFreeOrFreemiumPlan(currentPlan) && !featureGuard.isShopifyAccount(),
      name: "Billing",
    },
  ].filter((item) => item.visible);

  return (
    <div className={styles.planSubscriptionHeaderContainer}>
      <div className={styles.planSubscriptionTitle}>
        <Header as="h4" content={t("nav.menu.settings.plan")} />
      </div>
      <div className={styles.subscriptionTabs}>
        <Menu
          className={styles.subscriptionTabToggle}
          pointing
          secondary
          vertical={false}
          onItemClick={switchSelectedIndex}
          items={planTabItems}
          activeIndex={planTabItems.findIndex((i) => i.name === selectedItem)}
        />
        {!featureGuard.isShopifyAccount() && (
          <CurrencySwitcher
            setSelectedCurrency={setSelectedCurrency}
            selectedCurrency={selectedCurrency}
            countryCode={countryCode}
          />
        )}
      </div>
    </div>
  );
}
