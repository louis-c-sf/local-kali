import { equals, pick } from "ramda";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Portal } from "semantic-ui-react";
import { POST_COMPANY_FIELD } from "../../../api/apiPath";
import { post } from "../../../api/apiRequest";
import { useAppSelector } from "../../../AppRootContext";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { isOwner } from "../../Settings/helpers/AccessRulesGuard";
import { useAccessRulesGuard } from "../../Settings/hooks/useAccessRulesGuard";
import { CloseButton } from "../ChannelConnectionBanner";
import {
  BannerOrderAndClassNameList,
  getIsCurrentBannerShow,
} from "../helper/getIsCurrentBannerShow";
import { BannerEnum } from "../types/BannerEnum";
import styles from "./BookMeetingBanner.module.css";
import useGetBookDemoLink from "../../Onboarding/GetStarted/useGetBookDemoLink";

export default function BookMeetingBanner() {
  const [visible, setVisible] = useState(false);
  const { company, staffList, user } = useAppSelector(
    pick(["company", "staffList", "user"]),
    equals
  );
  const accesssRuleGuard = useAccessRulesGuard();
  const companyChannels = useCompanyChannels();
  const currentBanner = BannerEnum.bookMeeting;
  const ref = document.body;
  const isBookMeetingBannerClosed = useAppSelector(
    (s) =>
      s.company?.companyCustomFields.find(
        (field) => field.fieldName === "BookMeeting"
      )?.value
  );
  const isOpen =
    getIsCurrentBannerShow(ref, currentBanner) &&
    accesssRuleGuard.isOpenBookMeetingBanner() &&
    isOwner(staffList, user) &&
    companyChannels.filter((c) => c.type !== "web").length === 0;
  const demoLink = useGetBookDemoLink();

  const { t } = useTranslation();
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  function closeButtonClick() {
    setVisible(false);
    try {
      post(POST_COMPANY_FIELD, {
        param: [
          {
            category: "Banner",
            fieldName: "BookMeeting",
            companyCustomFieldFieldLinguals: [],
            type: "Boolean",
            isEditable: true,
            isVisible: true,
            value: true,
          },
        ],
      });
    } catch (e) {
      console.error(`create companyCustomField ${e}`);
    } finally {
      delete ref.dataset[
        BannerOrderAndClassNameList.inviteUserAutomationBanner
      ];
    }
  }

  if (!company || !isOpen) {
    return null;
  }
  if (isBookMeetingBannerClosed) {
    return null;
  }
  if (isOpen && visible) {
    ref.dataset[BannerOrderAndClassNameList.bookMeetingBanner] = "true";
  }
  const action = (
    <div className="action">
      <a
        className="ui button primary"
        href={demoLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("account.bookMeetingBanner.button.bookNow")}
      </a>
    </div>
  );
  const text = t("account.bookMeetingBanner.content");
  return (
    <Portal open={isOpen && visible} mountNode={ref}>
      <div className={`top-display-banner ${styles.banner}`}>
        <div className="content">
          {text}
          {action}
        </div>
        <CloseButton onClick={closeButtonClick} />
      </div>
    </Portal>
  );
}
