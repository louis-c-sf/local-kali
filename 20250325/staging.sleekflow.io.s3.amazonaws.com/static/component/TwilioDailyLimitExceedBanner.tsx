import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Portal } from "semantic-ui-react";
import { useAppSelector } from "../AppRootContext";
import { CloseButton } from "./shared/CloseButton";

export default function TwilioDailyLimitExceedBanner() {
  const { t } = useTranslation();
  const isLimitExceeded = useAppSelector(
    (s) => s.company?.isExceededTwilioDailyLimit
  );
  const [open, setIsOpen] = useState(false);

  const closeButtonClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Portal open={open && (isLimitExceeded ?? false)} mountNode={document.body}>
      <div className={`top-display-banner alert-message`}>
        <div className="content">
          <div className="message">
            {t("chat.twilio.error.exceedTwilioLimit")}
          </div>
        </div>
        <CloseButton onClick={closeButtonClick} />
      </div>
    </Portal>
  );
}
