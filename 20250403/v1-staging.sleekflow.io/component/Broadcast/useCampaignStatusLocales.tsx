import { useTranslation } from "react-i18next";
import { BroadcastStatusAliasType } from "../../types/BroadcastCampaignType";

export function useCampaignStatusLocales() {
  const { t } = useTranslation();
  const statusMapping: Record<BroadcastStatusAliasType, string> = {
    scheduled: t("broadcast.grid.row.campaign.status.scheduled"),
    draft: t("broadcast.grid.row.campaign.status.draft"),
    sent: t("broadcast.grid.row.campaign.status.sent"),
    sending: t("broadcast.grid.row.campaign.status.sending"),
    paused: t("broadcast.grid.row.campaign.status.paused"),
    delivered: t("broadcast.grid.row.campaign.status.delivered"),
    replied: t("broadcast.grid.row.campaign.status.replied"),
    read: t("broadcast.grid.row.campaign.status.read"),
    failed: t("broadcast.grid.row.campaign.status.failed"),
  } as const;

  const blastStatusMapping = {
    scheduled: t("broadcast.grid.row.campaign.status.scheduled"),
    processing: t("broadcast.grid.row.campaign.status.processing"),
    sent: t("broadcast.grid.row.campaign.status.sent"),
    queued: t("broadcast.grid.row.campaign.status.queued"),
    error: t("broadcast.grid.row.campaign.status.error"),
    completed: t("broadcast.grid.row.campaign.status.completed"),
  };

  return {
    statusMapping,
    blastStatusMapping,
  };
}
