import React from "react";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { PostLogin } from "../../Header";
import { Button } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";
import styles from "./InviteUser.module.css";
import { BackLink } from "../../shared/nav/BackLink";
import BadgeTag from "../../shared/BadgeTag/BadgeTag";
import TickIcon from "../../../assets/tsx/icons/TickIcon";

function InviteUser() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const handleBack = () => {
    history.push(routeTo("/guide/get-started"));
  };

  return (
    <div className="post-login">
      <Helmet title={t("onboarding.inviteUser.title")} />
      <PostLogin selectedItem={""} />
      <div className="main instagram-container">
        <div>
          <div className="nav-container">
            <BackLink onClick={handleBack}>{t("onboarding.ig.back")}</BackLink>
          </div>
          <div className={styles.header}>
            {t("onboarding.inviteUser.title")}
          </div>
          <div className={styles.helperText}>
            {t("onboarding.inviteUser.description")}
          </div>
          <div className={styles.inviteUserContainer}>
            <div className={styles.subHeader}>
              {t("onboarding.inviteUser.guide1")}
            </div>
            <div className={`${styles.textContainer} ${styles.marginBottom}`}>
              <div>
                <TickIcon />
              </div>
              <div>
                <Trans i18nKey="onboarding.inviteUser.guide1Text">
                  View
                  <span className={styles.boldText}>
                    all contacts and conversations
                  </span>
                </Trans>
              </div>
            </div>
            <div className={styles.subHeader}>
              {t("onboarding.inviteUser.guide2")}
              <BadgeTag text={t("onboarding.inviteUser.premium")} />
            </div>
            <div className={`${styles.textContainer} ${styles.marginBottom}`}>
              <div>
                <TickIcon />
              </div>
              <div>
                <Trans i18nKey="onboarding.inviteUser.guide2Text">
                  View contacts and conversations
                  <span className={styles.boldText}>
                    assigned to users within the team
                  </span>
                </Trans>
              </div>
            </div>
            <div className={styles.subHeader}>
              {t("onboarding.inviteUser.guide3")}
            </div>
            <div className={styles.textContainer}>
              <div>
                <TickIcon />
              </div>
              <div>
                <Trans i18nKey="onboarding.inviteUser.guide3Text">
                  View contacts and conversations
                  <span className={styles.boldText}>
                    assigned to them and unassigned conversations within the
                    team
                  </span>
                </Trans>
              </div>
            </div>
          </div>
          <Button
            className={`ui button primary full-button ${styles.inviteUserButton}`}
            onClick={() => {
              history.push({
                pathname: routeTo("/settings/usermanagement"),
                state: {
                  openInviteUserModal: true,
                },
              });
            }}
          >
            {t("onboarding.inviteUser.inviteUser")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InviteUser;
