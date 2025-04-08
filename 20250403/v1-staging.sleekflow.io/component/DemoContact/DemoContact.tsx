import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useAppSelector } from "../../AppRootContext";
import useRouteConfig from "../../config/useRouteConfig";
import { isFreemiumPlan } from "../../types/PlanSelectionType";
import TickIcon from "../../assets/tsx/icons/TickIcon";
import BookConsultationIcon from "./assets/BookConsultationIcon";
import UserIcon from "./assets/UserIcon";
import styles from "./DemoContact.module.css";
import { BackLink } from "../shared/nav/BackLink";
import useGetBookDemoLink from "../Onboarding/GetStarted/useGetBookDemoLink";

export default function DemoContact() {
  const history = useHistory();
  const { t } = useTranslation();
  const currentPlan = useAppSelector((s) => s.currentPlan);
  const { routeTo } = useRouteConfig();
  const bookDemoLink = useGetBookDemoLink();

  function connectExistWhatsapp() {
    history.push(routeTo("/channels"), { channelName: "twilio_whatsapp" });
  }

  function connectWhatsapp() {
    if (isFreemiumPlan(currentPlan)) {
      history.push(routeTo("/settings/plansubscription"));
    } else {
      history.push(routeTo("/guide/whatsapp-comparison/cloudAPI"));
    }
  }

  return (
    <div className="main">
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className="back">
            <BackLink onClick={() => history.goBack()}>
              {t("demoContact.backTo")}
            </BackLink>
          </div>
          <div className={styles.title}>{t("demoContact.title")}</div>
          <div className={styles.bookConsultation}>
            <div className="header">
              <BookConsultationIcon />
              <span>{t("demoContact.bookConsultation.header")}</span>
            </div>
            <div className="content">
              {t("demoContact.bookConsultation.content")}
              <ul>
                <li>
                  <TickIcon /> {t("demoContact.bookConsultation.list1")}
                </li>
                <li>
                  <TickIcon /> {t("demoContact.bookConsultation.list2")}
                </li>
              </ul>
            </div>
            <a
              href={bookDemoLink}
              className="ui button primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("demoContact.button.book")}</span>
            </a>
          </div>
          <div className={styles.connectOnMyOwn}>
            <div className="header">
              <UserIcon />
              <span>{t("demoContact.connectWhatsapp.header")}</span>
            </div>
            <div className="content">
              {t("demoContact.connectWhatsapp.content")}
            </div>
            <div onClick={connectWhatsapp} className={styles.link}>
              {t("demoContact.link.connectNow")} →
            </div>
          </div>
          <div className={styles.haveTwilioAccount}>
            <div className="text">{t("demoContact.alreadyHaveTwilio")}</div>
            <div onClick={connectExistWhatsapp} className={styles.link}>
              {t("demoContact.link.connectNow")} →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
