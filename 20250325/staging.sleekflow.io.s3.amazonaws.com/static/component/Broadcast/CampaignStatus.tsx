import React from "react";
import styles from "./CampaignStatus.module.css";
import { useCampaignStatusLocales } from "./useCampaignStatusLocales";
import { useTranslation } from "react-i18next";

export function CampaignStatus(props: {
  value: string;
  type: "broadcast" | "blast";
}) {
  const { statusMapping, blastStatusMapping } = useCampaignStatusLocales();
  type CampaignStatusType = keyof typeof statusMapping;
  type BlastStatusType = keyof typeof blastStatusMapping;

  const { t } = useTranslation();

  function getStatusClass(status: string) {
    return (
      {
        error: styles.error,
        completed: styles.sent,
        processing: styles.processing,
        queued: styles.queued,
        scheduled: styles.scheduled,
        draft: styles.draft,
        sent: styles.sent,
        sending: styles.sending,
        paused: styles.paused,
      }[status] ?? styles.error
    );
  }

  const status = props.value.toLowerCase() as
    | CampaignStatusType
    | BlastStatusType;

  const statusText =
    (props.type === "broadcast"
      ? statusMapping[status]
      : blastStatusMapping[status]) ??
    t("broadcast.grid.row.campaign.status.error");

  return (
    <label
      className={`campaign-status ${styles.status} ${getStatusClass(status)}`}
    >
      {statusText}
    </label>
  );
}
