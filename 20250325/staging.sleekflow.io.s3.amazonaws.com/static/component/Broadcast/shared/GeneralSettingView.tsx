import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { FieldError } from "../../shared/form/FieldError";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import errorStyles from "../../shared/form/FieldError.module.css";
import { useBroadcastLocales } from "../localizable/useBroadcastLocales";
import { ChannelType } from "../../Chat/Messenger/types";
import { ChannelsValueDropdown } from "../../shared/ChannelsValueDropdown";
import { MatchChannel } from "../GeneralSetting";
import { TargetedChannelType } from "../../../types/BroadcastCampaignType";
import { Button, Checkbox } from "semantic-ui-react";
import TestMessageDropdown from "../TestMessageDropdown";
import { useDisableControls } from "../../../core/components/DisableControls/DisableControls";

const DEFAULT_FALLBACK_CHANNELS = [
  "whatsapp",
  "twilio_whatsapp",
  "whatsapp360dialog",
  "whatsappcloudapi",
  "sms",
  "facebook",
];

export function GeneralSettingView(props: {
  formErrors: Record<string, string>;
  selectedChannel?: ChannelType;
  title: string;
  onTitleChange: (title: string) => void;
  toggleAllChannels?: () => void;
  channels: TargetedChannelType[] | undefined;
  enabledChannels: string[];
  fallbackChannels: TargetedChannelType[] | undefined;
  setChannels: (data: TargetedChannelType[]) => void;
  multipleChannels: boolean;
  onUpdateFallbackChannels?: (data: TargetedChannelType[]) => void;
  onSendTestMessage: (profileIdList: string[]) => void;
  sendTestMessageDisabled: boolean;
  selectedAll: boolean;
  contactsInput: ReactNode;
  scheduleInput?: ReactNode;
  disableChannelsInput?: boolean;
}) {
  const {
    formErrors,
    selectedChannel,
    onTitleChange,
    title,
    channels = [],
    fallbackChannels,
    setChannels,
    selectedAll,
    enabledChannels,
    toggleAllChannels,
    onUpdateFallbackChannels,
    onSendTestMessage,
    sendTestMessageDisabled,
    multipleChannels,
    disableChannelsInput,
  } = props;

  const { disabled } = useDisableControls();
  const { t } = useTranslation();
  const { validateFormMessage } = useBroadcastLocales();
  const [testProfileIdList, setTestProfileIdList] = useState<string[]>([]);
  const [testMessageLoading, setTestMessageLoading] = useState(false);

  const channelsAvailable = channels.filter((c) =>
    enabledChannels.includes(c.channel)
  );
  const enableTestButton =
    testProfileIdList.length > 0 &&
    (channelsAvailable.length > 0 || channels.some(MatchChannel("note"))) &&
    !sendTestMessageDisabled &&
    !testMessageLoading;

  async function sendTestMessage() {
    setTestMessageLoading(true);
    await onSendTestMessage(testProfileIdList);
    setTestMessageLoading(false);
  }

  return (
    <div className="general-settings">
      <h3>{t("broadcast.edit.sidebar.title")}</h3>
      <div className="field">
        <label>{t("broadcast.edit.field.title.label")}</label>
        <div className="ui input">
          <FieldError
            text={validateFormMessage[formErrors["name"]]}
            position={"above"}
          />
          <InfoTooltip
            placement={"right"}
            children={
              selectedChannel === "wechat"
                ? t("broadcast.tooltip.campaign.weChatTitle")
                : t("broadcast.tooltip.campaign.title")
            }
            trigger={
              <input
                type={"text fluid"}
                placeholder={t("broadcast.edit.field.title.placeholder")}
                onChange={(e) => onTitleChange(e.target.value)}
                defaultValue={title}
                disabled={disabled}
                className={
                  validateFormMessage[formErrors["name"]]
                    ? errorStyles.hasError
                    : ""
                }
              />
            }
          />
        </div>
      </div>
      <div className="field">
        <label>{t("broadcast.edit.field.addChannels.label")}</label>
        <FieldError
          text={validateFormMessage[formErrors.channels]}
          position={"above"}
        />
        <InfoTooltip
          placement={"right"}
          children={t("broadcast.tooltip.campaign.addChannels")}
          trigger={
            <ChannelsValueDropdown
              value={multipleChannels ? channels : channels.slice(0, 1)}
              placeholder={t("broadcast.edit.field.addChannels.placeholder")}
              filterChannel={fallbackChannels}
              onChange={setChannels}
              selectAll={selectedAll}
              multiple={multipleChannels}
              search={multipleChannels}
              excludeAll
              enabledChannels={enabledChannels}
              disabled={disabled}
            />
          }
        />
      </div>
      {toggleAllChannels && multipleChannels && (
        <div className="field">
          <Checkbox
            key={`checkbox_all_channel`}
            value={""}
            checked={selectedAll}
            label={t("broadcast.edit.field.checked.label")}
            onClick={disabled ? undefined : toggleAllChannels}
            disabled={disabled}
          />
        </div>
      )}
      {onUpdateFallbackChannels !== undefined && multipleChannels && (
        <div className="field">
          <label>{t("broadcast.edit.field.channel.label")}</label>
          <FieldError
            text={validateFormMessage[formErrors.channelsWithIds]}
            position={"above"}
          />
          <InfoTooltip
            placement={"right"}
            children={t("broadcast.tooltip.campaign.channel")}
            trigger={
              <ChannelsValueDropdown
                value={fallbackChannels ? fallbackChannels : []}
                onChange={onUpdateFallbackChannels}
                filterChannel={channels}
                multiple={true}
                excludeAll={true}
                enabledChannels={DEFAULT_FALLBACK_CHANNELS}
                isGroupByChannelName={true}
                disabled={disabled || disableChannelsInput}
                hasError={Boolean(
                  validateFormMessage[formErrors.channelsWithIds]
                )}
              />
            }
          />
        </div>
      )}
      {
        <div className={"field contact-list-selection"}>
          {props.contactsInput}
        </div>
      }
      {props.scheduleInput && (
        <div className="field">
          <label>{t("broadcast.edit.field.schedule.label")}</label>
          {props.scheduleInput}
        </div>
      )}
      <div className="field">
        <label>{t("broadcast.edit.test.header")}</label>
        <label className="secondary">{t("broadcast.edit.test.hint")}</label>
        <TestMessageDropdown
          profileIdList={testProfileIdList}
          setProfileIdList={setTestProfileIdList}
          disabled={disabled}
        />
      </div>
      <Button
        className="submit-test-button"
        loading={testMessageLoading}
        disabled={!enableTestButton || disabled}
        onClick={enableTestButton || !disabled ? sendTestMessage : undefined}
      >
        {t("broadcast.edit.test.send")}
      </Button>
    </div>
  );
}
