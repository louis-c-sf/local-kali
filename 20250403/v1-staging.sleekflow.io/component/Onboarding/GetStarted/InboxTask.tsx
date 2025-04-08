import React from "react";
import styles from "./InboxTask.module.css";
import onboardingStyles from "./Onboarding.module.css";
import Accordion from "./components/Accordion";
import BadgeTag from "../../shared/BadgeTag/BadgeTag";
import InboxIcon from "./assets/inbox.svg";
import InboxImg from "./assets/inbox-task.png";
import { Image } from "semantic-ui-react";
import { Button } from "../../shared/Button/Button";
import CheckIcon from "../../../assets/images/check-white.svg";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { TFunction } from "i18next";

const getSteps = (t: TFunction, isComplete: boolean) => [
  {
    title: t("onboarding.getStarted.quickStart.inboxTask.step1"),
    isActive: true,
  },
  {
    title: t("onboarding.getStarted.quickStart.inboxTask.step2"),
    isActive: false,
  },
  {
    title: t("onboarding.getStarted.quickStart.inboxTask.step3"),
    isActive: false,
  },
];

export default function InboxTask(props: { isComplete: boolean }) {
  const { isComplete } = props;
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const steps = getSteps(t, isComplete);

  function getClasses(isActive: boolean) {
    if (isActive) {
      return isComplete ? onboardingStyles.completed : onboardingStyles.active;
    }
    return isComplete ? onboardingStyles.completed : "";
  }

  return (
    <Accordion
      background
      image={InboxIcon}
      title={t("onboarding.getStarted.quickStart.inboxTask.title")}
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
      <div className={onboardingStyles.content}>
        <div className={onboardingStyles.steps}>
          {steps.map((step) => (
            <div
              key={step.title}
              className={`${onboardingStyles.step} ${getClasses(
                step.isActive
              )}`}
            >
              {isComplete ? (
                <div className={onboardingStyles.check}>
                  <Image src={CheckIcon} />
                </div>
              ) : (
                <div className={onboardingStyles.dot} />
              )}
              <div>
                {step.title}
                {step.isActive && (
                  <div className={onboardingStyles.button}>
                    <Link to={routeTo("/guide/inbox-demo")}>
                      <Button customSize={"mid"} primary>
                        {t(
                          "onboarding.getStarted.quickStart.inboxTask.button.start"
                        )}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.img}>
          <Image src={InboxImg} />
        </div>
      </div>
    </Accordion>
  );
}
