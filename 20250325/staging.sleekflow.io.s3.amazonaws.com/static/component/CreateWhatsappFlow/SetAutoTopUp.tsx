import React, { useEffect, useState } from "react";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { useTranslation, Trans } from "react-i18next";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import { Button } from "../shared/Button/Button";
import { Form, Dropdown, DropdownProps } from "semantic-ui-react";
import { NewNumberInfoType } from "./types";
import { formatCurrency } from "utility/string";
import { putUpdateAutoTopSettings } from "api/CloudAPI/putAutoTopUpSettings";
import { CloudAPIAutoTopUpSettingsType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIAutoTopUp";
import { useGetAutoTopUpOptions } from "component/Settings/SettingBilling/SettingCloudAPITopUp";

export function SetAutoTopUp(props: {
  selectedNewNumber: NewNumberInfoType | undefined;
  onSubmit: () => void;
}) {
  const { selectedNewNumber } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [autoTopupSettings, setAutoTopupSettings] =
    useState<CloudAPIAutoTopUpSettingsType>({
      facebook_business_id: selectedNewNumber?.facebookWabaBusinessId ?? "",
      is_auto_top_up_enabled: false,
    });

  const autoTopUpOpts = useGetAutoTopUpOptions();

  const submitAutoTopUp = async () => {
    setLoading(true);
    try {
      if (autoTopupSettings && selectedNewNumber) {
        const isRedirected = await putUpdateAutoTopSettings(
          { ...autoTopupSettings, is_auto_top_up_enabled: true },
          window.location.origin,
          selectedNewNumber.phoneNumber.replace(/[^0-9]+/g, "")
        );
        if (!isRedirected) {
          props.onSubmit();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const later = () => {
    props.onSubmit();
  };

  function changeMinBalance(_e: any, data: DropdownProps) {
    const option = data.options?.find((opt) => opt.value === data.value);
    if (option && autoTopupSettings) {
      const { priceData } = option;
      setAutoTopupSettings({
        ...autoTopupSettings,
        minimum_balance: priceData,
      });
    }
  }

  function changeAutoTopUpPlan(_e: any, data: DropdownProps) {
    const option = data.options?.find((opt) => opt.value === data.value);
    if (option && autoTopupSettings) {
      const { planData } = option;
      setAutoTopupSettings({
        ...autoTopupSettings,
        auto_top_up_plan: planData,
      });
    }
  }

  const amountPrice = `${
    autoTopupSettings?.auto_top_up_plan?.price.currency_iso_code || ""
  } ${formatCurrency(autoTopupSettings?.auto_top_up_plan?.price.amount || 0)}`;

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.cloudApi.setAutoTopUp.header")}
        subheader={t("onboarding.cloudApi.setAutoTopUp.subHeader")}
      />
      <Form className={flowStyles.setAutoTopUpForm}>
        <div className={flowStyles.setAutoUpFormContent}>
          <div className={flowStyles.title}>
            {t("onboarding.cloudApi.setAutoTopUp.autoTopUp.header")}
          </div>
          <p className={flowStyles.subTitle}>
            {t("onboarding.cloudApi.setAutoTopUp.autoTopUp.subHeader")}
          </p>
          <Form.Field>
            <label htmlFor="minimumBalance">
              {t("onboarding.cloudApi.setAutoTopUp.minimumBalance.header")}
            </label>
            <p className={flowStyles.subTitle}>
              {t("onboarding.cloudApi.setAutoTopUp.minimumBalance.subHeader")}
            </p>
            <Dropdown
              id="minimumBalance"
              options={autoTopUpOpts?.minimumBalances}
              scrolling
              value={autoTopupSettings?.minimum_balance?.amount}
              onChange={changeMinBalance}
            />
          </Form.Field>
          <Form.Field>
            <label htmlFor="topUpValue">
              {t("onboarding.cloudApi.setAutoTopUp.autoTopUpValue.header")}
            </label>
            <p className={flowStyles.subTitle}>
              {t("onboarding.cloudApi.setAutoTopUp.autoTopUpValue.subHeader")}
            </p>
            <Dropdown
              id="topUpValue"
              options={autoTopUpOpts?.autoTopUpPlans}
              scrolling
              value={autoTopupSettings?.auto_top_up_plan?.id}
              onChange={changeAutoTopUpPlan}
            />
          </Form.Field>
        </div>
        <div className={flowStyles.setAutoUpFormFooter}>
          <p className={flowStyles.feeDesc}>
            <Trans
              i18nKey={"onboarding.cloudApi.setAutoTopUp.chargeFee"}
              values={{ price: amountPrice }}
            >
              <span className={flowStyles.fee}>{amountPrice}</span> will be
              charged via Stripe for every top-up transaction.
            </Trans>
          </p>
          <p className={flowStyles.calculator}>
            <Trans i18nKey={"onboarding.cloudApi.setAutoTopUp.chargeHelper"}>
              Estimate your messaging costs with
              <a
                target="_blank"
                rel="noreferrer noopener"
                href="https://sleekflow.io/whatsapp-pricing-calculator"
              >
                SleekFlow’s WhatsApp Pricing Calculator
              </a>
              .
            </Trans>
          </p>
        </div>
      </Form>
      <Button
        primary
        fluid
        loading={loading}
        customSize={"mid"}
        disabled={loading}
        onClick={submitAutoTopUp}
      >
        {t("onboarding.cloudApi.common.button.confirm")}
      </Button>
      <Button
        className={flowStyles.laterBtn}
        fluid
        loading={loading}
        customSize={"mid"}
        disabled={loading}
        onClick={later}
      >
        {t("onboarding.cloudApi.common.button.setUpLater")}
      </Button>
    </div>
  );
}
