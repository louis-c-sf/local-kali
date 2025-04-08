import React, { useEffect } from "react";
import { Portal } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { BASE_BANNER_OFFSET, TRIAL_ALERT_OFFSET } from "./MessageQuota";
import { Trans, useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals, pick } from "ramda";

import { CloseButton } from "../Banner/ChannelConnectionBanner";

export default function ContactExceed() {
  const { isContactExceed, isTrialAlert, usage } = useAppSelector(
    pick(["isContactExceed", "isTrialAlert", "usage"]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();

  let offsetTop = 0;
  if (isTrialAlert) {
    offsetTop = BASE_BANNER_OFFSET * TRIAL_ALERT_OFFSET;
  }

  useEffect(() => {
    const totalNumOfContact = usage.maximumContacts;
    const numOfContact = usage.totalContacts;
    if (totalNumOfContact > 0) {
      const condition =
        numOfContact / totalNumOfContact >= 0.95 &&
        numOfContact < totalNumOfContact;
      loginDispatch({ type: "IS_CONTACT_EXCEED_LIMIT", isExceed: condition });
    }
  }, [usage.totalContacts, usage.maximumContacts]);

  const hideMessage = () => {
    loginDispatch({ type: "IS_CONTACT_EXCEED_LIMIT", isExceed: false });
  };

  return (
    <Portal mountNode={document.body} open={isContactExceed}>
      <div
        className="top-display-banner alert-message"
        style={{ top: offsetTop }}
      >
        <div className="contact-quota">
          <div className="message">
            {t("account.trial.contactQuota.alert", {
              n: usage.totalContacts,
              max: usage.maximumContacts,
            })}
            <Trans i18nKey={"account.trial.contactQuota.upgrade"}>
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
