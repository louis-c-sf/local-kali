import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../../component/Header";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppSelector } from "../../AppRootContext";
import styles from "./GetStartedContainer.module.css";
import logo from "../../assets/images/logo.svg";
import { Dimmer, Divider, Image, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import iconStyles from "../../component/shared/Icon/Icon.module.css";
import DashboardPlan from "../../component/Onboarding/GetStarted/DashboardPlan";
import { equals } from "ramda";
import Avatar from "react-avatar";
import { isStaffRole } from "../../component/Settings/helpers/AccessRulesGuard";
import { URL } from "../../api/apiRequest";
import ProgressBar from "../../component/Onboarding/GetStarted/components/ProgressBar";
import InboxTask from "../../component/Onboarding/GetStarted/InboxTask";
import CampaignTask from "../../component/Onboarding/GetStarted/CampaignTask";
import ChannelTask from "../../component/Onboarding/GetStarted/ChannelTask";
import AutomationTask from "../../component/Onboarding/GetStarted/AutomationTask";
import Accordion from "../../component/Onboarding/GetStarted/components/Accordion";
import { fetchOnboardingProgress } from "../../api/Onboarding/fetchOnboardingProgress";
import {
  initialFlags,
  OnboardingProgressType,
} from "../../component/GettingStarted/OnboardingProgressType";

const taskScore = [10, 30, 30, 30];

function GetStartedContainer() {
  const { t } = useTranslation();
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const company = useAppSelector((s) => s.company, equals);
  const usage = useAppSelector((s) => s.usage);
  const currentStaff = useAppSelector((s) => s.currentStaff, equals);
  const { routeTo } = useRouteConfig();
  const isStaff = currentStaff ? isStaffRole(currentStaff) : false;
  const [progress, setProgress] =
    useState<OnboardingProgressType>(initialFlags);
  const [loading, setLoading] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const currentAgents = usage?.currentAgents || 0;
  const maximumAgents = usage?.maximumAgents || 0;
  const task1Complete = progress.isInboxDemoCompleted || progress.isInboxInUse;
  const task2Complete =
    (progress.isMessagingChannelConnected ||
      progress.isWhatsappConsultationBooked) &&
    progress.isInvitedTeammate;
  const task3Complete =
    progress.isAutomationRuleAdded && progress.isQuickReplyAdded;
  const task4Complete =
    progress.isMessagingChannelConnected &&
    progress.isContactListCreated &&
    progress.isCampaignCreated;

  useEffect(() => {
    setLoading(true);
    fetchOnboardingProgress()
      .then((flags) => {
        setProgress(flags);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Onboarding progress load fail: ${err}`);
      });
  }, []);

  useEffect(() => {
    const progress = [
      task1Complete,
      task2Complete,
      task3Complete,
      task4Complete,
    ];
    const score = taskScore
      .filter((_, i) => progress[i])
      .reduce((acc, current) => acc + current, 0);
    setScore(score);
  }, [task1Complete, task2Complete, task3Complete, task4Complete]);

  return (
    <div className="post-login">
      <Helmet
        title={t("nav.common.title", {
          page: t("onboarding.getStarted.pageTitle"),
        })}
      />
      <PostLogin selectedItem={""}>
        <div className="main getting-started">
          <div className="main-content">
            <div className={styles.wrapper}>
              <div className={styles.header}>
                <div className={styles.logo}>
                  <Image src={logo} alt="sleekflow" />
                </div>
              </div>
              <div className={styles.profile}>
                <div className={`container`}>
                  <Dimmer.Dimmable className={`${styles.personalInfo}`}>
                    {!currentStaff ? (
                      <Dimmer active={true} inverted>
                        <Loader active />
                      </Dimmer>
                    ) : (
                      <>
                        <div className={styles.photo}>
                          {currentStaff.profilePictureURL ? (
                            <Image
                              className={styles.photoImg}
                              circular
                              src={`${URL}/${currentStaff.profilePictureURL}`}
                            />
                          ) : (
                            <Avatar
                              name={currentStaff.name}
                              size={"96px"}
                              round={true}
                              maxInitials={2}
                            />
                          )}
                        </div>
                        <div className={styles.info}>
                          <div className={styles.name}>{currentStaff.name}</div>
                          <div className={styles.company}>
                            {currentStaff.roleType} | {company?.companyName}
                          </div>
                          <div className={styles.settingLink}>
                            <Link to={routeTo("/settings/generalinfo")}>
                              <span
                                className={`${iconStyles.icon} ${styles.editIcon}`}
                              />
                              {t("onboarding.getStarted.profile.setting")}
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </Dimmer.Dimmable>
                </div>
                <Dimmer.Dimmable className={`${styles.plan}`}>
                  {!company ? (
                    <Dimmer active={true} inverted>
                      <Loader active />
                    </Dimmer>
                  ) : (
                    <DashboardPlan
                      plan={currentPlan}
                      currentAgents={currentAgents}
                      maximumAgents={maximumAgents}
                      maximumContacts={usage.maximumContacts}
                      totalContacts={usage.totalContacts}
                      isStaff={isStaff}
                    />
                  )}
                </Dimmer.Dimmable>
              </div>
              <div className={styles.quickStart} id="quickStart">
                <div className={styles.sectionTitle}>
                  {t("onboarding.getStarted.quickStart.title")}
                </div>
                <Divider />
                <div className={styles.progress}>
                  {t("onboarding.getStarted.quickStart.progress")} {score}%
                  <div className={styles.barWrapper}>
                    <ProgressBar value={score} className={styles.bar} />
                  </div>
                  {t("onboarding.getStarted.quickStart.getStart")}
                </div>
                <div className={styles.tasks}>
                  <Dimmer.Dimmable>
                    {loading ? (
                      <Dimmer active={true} inverted className={styles.loader}>
                        <Loader active />
                      </Dimmer>
                    ) : (
                      <InboxTask isComplete={task1Complete} />
                    )}
                  </Dimmer.Dimmable>
                </div>
                <div className={styles.tasks}>
                  <Dimmer.Dimmable>
                    {loading || !company ? (
                      <Dimmer active={true} inverted className={styles.loader}>
                        <Loader active />
                      </Dimmer>
                    ) : (
                      <ChannelTask
                        company={company}
                        isComplete={task2Complete}
                        isWebWidgetConnected={progress.isWebWidgetAdded}
                        remainingCount={maximumAgents - currentAgents}
                      />
                    )}
                  </Dimmer.Dimmable>
                </div>
                <div className={styles.tasks}>
                  <Dimmer.Dimmable>
                    {loading ? (
                      <Dimmer active={true} inverted className={styles.loader}>
                        <Loader active />
                      </Dimmer>
                    ) : (
                      <AutomationTask
                        isComplete={task3Complete}
                        isAutomationRuleAdded={progress.isAutomationRuleAdded}
                        isQuickReplyAdded={progress.isQuickReplyAdded}
                      />
                    )}
                  </Dimmer.Dimmable>
                </div>
                <div className={styles.tasks}>
                  <Dimmer.Dimmable>
                    {loading ? (
                      <Dimmer active={true} inverted className={styles.loader}>
                        <Loader active />
                      </Dimmer>
                    ) : (
                      <CampaignTask
                        isComplete={task4Complete}
                        isMessagingChannelConnected={
                          progress.isMessagingChannelConnected
                        }
                        isContactListCreated={progress.isContactListCreated}
                        isCampaignCreated={progress.isCampaignCreated}
                      />
                    )}
                  </Dimmer.Dimmable>
                </div>
              </div>
              <div className={styles.faq}>
                <div className={styles.sectionTitle}>
                  {t("onboarding.getStarted.faq.title")}
                </div>
                <Divider className={styles.divider} />
                <div className={styles.question}>
                  <Accordion
                    title={t("onboarding.getStarted.faq.question1.title")}
                  >
                    <div className={styles.answer}>
                      {t("onboarding.getStarted.faq.question1.content")}
                    </div>
                  </Accordion>
                </div>
                <div className={styles.question}>
                  <Accordion
                    title={t("onboarding.getStarted.faq.question2.title")}
                  >
                    <div className={styles.answer}>
                      {t("onboarding.getStarted.faq.question2.content")}
                    </div>
                  </Accordion>
                </div>
                <div className={styles.question}>
                  <Accordion
                    title={t("onboarding.getStarted.faq.question3.title")}
                  >
                    <div className={styles.answer}>
                      {t("onboarding.getStarted.faq.question3.content")}
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PostLogin>
    </div>
  );
}

export default GetStartedContainer;
