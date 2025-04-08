import { useTranslation } from "react-i18next";

export default function useBroadcastFieldLocalized() {
  const { t } = useTranslation();
  return {
    broadcastFieldList: {
      id: "",
      status: t("broadcast.grid.header.status"),
      name: t("broadcast.grid.header.name"),
      channels: t("broadcast.grid.header.channel"),
      sent: t("broadcast.grid.header.sent"),
      delivered: t("broadcast.grid.header.delivered"),
      read: t("broadcast.grid.header.read"),
      reply: t("broadcast.grid.header.reply"),
      channelsWithIds: t("broadcast.grid.header.channelsWithIds"),
      createdBy: t("broadcast.grid.header.createdBy"),
      lastUpdated: t("broadcast.grid.header.lastUpdated"),
      startDate: t("broadcast.grid.header.startDate"),
    },
  };
}
