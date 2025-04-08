import React, { useState } from "react";
import { MenuItemProps } from "semantic-ui-react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import SettingPlanSubscriptionHeader from "../component/Settings/SettingPlanSubscription/SettingPlanSubscriptionHeader";
import { useSettingsSubscriptionPlan } from "../component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";
import SettingSubscriptionTabs from "component/Settings/SettingPlanSubscription/SettingSubscriptionTabs";
import styles from "./SettingPlanSubscription.module.css";
import ExploreEnterpriseSection from "../component/Settings/SettingPlanSubscription/ExploreEnterpriseSection";
import SubscriptionPlanNewVersion from "component/Settings/SettingPlanSubscription/SubscriptionPlanNewVersion";
import { useAppSelector } from "AppRootContext";

export default function SettingPlanSubscription() {
  const {
    currency,
    countryCode,
    setSelectedCurrency,
    currentPlan,
    ...settingSubscriptionPlanRest
  } = useSettingsSubscriptionPlan();
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState("Subscriptions");
  const pageTitle = t("nav.menu.settings.plan");
  const isGlobalPricingFeatureEnabled = useAppSelector(
    (s) => s.company?.isGlobalPricingFeatureEnabled
  );
  const switchSelectedIndex = (_: any, itemData: MenuItemProps) => {
    setSelectedItem(itemData.name ?? "");
  };

  return (
    <div
      className={`content no-scrollbars ${styles.planSubscriptionContainer} ${
        selectedItem !== "Subscriptions"
          ? styles.planSubscriptionContainerWhite
          : ""
      }`}
    >
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <div className={`_content ${styles.planSubscriptionContent}`}>
        {isGlobalPricingFeatureEnabled ? (
          <SubscriptionPlanNewVersion />
        ) : (
          <>
            <SettingPlanSubscriptionHeader
              currentPlan={currentPlan}
              countryCode={countryCode}
              setSelectedCurrency={setSelectedCurrency}
              selectedCurrency={currency}
              selectedItem={selectedItem}
              switchSelectedIndex={switchSelectedIndex}
            />
            <SettingSubscriptionTabs
              currentPlan={currentPlan}
              selectedTab={selectedItem}
              currency={currency}
              {...settingSubscriptionPlanRest}
            />
          </>
        )}
      </div>
      {!isGlobalPricingFeatureEnabled && selectedItem === "Subscriptions" && (
        <ExploreEnterpriseSection />
      )}
    </div>
  );
}
