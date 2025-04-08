import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Portal } from "semantic-ui-react";
import { CloseButton } from "../Banner/ChannelConnectionBanner";
import { useAppSelector } from "../../AppRootContext";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import { equals } from "ramda";

export default function WhatsappCreditExceed() {
  const company = useAppSelector((s) => s.company, equals);
  const [displayMessage, setDisplayMessage] = useState<boolean>(false);
  const { t } = useTranslation();
  const accessGuard = useAccessRulesGuard();
  const hideMessage = () => {
    setDisplayMessage(false);
  };
  const isDeprecated =
    process.env.REACT_APP_FEATURE_DEPRECATION?.split(",").includes(
      "whatsappBilling"
    );
  useEffect(() => {
    if (company?.id) {
      const [firstTwilioRecord] = company.twilioUsageRecords!;
      if (firstTwilioRecord && accessGuard.isTwilioSubaccount()) {
        const balance = firstTwilioRecord.balance;
        setDisplayMessage(balance > 0 && balance < 20);
      }
    }
  }, [company?.id]);

  return (
    <Portal open={displayMessage} mountNode={document.body}>
      <div className={`top-display-banner alert-message`}>
        <div className="message">
          {t("account.whatsappCreditLimit.alert")}
          <a
            href={
              isDeprecated
                ? `https://${process.env.REACT_APP_V2_PATH}/channels/whatsapp/billing`
                : `/settings/topup`
            }
            className="ui button"
          >
            {t("account.whatsappCreditLimit.button.accountTopUp")}
          </a>
        </div>
        <CloseButton onClick={hideMessage} />
      </div>
    </Portal>
  );
}
