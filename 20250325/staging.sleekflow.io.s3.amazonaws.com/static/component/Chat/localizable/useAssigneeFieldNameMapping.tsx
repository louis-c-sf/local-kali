import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export function useAssigneeFieldNameMapping() {
  const { t, i18n } = useTranslation();

  const menuTitle = useCallback(
    (name: string): string => {
      const assigneeFieldDisplayNameMapping = {
        you: t("chat.filter.assignee.assignedToMe"),
        all: t("chat.filter.assignee.all"),
        unassigned: t("chat.filter.assignee.unassigned"),
        mentions: t("chat.filter.assignee.mentions"),
        teamunassigned: t("chat.filter.assignee.unassignedTeam"),
      };
      return assigneeFieldDisplayNameMapping[name.toLowerCase()] ?? name;
    },
    [i18n.language]
  );

  return {
    menuTitle,
  };
}
