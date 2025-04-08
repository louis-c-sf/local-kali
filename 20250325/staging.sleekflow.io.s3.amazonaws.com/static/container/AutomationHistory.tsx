import React from "react";
import { useTranslation } from "react-i18next";
import Helmet from "react-helmet";
import { PostLogin } from "../component/Header";
import AutomationHistoryContent from "../component/AssignmentRules/AutomationHistory/AutomationHistoryContent";

function AutomationHistory() {
  const { t } = useTranslation();
  const pageName = t("nav.automation.historyPage");

  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Automation"} />
      <Helmet title={t("nav.common.title", { page: pageName })} />
      <AutomationHistoryContent />
    </div>
  );
}

export default AutomationHistory;
