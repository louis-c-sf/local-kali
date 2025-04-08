import React from "react";
import { useTranslation } from "react-i18next";
import { TargetChannelDropdown } from "../../AssignmentRules/AutomationRuleEdit/input/TargetChannelDropdown";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { QrCodeChannelActionType } from "../types/SettingTypes";

const QrCodeChannelCell = (props: {
  defaultChannels: TargetedChannelType[];
  selectedChannel: QrCodeChannelActionType;
  handleUpdateChannel: (currentChannel: QrCodeChannelActionType) => void;
}) => {
  const { defaultChannels, selectedChannel, handleUpdateChannel } = props;
  const { t } = useTranslation();
  const filteredDefaultChannels = defaultChannels.filter((row) =>
    row.channel.includes("whatsapp")
  );

  return (
    <>
      {defaultChannels.length === 0 ? (
        <TargetChannelDropdown
          action={selectedChannel}
          setAction={handleUpdateChannel}
          hasDefaultChoice={false}
        />
      ) : filteredDefaultChannels.length > 0 ? (
        <TargetChannelDropdown
          action={selectedChannel}
          setAction={handleUpdateChannel}
          defaultWhatsappChannels={filteredDefaultChannels}
          hasDefaultChoice={false}
        />
      ) : (
        t("settings.whatsappQrCode.common.notAvailable")
      )}
    </>
  );
};
export default QrCodeChannelCell;
