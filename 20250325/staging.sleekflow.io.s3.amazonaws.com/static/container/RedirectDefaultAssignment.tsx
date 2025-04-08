import useFetchAutomationRules from "api/Company/useFetchAutomationRules";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import fetchAutomationRules from "../api/Company/fetchAutomationRules";
import { isDefaultAssignmentRule } from "../component/AssignmentRules/filters";
import useRouteConfig from "../config/useRouteConfig";
import AssignmentResponseType from "../types/AssignmentRuleType";
import RedirectionPage from "./RedirectionPage";

function RedirectDefaultAssignment() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { automationRules, refreshAutomationRules } = useFetchAutomationRules();
  useEffect(() => {
    if (!automationRules?.length) {
      refreshAutomationRules();
    } else {
      const defaultAssignmentRuleId = automationRules?.find(
        isDefaultAssignmentRule
      )?.id;
      history.push(routeTo(`/automations/edit/${defaultAssignmentRuleId}`));
    }
  }, [automationRules?.map((s) => s.id).join()]);

  return <RedirectionPage />;
}

export default RedirectDefaultAssignment;
