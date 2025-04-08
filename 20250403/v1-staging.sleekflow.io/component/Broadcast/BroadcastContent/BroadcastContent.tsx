import { equals, mergeRight, pick, uniq } from "ramda";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { POST_BROADCAST_WITH_TEMPLATE } from "../../../api/apiPath";
import { post } from "../../../api/apiRequest";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import BroadcastContext from "../BroadcastContext";
import {
  ChannelMessageType,
  SendWhatsappTemplateState,
  UpdateSelectedCampaignMessageType,
} from "../../../types/BroadcastCampaignType";
import { UploadedBroadcastFileType } from "../../../types/UploadedFileType";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { ChannelType } from "../../Chat/Messenger/types";
import NewBroadcastContent from "../NewBroadcastContent";
import { NewBroadcastHeader } from "../NewBroadcastHeader";
import { saveCampaign } from "../NewBroadcastHeader/saveCampaign";
import { updateBroadcastCampaignWithStatus } from "../NewBroadcastHeader/updateBroadcastCampaignWithStatus";
import { FacebookOTNStateType } from "features/Facebook/models/FacebookOTNTypes";
import useFetchCompany from "../../../api/Company/useFetchCompany";
import mixpanel from "mixpanel-browser";
export interface ChannelMessageWithoutTargetedChannel {
  id?: number;
  content: string;
  uploadedFiles: UploadedBroadcastFileType[];
  params: string[];
  templateName?: string;
}

export interface SendMessageResponseType {
  targetAudience: number;
}

export default function BroadcastContent() {
  const {
    user,
    staffList,
    broadcastCampaign = [],
  } = useAppSelector(pick(["user", "staffList", "broadcastCampaign"]), equals);
  const { company } = useFetchCompany();

  const loginDispatch = useAppDispatch();
  const broadcastContext = useContext(BroadcastContext);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const {
    id,
    contactLists,
    channelsWithIds,
    name,
    broadcastDispatch,
    scheduledAt,
    campaignChannelMessages,
    selectedChannel,
    automationActions,
    stripePaymentRequestOption,
  } = broadcastContext;

  async function send() {
    if (!company) {
      return;
    }

    updateBroadcastCampaignWithStatus(
      "Sent",
      loginDispatch,
      staffList,
      broadcastCampaign,
      user,
      broadcastContext
    );
    const result = await saveCampaign(
      id,
      name,
      contactLists,
      channelsWithIds,
      campaignChannelMessages,
      automationActions ?? [],
      company,
      scheduledAt,
      stripePaymentRequestOption
    );

    broadcastDispatch({ type: "UPDATE_BROADCAST_ID", id: result.id });

    const sendResult: SendMessageResponseType = await post(
      POST_BROADCAST_WITH_TEMPLATE,
      {
        param: {
          templeteId: result.id,
        },
      }
    );

    if (sendResult) {
      broadcastDispatch({
        type: "SEND_COMPLETE",
        result: sendResult,
      });
      mixpanel.track("Broadcast Published");
      if (scheduledAt) {
        flash(
          t("flash.broadcast.schedule.success", {
            count: sendResult.targetAudience,
          })
        );
      } else {
        flash(
          t("flash.broadcast.success", { count: sendResult.targetAudience })
        );
      }
    }
  }

  const channels: ChannelType[] = uniq(
    campaignChannelMessages
      .map((message) =>
        message.targetedChannelWithIds.map((chnl) => chnl?.channel)
      )
      .flat(2)
  );
  const selectedChannelMessageIndex = campaignChannelMessages.findIndex(
    (campaignChannelMessage) =>
      campaignChannelMessage.targetedChannelWithIds.some(
        (chnl) => chnl.channel === selectedChannel
      )
  );

  function updateChannelMessageContent(
    key: keyof ChannelMessageType,
    value: UpdateSelectedCampaignMessageType
  ) {
    switch (key) {
      case "content":
        broadcastDispatch({
          type: "UPDATE_CONTENT",
          content: value as string,
          campaignIndex: selectedChannelMessageIndex,
          updatedCampaignMessage: mergeRight(
            campaignChannelMessages[selectedChannelMessageIndex],
            {
              content: value as string,
            }
          ),
        });
        return;
      case "uploadedFiles":
        broadcastDispatch({
          type: "UPDATE_CONTENT",
          campaignIndex: selectedChannelMessageIndex,
          updatedCampaignMessage: mergeRight(
            campaignChannelMessages[selectedChannelMessageIndex],
            {
              uploadedFiles: value as UploadedBroadcastFileType[],
            }
          ),
        });
        return;
      case "sendWhatsAppTemplate":
        broadcastDispatch({
          type: "UPDATE_CONTENT",
          campaignIndex: selectedChannelMessageIndex,
          updatedCampaignMessage: mergeRight(
            campaignChannelMessages[selectedChannelMessageIndex],
            {
              sendWhatsAppTemplate: value as SendWhatsappTemplateState,
            }
          ),
        });
        return;
      case "facebookOTN":
        broadcastDispatch({
          type: "UPDATE_FACEBOOK_OTN",
          campaignIndex: selectedChannelMessageIndex,
          prevMessages: campaignChannelMessages[selectedChannelMessageIndex],
          prevFacebookOTN:
            campaignChannelMessages[selectedChannelMessageIndex].facebookOTN,
          currentValue: value as Partial<FacebookOTNStateType>,
        });
        return;
    }
  }

  function updatedSelectedChannel(channel: ChannelType) {
    broadcastDispatch({
      type: "SELECTED_CHANNEL",
      channel: channel,
    });
  }

  return (
    <div className="main-content main-primary-column">
      {campaignChannelMessages.length > 0 && (
        <>
          <NewBroadcastHeader
            selectedChannel={channels[selectedChannelMessageIndex]}
            send={send}
            contactLists={contactLists}
            channelsWithIds={channelsWithIds}
            scheduledAt={scheduledAt}
            channels={channels}
            updatedSelectedChannel={updatedSelectedChannel}
          />
          <NewBroadcastContent
            selectedChannelIndex={selectedChannelMessageIndex}
            selectedChannel={channels[selectedChannelMessageIndex]}
            updatedContent={updateChannelMessageContent}
            selectedChannelMessage={
              campaignChannelMessages[selectedChannelMessageIndex]
            }
          />
        </>
      )}
    </div>
  );
}
