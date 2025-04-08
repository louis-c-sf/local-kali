import React, { useEffect, useState } from "react";
import styles from "./AutomationTask.module.css";
import onboardingStyles from "./Onboarding.module.css";
import Accordion from "./components/Accordion";
import BadgeTag from "../../shared/BadgeTag/BadgeTag";
import AutomationIcon from "./assets/automation.svg";
import { Divider, Image } from "semantic-ui-react";
import { Button } from "../../shared/Button/Button";
import { Link } from "react-router-dom";
import useRouteConfig, { routeToType } from "config/useRouteConfig";
import iconStyles from "../../shared/Icon/Icon.module.css";
import ruleImg from "./assets/rule.svg";
import { useTranslation } from "react-i18next";
import fetchAutomationRules from "api/Company/fetchAutomationRules";
import { TFunction } from "i18next";
import useFetchAutomationRules from "api/Company/useFetchAutomationRules";

const getRules = (
  t: TFunction,
  routeTo: routeToType,
  defaultTemplateId: string
) => [
  {
    title: t(
      "onboarding.getStarted.quickStart.automationTask.action1.assignRule"
    ),
    desc: t(
      "onboarding.getStarted.quickStart.automationTask.action1.assignRuleDesc"
    ),
    link: routeTo(`/automations/edit/${defaultTemplateId}`),
  },
  {
    title: t(
      "onboarding.getStarted.quickStart.automationTask.action1.offReply"
    ),
    desc: t(
      "onboarding.getStarted.quickStart.automationTask.action1.offReplyDesc"
    ),
    link: {
      pathname: routeTo("/automations/create"),
      state: { selectedTriggerType: "autoreplyOffBusinessHoursWeekdays" },
      search: "quickStart=offBusiness",
    },
  },
  {
    title: t(
      "onboarding.getStarted.quickStart.automationTask.action1.keywordReply"
    ),
    desc: t(
      "onboarding.getStarted.quickStart.automationTask.action1.keywordReplyDesc"
    ),
    link: {
      pathname: routeTo("/automations/create"),
      state: { selectedTriggerType: "autoreplyKeywords" },
      search: "quickStart=keywords",
    },
  },
];

export default function AutomationTask(props: {
  isComplete: boolean;
  isAutomationRuleAdded: boolean;
  isQuickReplyAdded: boolean;
}) {
  const { isComplete, isAutomationRuleAdded, isQuickReplyAdded } = props;
  const [defaultTemplateId, setDefaultTemplateId] = useState("");
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const rules = getRules(t, routeTo, defaultTemplateId);
  const { automationRules } = useFetchAutomationRules();

  useEffect(() => {
    if (automationRules?.length) {
      const defaultTemplate = automationRules.find(
        (template) => template.isDefault
      );
      setDefaultTemplateId(defaultTemplate ? defaultTemplate.id! : "");
    }
  }, [automationRules]);

  return (
    <Accordion
      background
      image={AutomationIcon}
      title={t("onboarding.getStarted.quickStart.automationTask.title")}
      extra={
        isComplete && (
          <BadgeTag
            className={onboardingStyles.tag}
            compact
            text={t("onboarding.getStarted.quickStart.complete")}
          />
        )
      }
    >
      <div className={`${onboardingStyles.content} ${styles.content}`}>
        <div className={onboardingStyles.list}>
          <div className={onboardingStyles.title}>
            {t("onboarding.getStarted.quickStart.automationTask.action1.title")}
            {isAutomationRuleAdded && (
              <span className={styles.completedTag}>
                <span
                  className={`${iconStyles.icon} ${styles.checkIcon}`}
                ></span>
                {t(
                  "onboarding.getStarted.quickStart.automationTask.action1.complete"
                )}
              </span>
            )}
          </div>
          <div className={styles.rules}>
            {rules.map((rule, i) => (
              <div
                key={rule.title}
                className={`${styles.rule} container ${
                  i + 1 === rules.length ? styles.lastOne : ""
                }`}
              >
                <div className={styles.header}>
                  <Image src={ruleImg} />
                </div>
                <div className={styles.title}>{rule.title}</div>
                <div className={styles.desc}>{rule.desc}</div>
                <div className={styles.link}>
                  <Link to={rule.link}>
                    {t(
                      "onboarding.getStarted.quickStart.automationTask.button.createRule"
                    )}
                    <span
                      className={`${iconStyles.icon} ${styles.arrowIcon}`}
                    ></span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Divider />
        <div className={onboardingStyles.list}>
          <div className={onboardingStyles.title}>
            {t("onboarding.getStarted.quickStart.automationTask.action2.title")}
            {isQuickReplyAdded && (
              <span className={styles.completedTag}>
                <span
                  className={`${iconStyles.icon} ${styles.checkIcon}`}
                ></span>
                {t(
                  "onboarding.getStarted.quickStart.automationTask.action2.complete"
                )}
              </span>
            )}
          </div>
          <div className={onboardingStyles.desc}>
            {t("onboarding.getStarted.quickStart.automationTask.action2.desc")}
          </div>
          <div className={onboardingStyles.button}>
            <Link
              to={{
                pathname: routeTo("/settings/inbox/quickreplies"),
                search: "quickStart=quickReply",
              }}
            >
              <Button primary customSize="mid">
                {t(
                  "onboarding.getStarted.quickStart.automationTask.button.createQuickReply"
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
