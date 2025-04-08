import React from "react";
import styles from "./CampaignTask.module.css";
import onboardingStyles from "./Onboarding.module.css";
import Accordion from "./components/Accordion";
import BadgeTag from "../../shared/BadgeTag/BadgeTag";
import CampaignIcon from "./assets/campaigns.svg";
import CampaignsImg from "./assets/campaigns-task.png";
import { Image } from "semantic-ui-react";
import { Button } from "../../shared/Button/Button";
import CheckIcon from "../../../assets/images/check-white.svg";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { TFunction } from "i18next";

const getSteps = (
  t: TFunction,
  isMessagingChannelConnected: boolean,
  isContactListCreated: boolean,
  isCampaignCreated: boolean
) => [
  {
    title: isMessagingChannelConnected
      ? t("onboarding.getStarted.quickStart.campaignTask.step1Connected")
      : t("onboarding.getStarted.quickStart.campaignTask.step1"),
    buttonText: t(
      "onboarding.getStarted.quickStart.campaignTask.button.connect"
    ),
    isComplete: isMessagingChannelConnected,
    isActive: !isMessagingChannelConnected,
    linkTo: "/channels",
  },
  {
    title: t("onboarding.getStarted.quickStart.campaignTask.step2"),
    buttonText: t(
      "onboarding.getStarted.quickStart.campaignTask.button.createList"
    ),
    isComplete: isContactListCreated,
    isActive: isMessagingChannelConnected && !isContactListCreated,
    linkTo: "/contacts/lists",
  },
  {
    title: t("onboarding.getStarted.quickStart.campaignTask.step3"),
    buttonText: t(
      "onboarding.getStarted.quickStart.campaignTask.button.createCampaign"
    ),
    isComplete: isCampaignCreated,
    isActive: isContactListCreated && !isCampaignCreated,
    linkTo: "/campaigns/create",
  },
];

export default function CampaignTask(props: {
  isComplete: boolean;
  isMessagingChannelConnected: boolean;
  isContactListCreated: boolean;
  isCampaignCreated: boolean;
}) {
  const {
    isComplete,
    isMessagingChannelConnected,
    isContactListCreated,
    isCampaignCreated,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const steps = getSteps(
    t,
    isMessagingChannelConnected,
    isContactListCreated,
    isCampaignCreated
  );

  return (
    <Accordion
      background
      image={CampaignIcon}
      title={t("onboarding.getStarted.quickStart.campaignTask.title")}
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
              className={`${onboardingStyles.step} ${
                step.isComplete && onboardingStyles.completed
              } ${step.isActive && onboardingStyles.active}`}
            >
              {step.isComplete ? (
                <div className={onboardingStyles.check}>
                  <Image src={CheckIcon} />
                </div>
              ) : (
                <div className={onboardingStyles.dot} />
              )}
              <div>
                {step.title}
                <div
                  className={`${onboardingStyles.button} ${
                    step.isComplete && styles.hidden
                  }`}
                >
                  <Link to={routeTo(step.linkTo)}>
                    <Button
                      customSize={"mid"}
                      primary={step.isActive}
                      disabled={!step.isActive}
                    >
                      {step.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.img}>
          <Image src={CampaignsImg} />
        </div>
      </div>
    </Accordion>
  );
}
