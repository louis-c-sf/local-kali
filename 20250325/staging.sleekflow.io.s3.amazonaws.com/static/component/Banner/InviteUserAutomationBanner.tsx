import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Portal } from "semantic-ui-react";
import { CloseButton } from "./ChannelConnectionBanner";
import Cookies from "js-cookie";
import { isOwner } from "../Settings/helpers/AccessRulesGuard";
import useRouteConfig from "../../config/useRouteConfig";
import { isDefaultAssignmentRule } from "../AssignmentRules/filters";
import { equals, pick } from "ramda";
import { useAppSelector } from "../../AppRootContext";
import { post } from "../../api/apiRequest";
import { POST_COMPANY_FIELD } from "../../api/apiPath";
import {
  BannerOrderAndClassNameList,
  getIsCurrentBannerShow,
} from "./helper/getIsCurrentBannerShow";
import { BannerEnum } from "./types/BannerEnum";
import fetchAutomationRules from "api/Company/fetchAutomationRules";

export default function InviteUserAutomationBanner() {
  const { company, staffList, user } = useAppSelector(
    pick(["company", "staffList", "user"]),
    equals
  );
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const isInvitationBannerClosed = useAppSelector(
    (s) =>
      s.company?.companyCustomFields.find(
        (field) => field.fieldName === "InviteUserAutomation"
      )?.value
  );
  const [visible, setVisible] = useState(false);
  const ref = document.body;
  const currentBanner = BannerEnum.inviteUserAutomation;
  const [defaultAutomationRuleId, setDefaultAutomationRuleId] = useState("");
  const isOpen =
    getIsCurrentBannerShow(ref, currentBanner) &&
    staffList.length > 1 &&
    isOwner(staffList, user) &&
    !Cookies.get("invite_automation");

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOpen]);
  useEffect(() => {
    let isMount = true;
    fetchAutomationRules(company?.id).then((res) => {
      if (isMount) {
        setDefaultAutomationRuleId(
          res?.find(isDefaultAssignmentRule)?.assignmentId ?? ""
        );
      }
    });
    return () => {
      isMount = false;
    };
  }, []);

  const videoLink = i18n.language.startsWith("zh")
    ? "https://www.youtube.com/watch?v=46izJxpDX00"
    : "https://www.youtube.com/watch?v=2TLwnYwJ488";
  const action = (
    <div className="action">
      <div
        className="ui button primary"
        onClick={() => {
          history.push(routeTo(`/automations/edit/${defaultAutomationRuleId}`));
        }}
      >
        {t("account.inviteUserBanner.button.defaultAssignmentRule")}
      </div>
      <a target="_blank" className="ui button" href={videoLink}>
        {t("account.inviteUserBanner.button.watchTutorial")}
      </a>
    </div>
  );
  const text = t("account.inviteUserBanner.invitedAutomation");

  if (isInvitationBannerClosed) {
    return null;
  }

  const closeButtonClick = () => {
    setVisible(false);
    try {
      post(POST_COMPANY_FIELD, {
        param: [
          {
            category: "Banner",
            fieldName: "InviteUserAutomation",
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
  };
  if (!company || !isOpen) {
    return null;
  }
  if (isOpen && visible) {
    ref.dataset[BannerOrderAndClassNameList.inviteUserAutomationBanner] =
      "true";
  }

  return (
    <Portal open={isOpen && visible} mountNode={ref}>
      <div className={`top-display-banner invite-user-automation`}>
        <div className="content">
          {text}
          {action}
        </div>
        <CloseButton onClick={closeButtonClick} />
      </div>
    </Portal>
  );
}
