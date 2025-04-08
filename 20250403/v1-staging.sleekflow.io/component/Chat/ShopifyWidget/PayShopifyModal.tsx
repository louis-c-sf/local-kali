import useFetchShopifyStatus from "api/Channel/useFetchShopifyStatus";
import { useAppSelector } from "AppRootContext";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { getIntegrationFeaturePlanDetails } from "component/Settings/helpers/getIntegrationFeaturePlanDetails";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";
import { onClickRedirectToStripe } from "component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { Button } from "component/shared/Button/Button";
import { ModalForm } from "component/shared/ModalForm";
import { equals } from "ramda";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Form } from "semantic-ui-react";
import { isYearlyPlan } from "types/PlanSelectionType";
import styles from "./PayShopifyModal.module.css";

export default function PayShopifyModal({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShopifyId, setSelectedShopifyId] = useState("");
  const flash = useFlashMessageChannel();
  const { stripePublicKey, stripePlans } = useSettingsSubscriptionPlan();
  const shopifyStatus = useFetchShopifyStatus();
  const companyId = useAppSelector((s) => s.company?.id);
  useEffect(() => {
    if (companyId && shopifyStatus.storeStatus === undefined) {
      shopifyStatus.refresh();
    }
  }, [companyId, shopifyStatus.storeStatus?.map((c) => c.id).join()]);

  const shopifyOptions = shopifyStatus.expiredShopifyStoreConfigs?.map(
    (shopify) => ({
      value: String(shopify.id),
      text: shopify.name,
      key: shopify.id,
    })
  );

  useEffect(() => {
    if (shopifyOptions?.length) {
      setSelectedShopifyId(shopifyOptions[0].value);
    }
  }, [shopifyOptions?.map((k) => k.value).join()]);
  if (!shopifyOptions || !stripePlans) {
    return null;
  }
  const shopifyPlan = getIntegrationFeaturePlanDetails(
    currentPlan,
    stripePlans.addOnPlans?.integrationFeatures,
    "shopifyIntegration"
  );
  async function onSubscriptionClick() {
    if (!stripePublicKey || !selectedShopifyId) {
      return;
    }
    onClickRedirectToStripe({
      setLoading: setIsLoading,
      t,
      flash,
      planId: shopifyPlan.id,
      stripePublicKey,
      shopifyConfigId: selectedShopifyId,
      quantity: 1,
    });
  }

  if (!shopifyPlan) {
    return null;
  }
  const actions = () => (
    <>
      <Button
        blue
        onClick={isLoading ? undefined : () => setOpen(false)}
        content={t("shopifySubscription.button.cancel")}
        disabled={isLoading}
      />
      <Button
        primary
        loading={isLoading}
        disabled={isLoading}
        onClick={isLoading ? undefined : onSubscriptionClick}
        content={t("shopifySubscription.button.confirm")}
      />
    </>
  );
  return (
    <ModalForm
      actions={actions}
      isLoading={isLoading}
      title={t("shopifySubscription.title")}
      cancelText={t("shopifySubscription.button.cancel")}
      onCancel={() => setOpen(false)}
      onConfirm={isLoading ? () => {} : onSubscriptionClick}
      confirmText={t("shopifySubscription.button.confirm")}
      opened
    >
      <Form className={styles.container}>
        <div className={styles.header}>
          {t("shopifySubscription.subTitle", {
            currency: shopifyPlan.currency.toUpperCase(),
            amount: shopifyPlan.amount,
            period: isYearlyPlan(currentPlan)
              ? t("period.year")
              : t("period.month"),
          })}
        </div>
        <div className={styles.storeSelection}>
          <label>{t("shopifySubscription.storeSelection.label")}</label>
          <Dropdown
            fluid
            labeled
            className={styles.dropdown}
            selectOnBlur={false}
            selection
            value={selectedShopifyId}
            options={shopifyOptions}
            onChange={(_, { value }) => {
              if (!value) {
                return;
              }
              setSelectedShopifyId(value as string);
            }}
          />
        </div>
        <div className={styles.note}>{t("shopifySubscription.note")}</div>
      </Form>
    </ModalForm>
  );
}
