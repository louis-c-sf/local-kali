import React from "react";
import { useTranslation } from "react-i18next";

export function useStaffRoles() {
  const { t } = useTranslation();

  const staffRole = [
    {
      value: "admin",
      text: `${t("system.user.role.admin.name")} (${t(
        "system.user.role.admin.abilities"
      )})`,
      content: (
        <div className="desc">
          {t("system.user.role.admin.name")}{" "}
          <span>({t("system.user.role.admin.abilities")})</span>
        </div>
      ),
    },
    {
      value: "teamadmin",
      text: `${t("system.user.role.teamAdmin.name")} (${t(
        "system.user.role.teamAdmin.abilities"
      )})`,
      content: (
        <div className="desc">
          {t("system.user.role.teamAdmin.name")}{" "}
          <span>({t("system.user.role.teamAdmin.abilities")})</span>
        </div>
      ),
    },
    {
      value: "staff",
      text: `${t("system.user.role.staff.name")} (${t(
        "system.user.role.staff.abilities"
      )})`,
      content: (
        <div className="desc">
          {t("system.user.role.staff.name")}{" "}
          <span>({t("system.user.role.staff.abilities")})</span>
        </div>
      ),
    },
  ];

  const proPlanStaffRole = [
    {
      value: "admin",
      text: `${t("system.user.role.admin.name")} (${t(
        "system.user.role.admin.abilities"
      )})`,
      content: (
        <div className="desc">
          {t("system.user.role.admin.name")}{" "}
          <span>({t("system.user.role.admin.abilities")})</span>
        </div>
      ),
    },
    {
      value: "staff",
      text: `${t("system.user.role.staff.name")} (${t(
        "system.user.role.staff.abilities"
      )})`,
      content: (
        <div className="desc">
          {t("system.user.role.staff.name")}{" "}
          <span>({t("system.user.role.staff.abilities")})</span>
        </div>
      ),
    },
  ];

  const staffRoleChoices = [
    {
      value: "admin",
      text: t("system.user.role.admin.name"),
    },
    {
      value: "TeamAdmin",
      text: t("system.user.role.teamAdmin.name"),
    },
    {
      value: "staff",
      text: t("system.user.role.staff.name"),
    },
  ];

  return {
    staffRole,
    proPlanStaffRole,
    staffRoleChoices,
  };
}
