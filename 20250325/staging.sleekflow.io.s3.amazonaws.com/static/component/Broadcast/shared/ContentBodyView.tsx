import React from "react";
import InfoTip from "../../shared/infoTip/InfoTip";
import NewBroadcastContentHeader from "../NewBroadcastContentHeader/NewBroadcastContentHeader";
import BroadcastTemplateDisplay from "./BroadcastTemplateDisplay/BroadcastTemplateDisplay";
import BroadcastOverlay from "../BroadcastOverlay/BroadcastOverlay";
import { ChannelMessageType } from "../../../types/BroadcastCampaignType";
import { UpdateContentInterface } from "../BroadcastContext";
import { useTranslation } from "react-i18next";
import { useBroadcastLocales } from "../localizable/useBroadcastLocales";
import { useDisableControls } from "../../../core/components/DisableControls/DisableControls";

export function ContentBodyView(props: {
  isOfficialChannel: boolean;
  isSelectedTemplate: boolean;
  params: string[];
  warning?: JSX.Element;
  contentLoaded: boolean;
  selectedChannelMessage: ChannelMessageType;
  selectedChannelMessageIndex: number;
  templateContent: string | undefined;
  formErrors: Record<string, string>;
  enableTextEditMode: () => void;
  isOptIn: boolean;
  isSMSWordExceedLimit: boolean;
  smsWordLimit: number;
  characterLimit?: string | undefined;
  updateChange: (input: HTMLTextAreaElement) => void;
  updateContent: UpdateContentInterface;
  readonly: boolean;
  startTemplateSelection: () => void;
  clearTemplateSelection: () => void;
  beforeHeader?: JSX.Element;
}) {
  const {
    characterLimit,
    contentLoaded,
    enableTextEditMode,
    formErrors,
    isOfficialChannel,
    isOptIn,
    isSMSWordExceedLimit,
    isSelectedTemplate,
    params,
    selectedChannelMessage,
    selectedChannelMessageIndex,
    smsWordLimit,
    startTemplateSelection,
    updateChange,
    updateContent,
    warning,
    templateContent,
    // readonly,
  } = props;

  const { t } = useTranslation();
  const { disabled } = useDisableControls();
  const { validateFormMessage } = useBroadcastLocales();
  const isTwilioTemplateSelected = isSelectedTemplate && isOfficialChannel;

  return (
    <>
      {warning && (
        <InfoTip
          className={`marginLeft ${
            isTwilioTemplateSelected && params.length > 0
              ? "template-selected-params"
              : ""
          }`}
        >
          {warning}
        </InfoTip>
      )}
      {props.beforeHeader}
      <NewBroadcastContentHeader
        isOfficialChannelSelected={isOfficialChannel && !disabled}
        isTemplateSelected={
          isSelectedTemplate && selectedChannelMessage?.mode === "template"
        }
        isDisplaySelectTemplateLink={selectedChannelMessage?.mode === "type"}
        errorMessage={
          validateFormMessage[
            formErrors[
              `campaignChannelMessages[${selectedChannelMessageIndex}].content`
            ]
          ]
        }
        clearTemplateSelection={props.clearTemplateSelection}
        showTemplateSelection={props.startTemplateSelection}
        characterLimit={characterLimit}
        isSMSWordExceedLimit={!!isSMSWordExceedLimit}
      />

      {isTwilioTemplateSelected ? (
        <BroadcastTemplateDisplay
          selectedMessageIndex={selectedChannelMessageIndex}
          sendWhatsappTemplate={selectedChannelMessage?.sendWhatsAppTemplate}
          updateContent={updateContent}
          params={params}
          templateContent={templateContent ?? selectedChannelMessage?.content}
          configId={selectedChannelMessage?.targetedChannelWithIds
            ?.map((t) => t.ids!)
            .flat(1)}
          errors={formErrors}
        />
      ) : isOfficialChannel &&
        selectedChannelMessage?.mode === "template" &&
        selectedChannelMessage.templateName === undefined ? (
        <BroadcastOverlay
          ableToTypeMessage={enableTextEditMode}
          clickTemplate={startTemplateSelection}
          isOptInEnabled={isOptIn}
          disabled={disabled}
        />
      ) : (
        <div className="content">
          <textarea
            className={"ui input text-content"}
            id={"new-broadcast-text-content"}
            value={selectedChannelMessage?.content}
            onChange={(event) => updateChange(event.target)}
            onInput={(event) => updateChange(event.currentTarget)}
            placeholder={t("broadcast.edit.field.content.placeholder")}
            disabled={disabled}
          />
          {isSMSWordExceedLimit && (
            <div className={`counter exceed-limit`}>
              {selectedChannelMessage?.content.length}/{smsWordLimit}
            </div>
          )}
        </div>
      )}
    </>
  );
}
