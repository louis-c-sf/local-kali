import React, { useContext, useState } from "react";
import BroadcastContext from "./BroadcastContext";
import { TargetedChannelType } from "../../types/BroadcastCampaignType";
import ConfirmSend from "./ConfirmSend";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import useCompanyChannels, {
  iconFactory,
} from "../Chat/hooks/useCompanyChannels";
import useImportedLists from "../../container/Contact/Imported/useImportedLists";
import { useChatChannelLocales } from "../Chat/localizable/useChatChannelLocales";
import { useTranslation } from "react-i18next";
import { ChannelType } from "../Chat/Messenger/types";
import BroadcastNoteModal from "./BroadcastNoteModal/BroadcastNoteModal";
import BroadcastChannel from "./BroadcastChannel/BroadcastChannel";
import {
  FacebookOTNBroadcastMapEnum,
  FacebookOTNBroadcastMapType,
} from "features/Facebook/models/FacebookOTNTypes";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { htmlEscape } from "../../lib/utility/htmlEscape";

export function NewBroadcastHeader(props: {
  channels: ChannelType[];
  send: () => Promise<void>;
  scheduledAt?: string;
  updatedSelectedChannel: (channel: ChannelType) => void;
  channelsWithIds: TargetedChannelType[];
  contactLists?: number[];
  selectedChannel: string;
}) {
  const {
    channels,
    updatedSelectedChannel,
    channelsWithIds,
    send,
    scheduledAt,
    contactLists,
    selectedChannel,
  } = props;
  const {
    broadcastDispatch,
    isNoteModalOpen,
    formErrors,
    campaignChannelMessages,
    isReviewModalVisible,
  } = useContext(BroadcastContext);
  const { broadcastChannelNameDisplay, toChannelNames } =
    useChatChannelLocales();
  const foundFbCampaignIndex = campaignChannelMessages.findIndex((chnl) =>
    chnl.targetedChannelWithIds.some(
      (channel) => channel.channel === "facebook"
    )
  );

  let facebookSelectedType: FacebookOTNBroadcastMapEnum | undefined;
  if (foundFbCampaignIndex > -1) {
    facebookSelectedType =
      campaignChannelMessages[foundFbCampaignIndex].facebookOTN?.tab ??
      undefined;
  }

  const companyChannels = useCompanyChannels();
  const [_, isLoading] = useState(false);
  const { lists } = useImportedLists();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const sendBroadcast = async () => {
    isLoading(true);
    try {
      await send();
    } catch (e) {
      flash(t("flash.broadcast.error", { error: `${htmlEscape(e)}` }));
    } finally {
      isLoading(false);
    }
  };

  const whatsappOnlyChannels =
    channelsWithIds
      .filter((channel) =>
        ["whatsapp", "twilio_whatsapp", "whatsapp360dialog"].includes(
          channel.channel
        )
      )
      .map((channel) => channel.ids)
      ?.flat(1) ?? [];

  const isIncludedChatAPI = companyChannels
    .filter((channel) => channel.type === "whatsapp")
    .some((channel) =>
      channel.configs?.some((config) =>
        whatsappOnlyChannels.includes(config.wsChatAPIInstance)
      )
    );
  const isIncludedOfficialChannel = companyChannels
    .filter((channel) => channel.type === "twilio_whatsapp")
    .some((channel) =>
      channel.configs?.some((config) =>
        whatsappOnlyChannels.includes(config.twilioAccountId)
      )
    );

  function closeNoteModal() {
    broadcastDispatch({
      type: "TOGGLE_NOTE_MODAL",
      isNoteModalOpen: false,
    });
  }

  function confirmNoteModal() {
    closeNoteModal();
    broadcastDispatch({
      type: "UPDATE_OTHER_CHANNELS",
      otherChannelsWithIds: [
        {
          channel: "note",
        },
      ],
    });
  }

  function isErrorExists(channel: ChannelType, index: number) {
    if (channel === "wechat") {
      if (
        !formErrors["name"] &&
        !formErrors[`campaignChannelMessages[${index}].files`] &&
        !formErrors[`campaignChannelMessages[${index}].content`] &&
        !formErrors["contactLists"]
      ) {
        return false;
      } else {
        return true;
      }
    }
    if (isAnyWhatsappChannel(channel)) {
      let result = false;
      result = Object.keys(
        campaignChannelMessages[index].sendWhatsAppTemplate?.variables
          .content ?? []
      ).some((value) => {
        return (
          formErrors[
            `campaignChannelMessages[${index}].sendWhatsAppTemplate.variables.content[${value}]`
          ] !== undefined
        );
      });
      if (channel === "whatsapp360dialog" && !result) {
        result = Object.keys(
          campaignChannelMessages[index].sendWhatsAppTemplate?.variables
            .header ?? []
        ).some((value) => {
          return (
            formErrors[
              `campaignChannelMessages[${index}].sendWhatsAppTemplate.variables.header[${value}]`
            ] !== undefined
          );
        });
        if (
          !result &&
          campaignChannelMessages[index].sendWhatsAppTemplate?.templateContent
            ?.header &&
          campaignChannelMessages[index].sendWhatsAppTemplate?.templateContent
            ?.header?.format !== "TEXT"
        ) {
          result =
            formErrors[
              `campaignChannelMessages[${index}].sendWhatsAppTemplate.file`
            ] !== undefined;
        }
      }
      if (result) {
        return true;
      }
    }
    if (channel === "facebook" && facebookSelectedType) {
      if (
        !formErrors["name"] &&
        !formErrors[`campaignChannelMessages[${index}].content`] &&
        !formErrors[`campaignChannelMessages[${index}].facebookOTN`] &&
        facebookSelectedType === FacebookOTNBroadcastMapType.messageTag &&
        !formErrors["contactLists"]
      ) {
        return false;
      } else if (
        !formErrors["name"] &&
        !formErrors[`campaignChannelMessages[${index}].content`] &&
        !formErrors[`campaignChannelMessages[${index}].facebookOTN`] &&
        facebookSelectedType === FacebookOTNBroadcastMapType.facebookOTN
      ) {
        return false;
      } else {
        return true;
      }
    }
    return (
      formErrors[`campaignChannelMessages[${index}].content`] !== undefined
    );
  }

  return (
    <>
      <div className="header">
        <div className="channel-list">
          {channels.map((channel, index) => (
            <BroadcastChannel
              key={index}
              index={index}
              iconFactory={iconFactory(channel)}
              channelName={broadcastChannelNameDisplay[channel]}
              updatedSelectedChannel={() => updatedSelectedChannel(channel)}
              isError={isErrorExists(channel, index)}
              isSelected={selectedChannel === channel}
            />
          ))}
        </div>
      </div>
      {isNoteModalOpen && (
        <BroadcastNoteModal
          closeModal={closeNoteModal}
          confirm={confirmNoteModal}
        />
      )}
      <ConfirmSend
        channels={channelsWithIds.reduce(toChannelNames(companyChannels), [])}
        isIncludedChatAPI={isIncludedChatAPI}
        isIncludedOfficialChannel={isIncludedOfficialChannel}
        lists={
          lists.filter((list) => contactLists?.includes(list.id) ?? false) ?? []
        }
        confirmText={
          scheduledAt
            ? t("broadcast.edit.confirm.button.schedule")
            : t("broadcast.edit.confirm.button.send")
        }
        show={isReviewModalVisible}
        onConfirm={() => {
          broadcastDispatch({ type: "TOGGLE_PREVIEW_MODAL", show: false });
          sendBroadcast();
        }}
        onCancel={() => {
          broadcastDispatch({ type: "TOGGLE_PREVIEW_MODAL", show: false });
        }}
      />
    </>
  );
}
