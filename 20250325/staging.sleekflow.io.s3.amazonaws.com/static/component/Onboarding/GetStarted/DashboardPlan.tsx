import React from "react";
import styles from "./DashboardPlan.module.css";
import ProgressBar from "./components/ProgressBar";
import BadgeTag from "../../shared/BadgeTag/BadgeTag";
import { useTranslation } from "react-i18next";
import {
  isEnterprisePlan,
  isFreemiumPlan,
  isFreePlan,
  isPremiumPlan,
  isProPlan,
  PlanType,
} from "types/PlanSelectionType";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { useAppDispatch } from "AppRootContext";
import { Button } from "component/shared/Button/Button";
import { TFunction } from "i18next";
import useGetBookDemoLink from "./useGetBookDemoLink";

function PlanStatus(props: {
  label: string;
  maximum: number;
  value: number;
  noLimit: boolean;
}) {
  const { label, maximum, value, noLimit } = props;
  const { t } = useTranslation();
  if (noLimit) {
    return (
      <div className={`${styles.value} ${styles.text}`}>
        <span>{value}</span>
        <BadgeTag
          compact
          className={styles.tag}
          text={t("onboarding.getStarted.plan.noLimit")}
        />
      </div>
    );
  }
  return (
    <div className={`${styles.value} ${styles.progress}`}>
      <ProgressBar total={maximum} value={value} />
      <span className={styles.progressLabel}>{label}</span>
    </div>
  );
}

const getPlanName = (
  t: TFunction,
  isFree: boolean,
  isPro: boolean,
  isPremium: boolean,
  isEnterprise: boolean
) => {
  if (isPro) {
    return t("onboarding.getStarted.plan.pro");
  }
  if (isEnterprise) {
    return t("onboarding.getStarted.plan.enterprise");
  }
  if (isPremium) {
    return t("onboarding.getStarted.plan.premium");
  }
  if (isFree) {
    return (
      <>
        {t("onboarding.getStarted.plan.startup")}
        <BadgeTag
          compact
          className={styles.tag}
          text={t("onboarding.getStarted.plan.free")}
        />
      </>
    );
  }
  return null;
};

export default function DashboardPlan(props: {
  plan: PlanType;
  currentAgents: number;
  maximumAgents: number;
  maximumContacts: number;
  totalContacts: number;
  isStaff: boolean;
}) {
  const {
    plan,
    currentAgents,
    maximumAgents,
    maximumContacts,
    totalContacts,
    isStaff,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const isFree = isFreePlan(plan) || isFreemiumPlan(plan);
  const isPro = isProPlan(plan);
  const isPremium = isPremiumPlan(plan);
  const isEnterprise = isEnterprisePlan(plan);
  const loginDispatch = useAppDispatch();
  const bookDemoLink = useGetBookDemoLink();

  const showSubmitTicket = () => {
    loginDispatch({ type: "SHOW_HELP_CENTER_TICKET" });
  };

  return (
    <div className={`${styles.plan} container`}>
      <div className={styles.status}>
        <div className={styles.row}>
          <div className={styles.label}>
            {t("onboarding.getStarted.plan.currentPlan")}
          </div>
          <div className={`${styles.value} ${styles.planName}`}>
            {getPlanName(t, isFree, isPro, isPremium, isEnterprise)}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>
            {t("onboarding.getStarted.plan.contacts")}
          </div>
          <PlanStatus
            label={t("onboarding.getStarted.plan.contactStatus", {
              value: totalContacts,
              max: maximumContacts,
            })}
            maximum={maximumContacts}
            value={totalContacts}
            noLimit={isEnterprise}
          />
        </div>
        <div className={`${styles.row} ${styles.lastOne}`}>
          <div className={styles.label}>
            {t("onboarding.getStarted.plan.staffs")}
          </div>
          <PlanStatus
            label={t("onboarding.getStarted.plan.staffStatus", {
              value: currentAgents,
              max: maximumAgents,
            })}
            maximum={maximumAgents}
            value={currentAgents}
            noLimit={isEnterprise}
          />
        </div>
      </div>
      <div className={styles.actions}>
        {isFree && !isStaff ? (
          <>
            <div className={styles.title}>
              {t("onboarding.getStarted.plan.upgradeTitle")}
            </div>
            <div className={styles.btns}>
              <Link to={routeTo("/settings/plansubscription")}>
                <Button
                  className={`${styles.btn} ${styles.pricing}`}
                  customSize="mid"
                >
                  {t("onboarding.getStarted.plan.pricing")}
                </Button>
              </Link>
              <Button
                customSize="mid"
                className={`${styles.btn} ${styles.book}`}
                target="_blank"
                as="a"
                href={bookDemoLink}
                rel="noreferrer noopener"
              >
                {t("onboarding.getStarted.plan.bookDemo")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.title}>
              {t("onboarding.getStarted.plan.reportTitle")}
            </div>
            <div className={styles.btns}>
              <Button
                customSize="mid"
                className={`${styles.btn} ${styles.pricing}`}
                target="_blank"
                as="a"
                href="https://docs.sleekflow.io/"
                rel="noreferrer noopener"
              >
                {t("onboarding.getStarted.plan.viewGuide")}
              </Button>
              <Button
                className={`${styles.btn} ${styles.book}`}
                onClick={showSubmitTicket}
                customSize="mid"
              >
                {t("onboarding.getStarted.plan.submitTicket")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
