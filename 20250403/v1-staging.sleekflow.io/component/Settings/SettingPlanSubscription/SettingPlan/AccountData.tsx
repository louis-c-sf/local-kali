import React from "react";
import SettingUsage from "../SettingUsage";
import { useAppSelector } from "../../../../AppRootContext";
import { equals } from "ramda";
import { useTranslation } from "react-i18next";
import { UNLIMITED_QUOTA } from "../SettingPlanUtils";
import { TFunction } from "i18next";
import { isDefaultAssignmentRule } from "component/AssignmentRules/filters";

const getUsageProgress = (
  t: TFunction,
  {
    currentAutomationRules,
    basePlanContacts,
    maxMessageQuota,
    totalMessageSent,
    maxContact,
    totalContact,
    maxStaffLogin,
    currentStaffLogin,
    maxAutomationRules,
  }: {
    currentAutomationRules: number | undefined;
    basePlanContacts: number;
    maxMessageQuota: number;
    totalMessageSent: number;
    maxContact: number;
    totalContact: number;
    maxStaffLogin: number;
    currentStaffLogin: number;
    maxAutomationRules: number;
  }
) => [
  {
    id: "campaignAndAutomatedMessages",
    counterText: t("settings.plan.counter.message.countText"),
    titleText: t("settings.plan.counter.message.header"),
    unlimited: maxMessageQuota === UNLIMITED_QUOTA,
    current: totalMessageSent,
    total: maxMessageQuota,
  },
  {
    id: "contacts",
    counterText: t("settings.plan.counter.contact.countText"),
    titleText: t("settings.plan.counter.contact.header"),
    current: totalContact,
    unlimited: maxContact - basePlanContacts === UNLIMITED_QUOTA,
    total: maxContact,
  },
  {
    id: "staffLogin",
    counterText: t("settings.plan.counter.staffLogin.countText"),
    titleText: t("settings.plan.counter.staffLogin.header"),
    current: currentStaffLogin,
    total: maxStaffLogin,
  },
  {
    id: "automationRules",
    counterText: t("settings.plan.counter.automationRules.countText"),
    titleText: t("settings.plan.counter.automationRules.header"),
    current: currentAutomationRules,
    unlimited: maxAutomationRules === 999,
    total: maxAutomationRules,
  },
];
const AccountData = () => {
  const {
    maxMessageQuota,
    totalMessageSent,
    maxContact,
    totalContact,
    basePlanContacts,
    maxStaffLogin,
    currentStaffLogin,
    maxAutomationRules,
    currentAutomationRules,
  } = useAppSelector(
    (s) => ({
      currentAutomationRules: s.automationRules?.filter(
        (rule) => !isDefaultAssignmentRule(rule) && rule.status === "Live"
      ).length,
      maxMessageQuota: s.usage.maximumAutomatedMessages,
      totalMessageSent: s.usage.totalMessagesSentFromSleekflow,
      maxContact: s.usage.maximumContacts,
      totalContact: s.usage.totalContacts,
      basePlanContacts: s.currentPlan.maximumContact,
      maxStaffLogin: s.usage?.maximumAgents,
      currentStaffLogin: s.usage?.currentAgents,
      maxAutomationRules: s.company?.maximumAutomations,
    }),
    equals
  );

  const { t } = useTranslation();

  const usages = getUsageProgress(t, {
    currentAutomationRules,
    maxMessageQuota,
    totalMessageSent,
    maxContact,
    totalContact,
    basePlanContacts,
    maxStaffLogin: maxStaffLogin!,
    currentStaffLogin: currentStaffLogin!,
    maxAutomationRules: maxAutomationRules!,
  });

  return (
    <>
      {usages.map((u) => (
        <SettingUsage
          unlimited={u?.unlimited}
          key={u.id}
          current={u.current ? u.current : 0}
          total={u.total}
          titleText={u.titleText}
          counterText={u.counterText}
        />
      ))}
    </>
  );
};

export default AccountData;
