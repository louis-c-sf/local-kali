import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { PostLogin } from "../../Header";
import { Button } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";
import { isDefaultAssignmentRule } from "../../../component/AssignmentRules/filters";
import styles from "./AssignUser.module.css";
import CrossLgIcon from "../../../assets/tsx/icons/CrossLgIcon";
import QueueIcon from "../../../assets/tsx/icons/QueueIcon";
import GroupIcon from "../../../assets/tsx/icons/GroupIcon";
import { BackLink } from "../../shared/nav/BackLink";
import useFetchAutomationRules from "api/Company/useFetchAutomationRules";

function AssignUser() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const [defaultAssignmentRuleId, setDefaultAssignmentRuleId] = useState("");
  const { automationRules } = useFetchAutomationRules();
  useEffect(() => {
    let unmounting = false;
    if (!automationRules) {
      return;
    }
    setDefaultAssignmentRuleId(
      automationRules.find(isDefaultAssignmentRule)?.id ?? ""
    );
    return () => {
      unmounting = true;
    };
  }, [automationRules]);

  const handleBack = () => {
    history.push(routeTo("/guide/get-started"));
  };

  return (
    <div className="post-login">
      <Helmet title={t("onboarding.assignUser.title")} />
      <PostLogin selectedItem={""} />
      <div className="main instagram-container">
        <div>
          <div className="nav-container">
            <BackLink onClick={handleBack}>{t("onboarding.ig.back")}</BackLink>
          </div>
          <div className={styles.header}>
            {t("onboarding.assignUser.title")}
          </div>
          <div className={styles.helperText}>
            {t("onboarding.assignUser.description")}
          </div>
          <div className={styles.inviteUserContainer}>
            <div className={styles.subHeader}>
              <div>
                <CrossLgIcon />
              </div>
              {t("onboarding.assignUser.unassigned")}
            </div>
            <div className={`${styles.textContainer}`}>
              <div>
                <Trans i18nKey="onboarding.assignUser.unassignedText">
                  All company users will receive notification.
                  <span className={styles.boldText}>The first respondent</span>
                  becomes the assignee of the customer conversation
                </Trans>
              </div>
            </div>
            <div className={styles.subHeader}>
              <div>
                <QueueIcon />
              </div>
              {t("onboarding.assignUser.queue")}
            </div>
            <div className={`${styles.textContainer}`}>
              <div>
                <Trans i18nKey="onboarding.assignUser.queueText">
                  Each conversation is
                  <span className={styles.boldText}>
                    assigned to a different user
                  </span>
                  until every user has been assigned with the same amount of
                  conversations
                </Trans>
              </div>
            </div>
            <div className={styles.subHeader}>
              <div>
                <GroupIcon />
              </div>
              {t("onboarding.assignUser.person")}
            </div>
            <div className={`${styles.textContainer}`}>
              <div>
                <Trans i18nKey="onboarding.assignUser.personText">
                  All conversations are only assigned to
                  <span className={styles.boldText}>one specific user</span>
                </Trans>
              </div>
            </div>
            <div className={styles.subHeader}>
              <div>
                <CrossLgIcon />
              </div>
              {t("onboarding.assignUser.team")}
            </div>
            <div className={`${styles.textContainer} last`}>
              <div>
                <Trans i18nKey={"onboarding.assignUser.teamText"}>
                  All conversations are
                  <span className={styles.boldText}>
                    assigned to members of the team
                  </span>
                  , and can be assigned based on the above assignment types
                </Trans>
              </div>
            </div>
          </div>
          <Button
            className={`ui button primary full-button ${styles.inviteUserButton}`}
            onClick={() => {
              history.push(
                routeTo(`/automations/edit/${defaultAssignmentRuleId}`)
              );
            }}
          >
            {t("onboarding.assignUser.setRule")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AssignUser;
