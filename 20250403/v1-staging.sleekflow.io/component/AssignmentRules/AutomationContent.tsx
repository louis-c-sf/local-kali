import React, { useEffect } from "react";
import AutomationTable from "./AutomationTable";
import Cookie from "js-cookie";
import { useCompanyStaff } from "../../api/User/useCompanyStaff";
import useFetchAutomationRules from "../../api/Company/useFetchAutomationRules";
import { useAppDispatch } from "../../AppRootContext";
import { FlowBuilderBanner } from "./FlowBuilderBanner/FlowBuilderBanner";
import { useTranslation } from "react-i18next";

export default AutomationContent;

function AutomationContent() {
  const loginDispatch = useAppDispatch();
  const { booted } = useFetchAutomationRules();
  useCompanyStaff();
  const { t } = useTranslation();

  useEffect(() => {
    if (!booted) {
      return;
    }
    if (Cookie.get("isDisplayedAutomationGuide") === undefined) {
      loginDispatch({
        type: "SHOW_AUTOMATION_GUIDE",
      });
    }
  }, [booted]);

  return (
    <div className={`assignment-rules main-primary-column flow-builder`}>
      <div className="title">{t("automation.title")}</div>
      <FlowBuilderBanner />
      <AutomationTable />
    </div>
  );
}
