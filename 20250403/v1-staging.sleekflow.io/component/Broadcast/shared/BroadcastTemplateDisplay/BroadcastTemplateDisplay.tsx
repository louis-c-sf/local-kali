import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./BroadcastTemplateDisplay.module.css";
import { useTranslation } from "react-i18next";
import {
  UPDATED_PART_ENUM,
  Whatsapp360DialogFileUploadType,
} from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import { SendWhatsappTemplateState } from "../../../../types/BroadcastCampaignType";
import { assoc, mergeDeepRight, mergeRight } from "ramda";
import { BroadcastOptInTemplateDisplay } from "./BroadcastOptInTemplateDisplay";
import UploadHeaderFile from "./UploadHeaderFile";
import { HeaderFormatEnum } from "../../../../types/WhatsappTemplateResponseType";
import BroadcastContext, {
  UpdateContentInterface,
} from "../../BroadcastContext";
import { replaceParamContent } from "./replaceParamContent";
import { useDisableControls } from "../../../../core/components/DisableControls/DisableControls";
import { DynamicURLButton, isDynamicUrlButtonExist } from "./DynamicURLButton";
import DOMPurify from "dompurify";

export default function BroadcastTemplateDisplay(props: {
  selectedMessageIndex: number;
  templateContent: string;
  params: string[];
  updateContent: UpdateContentInterface;
  sendWhatsappTemplate?: SendWhatsappTemplateState;
  configId?: string[];
  errors?: Record<string, string>;
}) {
  const {
    templateContent,
    params,
    updateContent,
    sendWhatsappTemplate,
    configId,
    errors,
    selectedMessageIndex,
  } = props;

  const [displayContent, setDisplayContent] = useState("");
  const { disabled } = useDisableControls();
  const { t } = useTranslation();
  const { campaignChannelMessages } = useContext(BroadcastContext);
  const selectedChannel =
    campaignChannelMessages[selectedMessageIndex].targetedChannelWithIds[0]
      .channel;
  useEffect(() => {
    setDisplayContent(
      replaceParamContent(
        `<span class="link">{{param}}</span>`,
        params,
        templateContent
      )
    );
    updateContent(
      "content",
      replaceParamContent(`{{param}}`, params, templateContent)
    );
  }, [params.join(",")]);

  const uploadFileContent = useCallback(
    (uploadedFile: Whatsapp360DialogFileUploadType | undefined) => {
      if (!sendWhatsappTemplate) {
        return;
      }
      if (!uploadedFile) {
        updateContent(
          "sendWhatsAppTemplate",
          mergeDeepRight(sendWhatsappTemplate, {
            file: undefined,
          })
        );
      } else {
        updateContent(
          "sendWhatsAppTemplate",
          mergeDeepRight(sendWhatsappTemplate, {
            file: uploadedFile,
          })
        );
      }
    },
    [sendWhatsappTemplate]
  );
  const updateVarChanged = useCallback(
    (updatedPart: UPDATED_PART_ENUM, name: string, value: string) => {
      if (!sendWhatsappTemplate) {
        return;
      }
      updateContent(
        "sendWhatsAppTemplate",
        mergeDeepRight(sendWhatsappTemplate, {
          variables: {
            [updatedPart]: {
              [name]: value,
            },
          },
        })
      );
    },
    [JSON.stringify(sendWhatsappTemplate)]
  );
  const updateLastVarInputId = useCallback(
    (name: string) => {
      if (!sendWhatsappTemplate) {
        return;
      }
      updateContent(
        "sendWhatsAppTemplate",
        mergeRight(sendWhatsappTemplate, {
          lastVarInputId: name,
        })
      );
    },
    [
      sendWhatsappTemplate?.lastVarInputId,
      JSON.stringify(sendWhatsappTemplate?.variables),
    ]
  );
  return (
    <div className={styles.templateContainer}>
      <div className={styles.container}>
        {sendWhatsappTemplate ? (
          <BroadcastOptInTemplateDisplay
            errors={props.errors}
            selectedChannelIndex={selectedMessageIndex}
            updateVarChanged={updateVarChanged}
            updateLastVarInputId={updateLastVarInputId}
            sendWhatsappTemplate={sendWhatsappTemplate}
            disabled={disabled}
          />
        ) : (
          <div className={styles.body}>
            {params.length > 0 ? (
              <div
                dangerouslySetInnerHTML={{ __html: purify(displayContent) }}
              />
            ) : (
              templateContent
            )}
          </div>
        )}
      </div>
      <div className={styles.note}>{t("broadcast.edit.template.note")}</div>
      {sendWhatsappTemplate?.templateContent?.header?.format &&
        sendWhatsappTemplate.templateContent.header.format !==
          HeaderFormatEnum.TEXT &&
        configId && (
          <UploadHeaderFile
            selectedChannel={selectedChannel}
            upploadFileContent={uploadFileContent}
            selectedChannelIndex={selectedMessageIndex}
            header={sendWhatsappTemplate.templateContent.header}
            file={sendWhatsappTemplate.file}
            configId={configId[0]}
            error={
              errors &&
              errors[
                `campaignChannelMessages[${selectedMessageIndex}].sendWhatsAppTemplate.file`
              ]
            }
          />
        )}
      {isDynamicUrlButtonExist(selectedChannel, sendWhatsappTemplate) && (
        <DynamicURLButton
          errors={props.errors}
          selectedChannelIndex={selectedMessageIndex}
          updateVarChanged={updateVarChanged}
          updateLastVarInputId={updateLastVarInputId}
          button={sendWhatsappTemplate?.variables?.button ?? {}}
          disabled={disabled}
          template={sendWhatsappTemplate?.templateContent}
        />
      )}
    </div>
  );
}

function purify(input: string): string {
  return DOMPurify.sanitize(input);
}
