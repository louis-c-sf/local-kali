import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Portal } from "semantic-ui-react";
import { CloseButton } from "../Banner/ChannelConnectionBanner";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import { useAppSelector } from "../../AppRootContext";

export default function WhatsAppSuspend() {
  const company = useAppSelector((s) => s.company);
  const [displayMessage, setDisplayMessage] = useState<boolean>(false);
  const { t } = useTranslation();
  const accessGuard = useAccessRulesGuard();
  const hideMessage = () => {
    setDisplayMessage(false);
  };

  useEffect(() => {
    if (company?.id) {
      const [firstTwilioRecord] = company.twilioUsageRecords!;
      if (firstTwilioRecord && accessGuard.isTwilioSubaccount()) {
        const balance = firstTwilioRecord.balance;
        setDisplayMessage(balance < 0);
      }
    }
  }, [company?.id]);
  return (
    <Portal open={displayMessage} mountNode={document.body}>
      <div className={`top-display-banner alert-message`}>
        <div className="message">
          {t("account.whatsappSuspend.alert")}
          <Link to={"/settings/topup"} className="ui button">
            {t("account.whatsappSuspend.button.accountTopUp")}
          </Link>
        </div>
        <CloseButton onClick={hideMessage} />
      </div>
    </Portal>
  );
}
