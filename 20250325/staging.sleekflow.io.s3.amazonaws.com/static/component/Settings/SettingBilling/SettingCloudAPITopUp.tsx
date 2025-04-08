import { fetchTopUpCredit } from "api/CloudAPI/fetchTopUpCredit";
import submitTopUp from "api/CloudAPI/submitTopUp";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimmer,
  Loader,
  Checkbox,
  Dropdown,
  Modal,
  DropdownProps,
  CheckboxProps,
} from "semantic-ui-react";
import { WhatsappCloudApiUsageRecordType } from "types/CompanyType";
import { ConversationUsage } from "./ConversationUsage";
import SettingTopUpPlanSelection from "./SettingTopUpPlanSelection";
import { TopUpCreditType } from "./SettingTwilioTopUp";
import BadgeTag from "component/shared/BadgeTag/BadgeTag";
import styles from "./SettingBilling.module.css";
import { formatCurrency } from "utility/string";
import { Button } from "component/shared/Button/Button";
import { fetchAutoTopUpOptions } from "api/CloudAPI/fetchAutoTopUpOptions";
import { fetchAutoTopUpSettings } from "api/CloudAPI/fetchAutoTopUpSettings";
import { putUpdateAutoTopSettings } from "api/CloudAPI/putAutoTopUpSettings";
import {
  AutoTopUpPriceType,
  AutoTopUpPlanType,
  CloudAPIAutoTopUpSettingsType,
} from "features/WhatsappCloudAPI/models/WhatsappCloudAPIAutoTopUp";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";

export type CloudAPIAutoTopUpOptionsType = {
  minimumBalances: {
    text: string;
    value: number;
    priceData: AutoTopUpPriceType;
  }[];
  autoTopUpPlans: {
    text: string;
    value: string;
    planData: AutoTopUpPlanType;
  }[];
};

export const useGetAutoTopUpOptions = () => {
  const [autoTopUpOpts, setAutoTopUpOpts] =
    useState<CloudAPIAutoTopUpOptionsType>({
      minimumBalances: [],
      autoTopUpPlans: [],
    });
  useEffect(() => {
    const getAutoTopOpts = async () => {
      try {
        const result = await fetchAutoTopUpOptions();
        const minimumBalances = result.minimum_balances.map((min) => ({
          priceData: min,
          text: `${min.currency_iso_code} ${formatCurrency(min.amount)}`,
          value: min.amount,
        }));
        const autoTopUpPlans = result.auto_top_up_plans.map((plan) => ({
          planData: plan,
          text: `${plan.price.currency_iso_code} ${formatCurrency(
            plan.price.amount
          )}`,
          value: plan.id,
        }));
        setAutoTopUpOpts({ minimumBalances, autoTopUpPlans });
      } catch (err) {
        console.error(err);
      }
    };
    getAutoTopOpts();
  }, []);
  return autoTopUpOpts;
};

export default function SettingCloudAPITopUp({
  selectedBalance,
  loading,
}: {
  selectedBalance: WhatsappCloudApiUsageRecordType;
  loading: boolean;
}) {
  const [topUpCreditPlans, setTopUpCreditPlans] = useState<TopUpCreditType[]>();
  const { t } = useTranslation();
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [autoTopUpLoading, setAutoTopUpLoading] = useState(false);
  const [autoTopupSettings, setAutoTopupSettings] =
    useState<CloudAPIAutoTopUpSettingsType>();
  const [visibleAutoTopUpModal, setVisibleAutoTopUpModal] = useState(false);
  const flash = useFlashMessageChannel();
  const autoTopUpOpts = useGetAutoTopUpOptions();

  useEffect(() => {
    fetchTopUpCredit()
      .then((credits) => {
        setTopUpCreditPlans(
          credits.top_up_plans
            .map((plan) => ({
              id: plan.id,
              name: plan.name,
              price: plan.price.amount,
              currency: plan.price.currency_iso_code,
            }))
            .sort((a, b) => a.price - b.price)
        );
      })
      .catch((error) => {
        console.error(`fetchTopUpCredit error ${error}`);
      });
  }, []);

  useEffect(() => {
    const getAutoTopValues = async (options: CloudAPIAutoTopUpOptionsType) => {
      const { minimumBalances, autoTopUpPlans } = options;
      try {
        const result = await fetchAutoTopUpSettings(
          selectedBalance.facebook_business_id
        );
        if (result.business_balance_auto_top_up_profile) {
          setAutoTopupSettings(result.business_balance_auto_top_up_profile);
        } else {
          const { priceData } = minimumBalances[minimumBalances.length - 1];
          const { planData } = autoTopUpPlans[autoTopUpPlans.length - 1];
          setAutoTopupSettings({
            facebook_business_id: selectedBalance.facebook_business_id,
            is_auto_top_up_enabled: false,
            minimum_balance: priceData,
            auto_top_up_plan: planData,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (autoTopUpOpts) {
      getAutoTopValues(autoTopUpOpts);
    }
  }, [selectedBalance, autoTopUpOpts]);

  async function submitPayment(topUpPlanId: string) {
    if (topUpLoading) {
      return;
    }
    try {
      setTopUpLoading(true);
      const result = await submitTopUp(
        selectedBalance.facebook_business_id,
        topUpPlanId
      );
      window.location = result.payment_url;
    } catch (e) {
      console.error(`submitPayment error ${e}`);
      setTopUpLoading(false);
    }
  }

  async function submitAutoTopUp() {
    try {
      setAutoTopUpLoading(true);
      if (autoTopupSettings) {
        const isRedirected = await putUpdateAutoTopSettings(
          autoTopupSettings,
          window.location.origin
        );
        if (!isRedirected) {
          setVisibleAutoTopUpModal(false);
          flash(t("settings.billing.topupCredit.autoTopUp.updateSuccess"));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAutoTopUpLoading(false);
    }
  }

  function changeEnable(_e: any, data: CheckboxProps) {
    if (autoTopupSettings) {
      setAutoTopupSettings({
        ...autoTopupSettings,
        is_auto_top_up_enabled: !!data.checked,
      });
    }
  }

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

  const loadingTopUp = loading;
  const { balance, all_time_usage, total_credit } = selectedBalance;
  return (
    <Dimmer.Dimmable
      dimmed
      className={"main-primary-column content topup-credit"}
    >
      {loadingTopUp ? (
        <Dimmer active={loadingTopUp} inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <div className="form ui">
          <div className="header">
            {t("settings.billing.topupCredit.header")}
          </div>
          {balance && (
            <div className="balance">
              <div
                className={`container ${
                  balance.amount > 0
                    ? `positive`
                    : balance.amount === undefined || balance.amount === 0
                    ? ""
                    : `negative`
                }`}
              >
                <div className="container-header">
                  {t("settings.billing.topupCredit.currentBalance.header")}
                </div>
                <span>
                  {balance.amount === undefined
                    ? `US$ 0.00`
                    : `${balance.currency_iso_code} ${Math.abs(
                        balance.amount
                      ).toFixed(2)}`}
                </span>
              </div>
              <div className="container">
                <div className="container-header">
                  {t("settings.billing.topupCredit.usage.header")}
                </div>
                <span>
                  {all_time_usage.amount === undefined
                    ? `US$ 0.00`
                    : `${
                        all_time_usage.currency_iso_code
                      } ${all_time_usage.amount.toFixed(2)}`}
                </span>
              </div>
              <div className="container">
                <div className="container-header">
                  {t("settings.billing.topupCredit.amountTopUp.header")}
                </div>
                <span>
                  {total_credit === undefined
                    ? `US$ 0.00`
                    : `${
                        total_credit.currency_iso_code
                      } ${total_credit.amount.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
          <ConversationUsage
            facebookBusinessId={selectedBalance.facebook_business_id}
            facebookWabas={selectedBalance.facebook_business_wabas}
          />

          <div className="header">
            {t("settings.billing.topupCredit.topUpMethod")}
          </div>
          <div className="subHeader">
            {t("settings.billing.topupCredit.topUpMethodNote")}
          </div>
          <div className="container add-topup">
            <div className="header">
              {t("settings.billing.topupCredit.autoTopUp.header")}
              <BadgeTag
                compact
                className={styles.recommendedTag}
                text={t("settings.billing.topupCredit.autoTopUp.recommended")}
              />
            </div>
            <div className="subHeader">
              {t("settings.billing.topupCredit.autoTopUp.subHeader")}
            </div>
            <div className={styles.autoTopUpSwitchWrapper}>
              <Checkbox
                className={styles.autoTopUpSwitch}
                toggle
                fitted
                checked={autoTopupSettings?.is_auto_top_up_enabled}
                onChange={changeEnable}
              />
              <label
                className={`${styles.autoTopUpSwitchLabel} ${
                  autoTopupSettings?.is_auto_top_up_enabled
                    ? styles.autoTopUpSwitchOn
                    : ""
                }`}
              >
                {autoTopupSettings?.is_auto_top_up_enabled
                  ? t("settings.billing.topupCredit.autoTopUp.isEnable.on")
                  : t("settings.billing.topupCredit.autoTopUp.isEnable.off")}
              </label>
            </div>
            <div className={styles.minimumBalanceWrapper}>
              <div className={styles.minimumBalanceTitle}>
                {t(
                  "settings.billing.topupCredit.autoTopUp.minimumBalance.header"
                )}
              </div>
              <p className="subHeader">
                {t(
                  "settings.billing.topupCredit.autoTopUp.minimumBalance.subHeader"
                )}
              </p>
              <Dropdown
                options={autoTopUpOpts?.minimumBalances}
                disabled={!autoTopupSettings?.is_auto_top_up_enabled}
                scrolling
                value={autoTopupSettings?.minimum_balance?.amount ?? ""}
                onChange={changeMinBalance}
              />
            </div>
            <div className={styles.minimumBalanceWrapper}>
              <div className={styles.minimumBalanceTitle}>
                {t(
                  "settings.billing.topupCredit.autoTopUp.autoTopUpValue.header"
                )}
              </div>
              <p className="subHeader">
                {t(
                  "settings.billing.topupCredit.autoTopUp.autoTopUpValue.subHeader"
                )}
              </p>
              <Dropdown
                options={autoTopUpOpts?.autoTopUpPlans}
                disabled={!autoTopupSettings?.is_auto_top_up_enabled}
                scrolling
                value={autoTopupSettings?.auto_top_up_plan?.id ?? ""}
                onChange={changeAutoTopUpPlan}
              />
            </div>
            <Button
              className={styles.autoTopUpSaveBtn}
              customSize="mid"
              onClick={() => {
                setVisibleAutoTopUpModal(true);
              }}
            >
              {t("settings.billing.topupCredit.autoTopUp.button.save")}
            </Button>
          </div>
          <div className="container add-topup">
            <div className="header">
              {t("settings.billing.topupCredit.manualTopUp.header")}
            </div>
            <div className="subHeader">
              {t("settings.billing.topupCredit.manualTopUp.subHeader")}
            </div>
            <SettingTopUpPlanSelection
              topUpPlans={topUpCreditPlans}
              submitPayment={submitPayment}
            />
          </div>
          <Modal open={visibleAutoTopUpModal} size="tiny">
            <div className={styles.autoTopUpModal}>
              {autoTopupSettings?.is_auto_top_up_enabled ? (
                <>
                  <div className={styles.header}>
                    {t(
                      "settings.billing.topupCredit.autoTopUp.modal.turnOn.header"
                    )}
                  </div>
                  <p className={styles.subHeader}>
                    {t(
                      "settings.billing.topupCredit.autoTopUp.modal.turnOn.subHeader"
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className={styles.header}>
                    {t(
                      "settings.billing.topupCredit.autoTopUp.modal.turnOff.header"
                    )}
                  </div>
                  <p className={styles.subHeader}>
                    {t(
                      "settings.billing.topupCredit.autoTopUp.modal.turnOff.subHeader"
                    )}
                  </p>
                </>
              )}

              <div>
                <Button
                  className={styles.cancelBtn}
                  customSize="mid"
                  onClick={() => {
                    setVisibleAutoTopUpModal(false);
                  }}
                  loading={autoTopUpLoading}
                >
                  {t("settings.billing.topupCredit.autoTopUp.button.cancel")}
                </Button>
                <Button
                  customSize="mid"
                  onClick={submitAutoTopUp}
                  primary
                  loading={autoTopUpLoading}
                >
                  {t("settings.billing.topupCredit.autoTopUp.button.confirm")}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </Dimmer.Dimmable>
  );
}
