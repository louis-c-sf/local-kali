import React, { useEffect, useState } from "react";
import AutomationContent from "../component/AssignmentRules/AutomationContent";
import Helmet from "react-helmet";
import AssignmentLock from "../component/AssignmentRules/AssignmentLock";
import { havingActiveBillRecord } from "../component/Channel/ChannelSelection";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../AppRootContext";
import { equals, pick } from "ramda";

export default AssignmentRules;

function AssignmentRules() {
  const [isStandardBillRecord, setIsStandardBillRecord] = useState(false);
  const { company } = useAppSelector(pick(["company"]), equals);
  const { t } = useTranslation();

  useEffect(() => {
    if (company) {
      if (company.billRecords.length > 0) {
        const latesttBillRecord = company.billRecords.find(
          havingActiveBillRecord
        );
        setIsStandardBillRecord(
          latesttBillRecord?.subscriptionPlan.id
            .toLowerCase()
            .endsWith("standard") || false
        );
      }
    }
  }, [company?.id]);

  const pageName = t("nav.menu.automations");

  return (
    <div className={`main assignment-content`}>
      <Helmet title={t("nav.common.title", { page: pageName })} />
      {(isStandardBillRecord && <AssignmentLock />) || <AutomationContent />}
    </div>
  );
}
