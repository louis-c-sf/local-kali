import React, { useEffect, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router";
import styles from "./AutomationRuleEdit.module.css";
import { PostLogin } from "../component/Header";
import Helmet from "react-helmet";
import RuleEditForm from "../component/AssignmentRules/AutomationRuleEdit/RuleEditForm";
import {
  presetTemplates,
  RuleTemplateType,
} from "../component/AssignmentRules/AutomationRuleEdit/templates";
import { useConditionFieldBuilder } from "../component/AssignmentRules/AutomationRuleEdit/useConditionFieldBuilder";
import { Dimmer, Loader } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../config/useRouteConfig";
import useFetchCompany from "../api/Company/useFetchCompany";
import { AutomationTypeEnum } from "../types/AssignmentRuleType";
import { useLocation } from "react-router-dom";
import { useAutomationRulesLocalized } from "../component/AssignmentRules/AutomationRuleEdit/localizable/useAutomationRulesLocalized";
import { useTeams } from "./Settings/useTeams";
import useFetchAutomationRules from "../api/Company/useFetchAutomationRules";
import { useAppSelector } from "../AppRootContext";
import { useCurrentUtcOffset } from "../component/Chat/hooks/useCurrentUtcOffset";
import { CreateRule } from "../component/AssignmentRules/AutomationRuleEdit/CreateRule/CreateRule";
import { equals } from "ramda";

export const AUTOMATION_MAIN_NODE_ID = "automation-main-node";

function AutomationRuleEdit() {
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation<{
    selectedTriggerType?: AutomationTypeEnum;
    backToType?: AutomationTypeEnum;
  }>();
  const {
    fieldFactory,
    newFieldFactory,
    booted: factoryBooted,
  } = useConditionFieldBuilder();

  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const staffList = useAppSelector((s) => s.staffList, equals);
  const utcOffset = useCurrentUtcOffset();
  const initialType = location.state?.selectedTriggerType;
  const backToType = location.state?.backToType;
  const [templateChosen, setTemplateChosen] = useState<RuleTemplateType>();
  const isNewRecord = !Boolean(id);
  const isTemplateChoiceVisible = isNewRecord && !templateChosen;
  const { getBaseTemplates } = useAutomationRulesLocalized();
  const { refreshCompany } = useFetchCompany();
  const [templates, setTemplates] = useState<RuleTemplateType[]>([]);
  const {
    refreshTeams,
    booted: teamsBooted,
    loading: teamsLoading,
  } = useTeams();

  const {
    getLiveData,
    refreshAutomationRules,
    automationRules,
    automationRulesLoading,
    booted: rulesBooted,
  } = useFetchAutomationRules();

  useEffect(() => {
    if (teamsBooted || teamsLoading) {
      return;
    }
    refreshTeams();
  }, [teamsBooted, teamsLoading]);

  useEffect(() => {
    if (
      rulesBooted ||
      !automationRulesLoading ||
      !factoryBooted ||
      isNewRecord
    ) {
      return;
    }
    refreshAutomationRules();
  }, [rulesBooted, automationRulesLoading, isNewRecord, factoryBooted]);

  useEffect(() => {
    refreshCompany();
  }, []);

  useEffect(() => {
    if (factoryBooted) {
      const templatesGenerator = presetTemplates(
        newFieldFactory,
        staffList,
        utcOffset,
        t
      );
      setTemplates(Array.from(templatesGenerator));
    }
  }, [factoryBooted]);

  useEffect(() => {
    if (initialType) {
      const baseTemplate = getBaseTemplates();
      const template = [...baseTemplate, ...templates].find(
        (t) => t.id === initialType
      );
      if (template) {
        setTemplateChosen(template);
      }
    }
  }, [initialType, templates]);

  const handleCancel = () => {
    history.replace({
      pathname: routeTo("/automations"),
      state: { selectTriggerType: backToType },
    });
  };

  const goBack = () =>
    history.replace({
      pathname: routeTo("/automations"),
      state: {
        selectTriggerType: backToType,
      },
    });

  let extraStyles = [styles.main];
  if (!isTemplateChoiceVisible) {
    extraStyles.push(styles.edit);
  }

  const pageName = t("nav.automation.editPage");

  const ruleModel = !automationRulesLoading
    ? automationRules?.find((a) => a.id === id)
    : undefined;
  const dataBooted = factoryBooted && Boolean(isNewRecord || ruleModel);
  if (dataBooted && !isNewRecord && !ruleModel) {
    return <Redirect to={"/automations"} />;
  }

  return (
    <div className={`post-login ${isTemplateChoiceVisible ? "solid" : ""}`}>
      <Helmet title={t("nav.common.title", { page: pageName })} />
      <PostLogin selectedItem={"Assignment"} dimmed={isTemplateChoiceVisible} />
      <div className={`main assignment-edit ${extraStyles.join(" ")}`}>
        <div
          className={`main-primary-column ${styles.component}`}
          id={AUTOMATION_MAIN_NODE_ID}
        >
          {!dataBooted && (
            <Dimmer inverted active>
              <Loader inverted={true} active />
            </Dimmer>
          )}

          {dataBooted &&
            (isTemplateChoiceVisible ? (
              <CreateRule
                onCancel={handleCancel}
                onTemplateChosen={setTemplateChosen}
                templates={templates}
              />
            ) : (
              <RuleEditForm
                goBack={goBack}
                ruleModel={ruleModel}
                isNewRecord={isNewRecord}
                templateChosen={templateChosen}
                fieldFactory={fieldFactory}
                newFieldFactory={newFieldFactory}
                liveRulesCount={getLiveData()}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default AutomationRuleEdit;
