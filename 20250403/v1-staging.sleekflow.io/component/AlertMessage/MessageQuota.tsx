import React, { useEffect, useState } from "react";
import { Portal } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { CloseButton } from "../Banner/ChannelConnectionBanner";
import { useAppSelector } from "../../AppRootContext";
import { equals, pick } from "ramda";

export const TRIAL_ALERT_OFFSET = 1;
export const CONTACT_EXCEED_OFFSET = 1;
export const BASE_BANNER_OFFSET = 40;
export default function MessageQuote() {
  const { isContactExceed, isTrialAlert, usage } = useAppSelector(
    pick(["currentPlan", "isContactExceed", "isTrialAlert", "usage"]),
    equals
  );
  const totalMessage = usage.maximumAutomatedMessages;
  const messageSent = usage.totalMessagesSentFromSleekflow;
  const [displayMessage, setDisplayMessage] = useState<boolean>(false);
  const { t } = useTranslation();

  let offsetTop = 0;

  if (isContactExceed) {
    offsetTop += CONTACT_EXCEED_OFFSET;
  }
  if (isTrialAlert) {
    offsetTop += TRIAL_ALERT_OFFSET;
  }
  if (offsetTop > 0) {
    offsetTop = BASE_BANNER_OFFSET * offsetTop;
  }

  useEffect(() => {
    if (totalMessage > 0) {
      const condition = messageSent / totalMessage >= 0.95;
      setDisplayMessage(condition);
    }
  }, [messageSent, totalMessage]);

  const hideMessage = () => {
    setDisplayMessage(false);
  };
  return (
    <Portal open={displayMessage} mountNode={document.body}>
      <div
        style={{ top: offsetTop }}
        className="top-display-banner alert-message"
      >
        <div className="message-quota">
          <div className="message">
            {t("account.messageQuota.alert", {
              n: messageSent,
              max: totalMessage,
            })}
            {` `}
            <Trans i18nKey={"account.messageQuota.upgrade"}>
              <Link to={"/settings/plansubscription"} className="link2">
                Upgrade
              </Link>
              to avoid restrictions.
            </Trans>
          </div>
          <CloseButton onClick={hideMessage} />
        </div>
      </div>
    </Portal>
  );
}
