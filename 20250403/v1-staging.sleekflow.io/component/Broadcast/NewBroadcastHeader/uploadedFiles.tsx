import { BroadcastResponseType } from "../../../api/Broadcast/fetchBroadcastCampaign";
import { ChannelMessageType } from "../../../types/BroadcastCampaignType";
import { aliasChannelName } from "../../Channel/selectors";
import { eqBy, pick } from "ramda";
import { sendUploadedFiles } from "./sendUploadedFiles";

export async function uploadedFiles(
  broadcastResponse: BroadcastResponseType,
  campaignChannelMessages: ChannelMessageType[]
) {
  if (broadcastResponse.id) {
    const updatedCampaignMessages = campaignChannelMessages.map(
      (channelMessage) => {
        const [targetedChannel] = channelMessage.targetedChannelWithIds.map(
          (targetedChannelWithId) => ({
            channel: aliasChannelName(targetedChannelWithId.channel),
            ids: targetedChannelWithId.ids,
          })
        );
        const foundChannelFromResponse =
          broadcastResponse.campaignChannelMessages.find((msg) =>
            msg.targetedChannels.some((c) =>
              eqBy(pick(["channel", "ids"]), c, targetedChannel)
            )
          );
        return {
          id: foundChannelFromResponse?.id,
          ...channelMessage,
        };
      }
    );
    const uploadedFilesPromise = updatedCampaignMessages.map((message) => {
      const newFiles = message.uploadedFiles.filter((file) =>
        Boolean(file.fileProxy)
      );
      if (newFiles.length > 0 && message.id) {
        return sendUploadedFiles(broadcastResponse.id, newFiles, message.id);
      }
    });
    await Promise.all(uploadedFilesPromise);
  }
}
