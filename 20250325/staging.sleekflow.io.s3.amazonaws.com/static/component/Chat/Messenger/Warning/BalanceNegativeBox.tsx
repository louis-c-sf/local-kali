import React from "react";
import styles from "./BalanceNegativeBox.module.css";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { LoginType } from "types/LoginType";

export function isCloudApiBalanceNegativeSelector(s: LoginType): boolean {
  const selectedChannelIdFromConversation = s.selectedChannelIdFromConversation;
  const whatsappCloudApiConfigs = s.company?.whatsappCloudApiConfigs;
  const usageRecords = s.company?.whatsappCloudApiUsageRecords;
  const facebookWabaBusinessId = whatsappCloudApiConfigs?.find(
    (config) => config.whatsappPhoneNumber === selectedChannelIdFromConversation
  )?.facebookWabaBusinessId;
  if (!facebookWabaBusinessId || !usageRecords) {
    return false;
  }
  const balance = usageRecords.find(
    (r) =>
      r.facebook_business_wabas.some(
        (waba) => waba.facebook_waba_id === selectedChannelIdFromConversation
      ) || r.facebook_business_id === facebookWabaBusinessId
  );
  return (balance?.balance.amount || 0) < 0;
}

export default function BalanceNegativeBox() {
  const { routeTo } = useRouteConfig();

  return (
    <div className={`twilio-info-message ${styles.warning}`}>
      <Trans i18nKey={"chat.cloudApi.reply.balanceNegative"}>
        Insufficient balance. Please
        <Link to={routeTo("/settings/topup")} className={styles.link}>
          top up
        </Link>
        your account to send out message.
      </Trans>
    </div>
  );
}
