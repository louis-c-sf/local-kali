import React from "react";
import styles from "../../component/CreateWhatsappFlow/AllSet.module.css";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "../shared/Button/Button";
import {
  BusinessVerificationStatusDict,
  BusinessVerificationStatusDictEnum,
  MessagingLimitMapping,
  WhatsappNameStatusEnum,
} from "./types";
import WhatsappIcon from "../../assets/images/channels/whatsapp.svg";
import { Dimmer, Image, Loader } from "semantic-ui-react";
import { parseAndFormatAnyPhone } from "component/Channel/selectors";
import StatusAlert, { StatusType } from "component/shared/StatusAlert";
import useFetchUsageRecord from "api/CloudAPI/useFetchUsageRecord";
import { useHistory } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { formatCurrency } from "utility/string";
import { ReviewDataType } from "container/Onboarding/migrateNumber/types";
import useFetchCompany from "api/Company/useFetchCompany";

const BusinessVerificationStatusColorMap: Record<
  BusinessVerificationStatusDictEnum,
  string
> = {
  [BusinessVerificationStatusDict.Unknown]: styles.red,
  [BusinessVerificationStatusDict.Failed]: styles.red,
  [BusinessVerificationStatusDict.Rejected]: styles.red,
  [BusinessVerificationStatusDict.Not_verified]: styles.red,
  [BusinessVerificationStatusDict.Pending]: styles.orange,
  [BusinessVerificationStatusDict.Pending_need_more_info]: styles.orange,
  [BusinessVerificationStatusDict.Pending_submission]: styles.orange,
  [BusinessVerificationStatusDict.Verified]: styles.green,
};

const WhatsappNameStatusColorMap: Record<WhatsappNameStatusEnum, string> = {
  [WhatsappNameStatusEnum.Approved]: styles.green,
  [WhatsappNameStatusEnum.None]: styles.red,
  [WhatsappNameStatusEnum.Unknown]: styles.orange,
};

export function AllSet(props: {
  selectedNewNumber: ReviewDataType | undefined;
  hasTopUp?: boolean;
}) {
  const { t } = useTranslation();
  const { selectedNewNumber, hasTopUp } = props;
  const history = useHistory();
  const getWhatsappNameStatusColor = (value: string) => {
    const isInclude = [
      WhatsappNameStatusEnum.Approved,
      WhatsappNameStatusEnum.None,
    ].includes(value as WhatsappNameStatusEnum);
    return isInclude
      ? WhatsappNameStatusColorMap[value]
      : WhatsappNameStatusColorMap[WhatsappNameStatusEnum.Unknown];
  };
  const { routeTo } = useRouteConfig();
  const convertString = (value: string | undefined) => {
    return value?.toUpperCase().replace("_", " ");
  };
  const { refreshCompany } = useFetchCompany();

  function getBusinessVerificationStatusColor() {
    return BusinessVerificationStatusColorMap[
      selectedNewNumber?.businessVerificationStatus ??
        BusinessVerificationStatusDict.Unknown
    ];
  }

  const { loading, usageRecords } = useFetchUsageRecord();
  const balance = usageRecords.find(
    (s) =>
      s.facebook_business_wabas.some(
        (waba) =>
          waba.facebook_waba_id === selectedNewNumber?.facebookPhoneNumberId
      ) || s.facebook_business_id === selectedNewNumber?.facebookWabaBusinessId
  );

  const isNotEnoughBalance = balance ? balance.balance?.amount <= 20 : false;
  return (
    <Dimmer.Dimmable
      className={`${flowStyles.contentContainer} ${styles.allSetContainer}`}
    >
      {loading || !balance ? (
        <Dimmer active={loading || !balance} inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <>
          <div className={flowStyles.intro}>
            {hasTopUp ? (
              <div className={styles.cheers} />
            ) : (
              <div className={styles.icon}>
                <Image src={WhatsappIcon} />
              </div>
            )}
            <div className={styles.header}>
              {hasTopUp
                ? t("onboarding.cloudApi.allSet.header")
                : "WhatsApp | Sleekflow"}
            </div>
            <div className={styles.subHeader}>
              {hasTopUp
                ? t("onboarding.cloudApi.allSet.subHeader")
                : t("onboarding.cloudApi.allSet.viewDetailSubHeader")}
            </div>
          </div>
          <div className={styles.gridContainer}>
            <div className={styles.key}>
              {t("onboarding.cloudApi.common.columns.businessAccount")}
            </div>
            <div className={styles.value}>
              {selectedNewNumber?.businessAccount}
            </div>
            <div className={styles.key}>
              {t("onboarding.cloudApi.common.columns.phoneNumber")}
            </div>
            <div className={styles.value}>
              {parseAndFormatAnyPhone(selectedNewNumber?.phoneNumber ?? "")}
            </div>
            <div className={styles.key}>
              {t("onboarding.cloudApi.common.columns.displayName")}
            </div>
            <div className={styles.value}>{selectedNewNumber?.displayName}</div>
            <div className={styles.key}>
              {t("onboarding.cloudApi.common.columns.channelName")}
            </div>
            <div className={styles.value}>{selectedNewNumber?.channelName}</div>
            {selectedNewNumber?.facebookWabaBusinessName && (
              <>
                <div className={styles.key}>
                  {t("onboarding.cloudApi.common.columns.facebookBusinessName")}
                </div>
                <div className={styles.value}>
                  {selectedNewNumber?.facebookWabaBusinessName}
                </div>
              </>
            )}
            <div className={styles.key}>
              {t(
                "onboarding.cloudApi.common.columns.businessVerificationStatus"
              )}
            </div>
            <div
              className={`${
                styles.value
              } ${getBusinessVerificationStatusColor()}`}
            >
              {convertString(selectedNewNumber?.businessVerificationStatus)}
            </div>
            <div className={styles.key}>
              {t("onboarding.cloudApi.common.columns.whatsappNameStatus")}
            </div>
            <div
              className={`${styles.value} ${getWhatsappNameStatusColor(
                selectedNewNumber?.whatsappNameStatus ?? "unknown"
              )}`}
            >
              {convertString(selectedNewNumber?.whatsappNameStatus)}
            </div>
            <div className={styles.key}>
              {t("onboarding.cloudApi.common.columns.messagingLimit")}
            </div>
            <div className={styles.value}>
              {selectedNewNumber?.messagingLimit
                ? MessagingLimitMapping[selectedNewNumber?.messagingLimit]
                : 0}
            </div>
          </div>
          {balance && (
            <BalanceStatusAlert isExceededBalance={isNotEnoughBalance} />
          )}
          <div className={styles.currentCredit}>
            {t("onboarding.cloudApi.common.balance.credit.amount", {
              balance: formatCurrency(balance.balance.amount),
            })}
          </div>
          <div className={styles.creditInstruction}>
            {t("onboarding.cloudApi.common.balance.credit.instruction")}
          </div>
          <div className={styles.creditInstruction}>
            <Trans
              i18nKey={"onboarding.cloudApi.common.balance.credit.estimation"}
            >
              Estimate your messaging costs with
              <a
                className="link"
                href="https://sleekflow.io/whatsapp-pricing-calculator"
                target="_blank"
                rel="noopener noreferrer"
              >
                SleekFlow’s WhatsApp Pricing Calculator
              </a>
              .
            </Trans>
          </div>
          <div className={styles.buttonContainer}>
            {hasTopUp && (
              <Button
                primary
                fluid
                centerText
                customSize={"mid"}
                onClick={() => {
                  history.push(routeTo("/settings/topup"));
                }}
              >
                {isNotEnoughBalance
                  ? t("onboarding.cloudApi.common.button.topUpNow")
                  : t("onboarding.cloudApi.common.button.goToSetting")}
              </Button>
            )}
            <Button
              onClick={() => {
                refreshCompany();
                history.push(routeTo("/channels"));
              }}
              blue
              fluid
              centerText
              customSize={"mid"}
            >
              {t("form.button.backToChannels")}
            </Button>
          </div>
        </>
      )}
    </Dimmer.Dimmable>
  );
}

function BalanceStatusAlert(props: { isExceededBalance: boolean }) {
  const { t } = useTranslation();
  let statusValue = {
    type: "info" as StatusType,
    headerText: "",
  };
  if (props.isExceededBalance) {
    statusValue = {
      type: "warning",
      headerText: t("onboarding.cloudApi.common.balance.credit.alert"),
    };
  }
  return (
    <StatusAlert {...statusValue}>
      {t("onboarding.cloudApi.common.balance.credit.message")}
    </StatusAlert>
  );
}
