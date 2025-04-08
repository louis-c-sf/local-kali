import { QrCodeChannelActionType } from "../types/SettingTypes";
import { QRCodeChannelsType } from "../types/SettingTypes";
import { TeamType } from "../../../types/TeamType";
import { StaffType } from "../../../types/StaffType";

export const handleUpdateAccumulatedChannel = (props: {
  currentChannel: QrCodeChannelActionType;
  accumulatedChannels: QRCodeChannelsType[];
  row: TeamType | StaffType;
  onChannelsUpdated: (channels: QRCodeChannelsType[]) => void;
}) => {
  const { currentChannel, accumulatedChannels, row, onChannelsUpdated } = props;
  const rowId = "userInfo" in row ? row.userInfo.id : row.id;
  const rest = accumulatedChannels.filter((ch) => ch.id !== rowId);
  if (currentChannel.targetedChannelWithIds?.length === 0) {
    const hasOriginalChannel = "qrCodeChannel" in row;
    onChannelsUpdated(
      hasOriginalChannel
        ? [
            ...rest,
            {
              id: rowId,
              resetChannel: true,
              channel: "whatsapp",
            },
          ]
        : rest
    );
  } else if (
    currentChannel.targetedChannelWithIds &&
    currentChannel.targetedChannelWithIds?.length > 0
  ) {
    const currentChannelId =
      currentChannel.targetedChannelWithIds[0].ids &&
      currentChannel.targetedChannelWithIds[0].ids[0];
    const originalChannelId =
      row.qrCodeChannel?.ids && row.qrCodeChannel?.ids[0];

    onChannelsUpdated(
      currentChannelId === originalChannelId
        ? rest
        : [
            ...rest,
            {
              id: rowId,
              ...currentChannel.targetedChannelWithIds[0],
            },
          ]
    );
  }
};
