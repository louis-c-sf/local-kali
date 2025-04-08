import React, { useCallback, useContext, useEffect, useState } from "react";
import { Dropdown } from "semantic-ui-react";
import BroadcastContext from "./BroadcastContext";
import { post } from "../../api/apiRequest";
import { TargetedChannelType } from "../../types/BroadcastCampaignType";
import { POST_BROADCAST_WITH_TEMPLATE } from "../../api/apiPath";
import ContactListSelection from "./ContactListSelection";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import ScheduleSetting from "./ScheduleSetting";
import { useTranslation } from "react-i18next";
import { useBroadcastLocales } from "./localizable/useBroadcastLocales";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import useCountingChannels from "../Chat/hooks/useCountingChannels";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { saveCampaign } from "./NewBroadcastHeader/saveCampaign";
import { useValidateBroadcastForm } from "./validator/useValidateBroadcastForm";
import { validateWeChatBroadcast } from "./validator/validateWeChatBroadcast";
import { GeneralSettingView } from "./shared/GeneralSettingView";
import TimeZoneInfoType from "../../types/TimeZoneInfoType";
import { equals, includes } from "ramda";
import {
  FacebookOTNBroadcastMapEnum,
  FacebookOTNBroadcastMapType,
} from "features/Facebook/models/FacebookOTNTypes";
import { useDisableControls } from "../../core/components/DisableControls/DisableControls";
import { ChannelType } from "../Chat/Messenger/types";

export function MatchChannel(name: string) {
  return (c: TargetedChannelType) => c.channel === name;
}

export const ENABLED_CHANNELS: ChannelType[] = [
  "whatsapp",
  "twilio_whatsapp",
  "line",
  "sms",
  "note",
  "wechat",
  "whatsapp360dialog",
  "facebook",
  "viber",
  "telegram",
  "whatsappcloudapi",
];

export function GeneralSetting() {
  const company = useAppSelector((s) => s.company, equals);
  const { validateForm } = useValidateBroadcastForm();
  const loginDispatch = useAppDispatch();
  const {
    broadcastDispatch,
    selectedChannel,
    id,
    name,
    channelsWithIds,
    campaignChannelMessages,
    contactLists,
    formErrors,
    channelWithId,
    otherChannelsWithIds,
    scheduledAt,
    status,
    selectedAll,
    automationActions,
    stripePaymentRequestOption,
    rules,
  } = useContext(BroadcastContext);
  const { disabled } = useDisableControls();
  const { t } = useTranslation();
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const [loading, isLoading] = useState(false);
  const { scheduleOptions, validateFormMessage } = useBroadcastLocales();
  const broadcastMessageContext = {
    name,
    campaignChannelMessages,
    channelsWithIds,
  };
  const [scheduleMode, setScheduleMode] = useState<"immediately" | "scheduled">(
    "immediately"
  );
  const foundFbCampaignIndex = campaignChannelMessages.findIndex((chnl) =>
    chnl.targetedChannelWithIds.some(
      (channel) => channel.channel === "facebook"
    )
  );
  let facebookOTNSelectedTab: FacebookOTNBroadcastMapEnum | undefined;
  if (foundFbCampaignIndex !== -1) {
    facebookOTNSelectedTab =
      campaignChannelMessages[foundFbCampaignIndex].facebookOTN?.tab ??
      FacebookOTNBroadcastMapType.messageTag;
  }
  const disableChannelsInput =
    selectedChannel === "facebook" &&
    facebookOTNSelectedTab === FacebookOTNBroadcastMapType.facebookOTN;

  const flash = useFlashMessageChannel();

  const channelCount = useCountingChannels(ENABLED_CHANNELS);
  useEffect(() => {
    if (channelCount) {
      broadcastDispatch({
        type: "UPDATE_TOTAL_CHANNELS",
        numOfChannels: channelCount,
      });
    }
  }, [channelCount]);

  useEffect(() => {
    if (status?.toLowerCase() === "scheduled") {
      setScheduleMode("scheduled");
    }
  }, [status]);

  useEffect(() => {
    if (scheduleMode === "immediately" && scheduledAt) {
      setScheduleMode("scheduled");
    }
  }, [scheduledAt, scheduleMode]);

  const onScheduleDropdownChanged = (type: typeof scheduleMode) => {
    if (type === "immediately") {
      broadcastDispatch({ type: "UPDATE_SCHEDULE", scheduledAt: undefined });
    } else {
      broadcastDispatch({
        type: "UPDATE_SCHEDULE",
        scheduledAt: moment().utcOffset(0).toISOString(),
      });
    }
    setScheduleMode(type);
  };
  const onAddFallbackChannel = useCallback(
    (data: TargetedChannelType[]) => {
      broadcastDispatch({
        type: "UPDATE_CHANNELS",
        channelsWithIds: data,
      });
    },
    [broadcastDispatch]
  );
  const onAddOtherChannels = (data: TargetedChannelType[]) => {
    if (data.length === 0) {
      return;
    }
    const lastChannel = data[data.length - 1];
    if (data.length > 1 && lastChannel?.channel === "note") {
      broadcastDispatch({
        type: "TOGGLE_NOTE_MODAL",
        isNoteModalOpen: true,
      });
      return;
    }
    if (
      lastChannel &&
      lastChannel.channel === "whatsapp360dialog" &&
      !otherChannelsWithIds?.some((ch) => includes(lastChannel.ids)([ch.ids]))
    ) {
      loginDispatch({
        type: "INBOX.WHATSAPP_360TEMPLATE.RESET",
      });
    }
    broadcastDispatch({
      type: "UPDATE_OTHER_CHANNELS",
      otherChannelsWithIds: data,
    });
  };
  const handleTitleChange = (title: string) => {
    broadcastDispatch({ type: "UPDATE_TITLE", name: title });
  };

  const sendTestMessage = async (selectedTestEmailList: string[]) => {
    if (!company) {
      return;
    }
    try {
      const getProfileIds = [...selectedTestEmailList];
      if (getProfileIds.length > 0) {
        isLoading(true);
        const { errors } = validateForm(broadcastMessageContext, false);
        const errorMessage = validateWeChatBroadcast(
          broadcastMessageContext,
          errors
        );
        broadcastDispatch({
          type: "VALIDATION_COMPLETE",
          errors: errorMessage,
        });
        if (Object.entries(errorMessage).length > 0) {
          return;
        }
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
        // send message with specific conversations ids
        await post(POST_BROADCAST_WITH_TEMPLATE, {
          param: {
            UserProfileIds: getProfileIds,
            templeteId: result.id,
            IsTestMessage: true,
          },
        });
        isLoading(false);
        flash(t("flash.broadcast.success", { count: getProfileIds.length }));
      }
    } catch (e) {
      console.error(`sendTestMessage error ${e}`);
    } finally {
      isLoading(false);
    }
  };

  function toggleAllChannels() {
    broadcastDispatch({
      type: "UPDATE_SELECT_ALL_CHANNELS",
      selectedAll: !selectedAll,
    });
  }

  const isSelectedNoteChannel = channelsWithIds.some(
    (channel) => channel.channel === "note"
  );

  useEffect(() => {
    if (disableChannelsInput) {
      onAddFallbackChannel([]);
      broadcastDispatch({
        type: "UPDATE_CONTACT_LISTS",
        contactLists: [],
      });
    }
  }, [
    facebookOTNSelectedTab,
    onAddFallbackChannel,
    broadcastDispatch,
    disableChannelsInput,
  ]);

  return (
    <GeneralSettingView
      formErrors={formErrors}
      title={name}
      selectedChannel={selectedChannel}
      onUpdateFallbackChannels={
        !isSelectedNoteChannel ? onAddFallbackChannel : undefined
      }
      scheduleInput={
        <ScheduleInput
          disabled={disabled}
          schedule={scheduledAt}
          scheduleMode={scheduleMode}
          setSchedule={onScheduleDropdownChanged}
          scheduleOptions={scheduleOptions}
          selectedTimeZone={selectedTimeZone}
          timeZoneInfo={company?.timeZoneInfo}
        />
      }
      multipleChannels={rules.canUseMultipleChannels}
      onTitleChange={handleTitleChange}
      toggleAllChannels={toggleAllChannels}
      channels={otherChannelsWithIds}
      enabledChannels={ENABLED_CHANNELS}
      fallbackChannels={channelWithId ? [channelWithId] : undefined}
      setChannels={onAddOtherChannels}
      onSendTestMessage={sendTestMessage}
      sendTestMessageDisabled={loading}
      selectedAll={selectedAll}
      contactsInput={
        <ContactListSelection
          error={validateFormMessage[formErrors.contactLists]}
          disabled={disabled || disableChannelsInput}
        />
      }
      disableChannelsInput={disableChannelsInput}
    />
  );
}

function ScheduleInput(props: {
  scheduleMode: "immediately" | "scheduled";
  scheduleOptions: any;
  setSchedule: (val: "immediately" | "scheduled") => void;
  schedule: string | undefined;
  disabled: boolean;
  timeZoneInfo: TimeZoneInfoType | undefined;
  selectedTimeZone: number;
}) {
  const {
    disabled,
    scheduleMode,
    scheduleOptions,
    setSchedule,
    timeZoneInfo,
    selectedTimeZone,
    schedule,
  } = props;
  const { t } = useTranslation();
  const timeZoneDisplay = moment().utcOffset(selectedTimeZone).format("Z");

  return (
    <>
      <InfoTooltip
        placement={"right"}
        children={t("broadcast.tooltip.campaign.schedule")}
        trigger={
          <Dropdown
            value={scheduleMode}
            selection
            selectOnBlur={false}
            className="schedule-selection"
            options={scheduleOptions}
            upward={false}
            onChange={(event, data) => {
              setSchedule(data.value as "immediately" | "scheduled");
            }}
            disabled={disabled}
          />
        }
      />
      {scheduleMode === "scheduled" && (
        <div className="schedule-range">
          <label className="secondary">
            {t("broadcast.edit.field.date.label")}
          </label>
          <ScheduleSetting scheduledAt={schedule} disabled={disabled} />
          {timeZoneInfo && (
            <div className="timezone-info">
              <label className="secondary">
                {t("broadcast.edit.timezone", {
                  timezone: timeZoneInfo?.standardName,
                })}
              </label>
              <label className="secondary">
                GMT: {`${timeZoneDisplay}:00`}
              </label>
            </div>
          )}
        </div>
      )}
    </>
  );
}
