import React, { useContext, useEffect, useState } from "react";
import BroadcastContext, { UpdateContentInterface } from "./BroadcastContext";
import { VariablesSelection } from "./VariablesSelection";
import { ImagesInput } from "./ImagesInput";
import { Dimmer, Loader } from "semantic-ui-react";
import { useParams } from "react-router";
import { equals, mergeRight } from "ramda";
import { FieldError } from "../shared/form/FieldError";
import { useBroadcastLocales } from "./localizable/useBroadcastLocales";
import {
  ChannelMessageType,
  UpdateSelectedCampaignMessageType,
  SendWhatsappTemplateState,
} from "../../types/BroadcastCampaignType";
import { deleteMethod, post } from "../../api/apiRequest";
import {
  DELETE_BROADCAST_FILE,
  POST_UPDATE_ATTACHMENT_IMAGE,
} from "../../api/apiPath";
import { UploadedBroadcastFileType } from "../../types/UploadedFileType";
import { ChannelType, WhatsappChannelType } from "../Chat/Messenger/types";
import useRouteConfig from "../../config/useRouteConfig";
import getIsReadOnlyCampaign from "./helpers/getIsReadOnlyCampaign";
import { BroadcastResponseType } from "../../api/Broadcast/fetchBroadcastCampaign";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { SelectMode } from "../Chat/Messenger/SelectWhatsappTemplate/SelectMode/SelectMode";
import { useWhatsappTemplates } from "../../container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import {
  getInputId,
  getIsVarsSetValid,
} from "../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import BroadcastTitle from "./shared/BroadcastTitle";
import { ContentBodyView } from "./shared/ContentBodyView";
import { useBroadcastChannelLocales } from "./shared/useBroadcastChannelLocales";
import PaymentLinkDetail from "./PaymentLinkDetail";
import { BroadcastOptInContextProvider } from "./shared/BroadcastTemplateDisplay/BroadcastOptInContext";
import FacebookOTNBroadcastTypeSelection from "../../features/Facebook/usecases/Broadcast/components/FacebookOTNBroadcastTypeSelection";
import { useDisableControls } from "core/components/DisableControls/DisableControls";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { useTwilioOptInQuery } from "api/Company/useTwilioOptInQuery";
import { useWhatsappTwilioChat } from "features/WhatsappTwilio/usecases/Inbox/useWhatsappTwilioChat";
import { useSelectWhatsappTemplateFlow } from "component/Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { getTemplateResponseKey } from "lib/utility/getTemplateResponseKey";

const CHANNELS_NOT_ALLOWED_FILES_ATTACHED: [
  ChannelType,
  ChannelType,
  ChannelType
] = ["twilio_whatsapp", "whatsapp360dialog", "whatsappcloudapi"];
const SMS_WORD_LIMIT = 160;
const CHANNELS_ONLY_ALLOWED_IMAGE: [ChannelType, ChannelType] = [
  "wechat",
  "line",
];

function extractVarNameFromInputId(name: string) {
  const updatedPart = name.substring(0, name.indexOf("_"));
  const variableName = name.replace(`${updatedPart}_`, "");
  return { updatedPart, variableName };
}

export function updateWhatsappTemplateVariables(
  name: string,
  template: SendWhatsappTemplateState,
  text: string
) {
  const { updatedPart, variableName } = extractVarNameFromInputId(name);
  const variablesUpdated = {
    ...template.variables,
    [updatedPart]: {
      ...template.variables[updatedPart],
      [variableName]: text,
    },
  };
  return variablesUpdated;
}

export default function NewBroadcastContent(props: {
  selectedChannelIndex: number;
  selectedChannel: ChannelType;
  selectedChannelMessage?: ChannelMessageType;
  updatedContent: UpdateContentInterface;
}) {
  const {
    broadcastDispatch,
    contentLoaded,
    formErrors,
    selectedTemplate,
    status,
    templateSelection,
    stripePaymentRequestOption,
  } = useContext(BroadcastContext);
  const isPaymentIntegrationEnabled = useAppSelector(
    (s) => s.company?.addonStatus?.isPaymentIntegrationEnabled
  );
  const readOnly = getIsReadOnlyCampaign(status);
  const [template] = selectedTemplate?.whatsapp_template ?? [];
  const {
    selectedChannel,
    selectedChannelMessage,
    updatedContent,
    selectedChannelIndex,
  } = props;
  const whatsappTemplates = useAppSelector(
    (s) => s.inbox.whatsAppTemplates,
    equals
  );
  const params = selectedChannelMessage?.officialTemplateParams ?? [];
  const optInQuery = useTwilioOptInQuery();
  const [isOptIn, setIsOptIn] = useState(optInQuery.optIn.isOptInOn);
  const { disabled } = useDisableControls();
  const selectedWhatsApp360Dialogs = useAppSelector((s) =>
    s.company?.whatsApp360DialogConfigs?.filter((config) =>
      selectedChannelMessage?.targetedChannelWithIds.find(
        (t) =>
          t.channel === "whatsapp360dialog" &&
          t.ids?.includes(String(config.id))
      )
    )
  );

  const selectedWhatsAppCloudApi = useAppSelector((s) =>
    s.company?.whatsappCloudApiConfigs?.filter((config) =>
      selectedChannelMessage?.targetedChannelWithIds.find(
        (t) =>
          t.channel === "whatsappcloudapi" &&
          t.ids?.includes(String(config.whatsappPhoneNumber))
      )
    )
  );

  const loginDispatch = useAppDispatch();
  const { id: routeId } = useParams<{ id?: string }>();
  const { validateFormMessage } = useBroadcastLocales();

  const updateChange = (input: HTMLTextAreaElement) => {
    updateBroadcastContent("content", input.value);
  };

  function updateBroadcastContent(
    key: keyof ChannelMessageType,
    content: UpdateSelectedCampaignMessageType
  ) {
    updatedContent(key, content);
  }

  useEffect(() => {
    optInQuery
      .fetch(false)
      .then((res) => {
        setIsOptIn(res.isOptInOn);
      })
      .catch((e) => {
        console.error(`fetchOptIn error ${e}`);
      });
  }, [optInQuery.booted]);

  useEffect(() => {
    if (!selectedWhatsApp360Dialogs) {
      return;
    }
    setIsOptIn(
      !selectedWhatsApp360Dialogs.some((config) => !config.isOptInEnable)
    );
  }, [selectedWhatsApp360Dialogs]);
  const findLastTextNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return node;
    let children = node.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      let textNode = findLastTextNode(children[i]);
      if (textNode !== null) return textNode;
    }
    return null;
  };

  async function submitFiles(id: string, data: FormData) {
    const broadcastSaved: BroadcastResponseType = await post(
      POST_UPDATE_ATTACHMENT_IMAGE.replace("{id}", id),
      {
        param: data,
        header: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const selectedChannelResponse = broadcastSaved.campaignChannelMessages.find(
      (channel) => channel.id === selectedChannelMessage?.id
    );
    const updatedFiles = broadcastSaved.uploadedFiles.reduce(
      (acc, newFile) =>
        acc.some((file) => file.id === newFile.id)
          ? [...acc]
          : [...acc, newFile],
      [...(selectedChannelMessage?.uploadedFiles ?? [])]
    );
    return selectedChannelResponse?.uploadedFiles ?? updatedFiles;
  }

  const { getChannelHeader } = useBroadcastChannelLocales({
    readOnly,
  });

  const isOfficialChannel = isAnyWhatsappChannel(selectedChannel);

  function createUploadFileProxy(fileRaw: File) {
    return {
      blobContainer: "",
      campaignUploadedFileId: "",
      id: undefined,
      filename: fileRaw.name,
      mimeType: "",
      fileProxy: fileRaw,
      url: "",
    };
  }

  function allowToEdit() {
    broadcastDispatch({
      type: "CHANGE_EDIT_MODE",
      mode: "type",
      selectedIndex: selectedChannelIndex,
    });
  }

  const twilioChat = useWhatsappTwilioChat();
  const { fetch360Templates, fetchCloudApiTemplates, fetchWhatsappTemplates } =
    useWhatsappTemplates();
  //todo load and select from separate cache to avoid bugs
  const { templates } = useSelectWhatsappTemplateFlow(
    undefined,
    selectedChannel,
    selectedWhatsAppCloudApi?.[0]?.id
  );

  useEffect(() => {
    if (selectedChannel === "whatsapp360dialog" && selectedWhatsApp360Dialogs) {
      if (!whatsappTemplates.whatsapp360Templates.booted) {
        Promise.all(
          selectedWhatsApp360Dialogs.map((config) =>
            fetch360Templates(config.id)
          )
        ).then((results) => {
          const [templates] = results;
          loginDispatch({
            type: "INBOX.WHATSAPP_360TEMPLATE.LOADED",
            templates: templates,
          });
        });
      }
    } else if (selectedChannel === "twilio_whatsapp" && twilioChat.accountSid) {
      if (!whatsappTemplates.templates.booted) {
        fetchWhatsappTemplates({
          accountSID: twilioChat.accountSid,
        }).then((templatesResp) => {
          loginDispatch({
            type: "INBOX.WHATSAPP_TEMPLATES.LOADED",
            templates: templatesResp,
          });
        });
      }
    } else if (
      selectedChannel === "whatsappcloudapi" &&
      selectedWhatsAppCloudApi
    ) {
      if (
        !whatsappTemplates.whatsappCloudApiTemplates.some(
          (s) => s.channelId === selectedWhatsAppCloudApi?.[0]?.id
        )
      ) {
        Promise.all(
          selectedWhatsAppCloudApi.map((config) =>
            fetchCloudApiTemplates(config.messagingHubWabaId, true)
          )
        ).then((results) => {
          loginDispatch({
            type: "INBOX.WHATSAPP_CLOUDAPI.LOADED",
            templates: results[0],
            channelId: selectedWhatsAppCloudApi?.[0]?.id,
          });
        });
      }
    }
  }, [selectedChannel, selectedWhatsApp360Dialogs, whatsappTemplates]);

  function updateVariableText(text: string) {
    if (
      selectedChannelMessage?.sendWhatsAppTemplate &&
      selectedChannelMessage.sendWhatsAppTemplate.lastVarInputId
    ) {
      const { sendWhatsAppTemplate } = selectedChannelMessage;
      const id = selectedChannelMessage.sendWhatsAppTemplate.lastVarInputId;
      const variablesUpdated = updateWhatsappTemplateVariables(
        id,
        sendWhatsAppTemplate,
        text
      );
      updateBroadcastContent(
        "sendWhatsAppTemplate",
        mergeRight(sendWhatsAppTemplate, {
          variables: variablesUpdated,
        })
      );
    } else {
      updateBroadcastContent("content", text);
    }
  }

  const isSMSWordExceedLimit =
    selectedChannel === "sms" &&
    selectedChannelMessage?.content &&
    selectedChannelMessage?.content.length > SMS_WORD_LIMIT;

  const selectedChannelHeader = getChannelHeader(selectedChannel);

  const beforeHeader = (
    <>
      {selectedChannel === "facebook" && (
        <FacebookOTNBroadcastTypeSelection
          updateCampaignMessage={updateBroadcastContent}
          errorMessage={
            validateFormMessage[
              formErrors[
                `campaignChannelMessages[${selectedChannelIndex}].facebookOTN`
              ]
            ]
          }
          disabled={disabled}
        />
      )}
    </>
  );
  const cancelTemplateSelection = () => {
    broadcastDispatch({
      type: "CANCEL_TEMPLATE_SELECTION",
    });
  };

  const selectTemplate = (
    templateId: string,
    language: string,
    contentSid?: string
  ) => {
    const getTemplate = (channel: string) => {
      const id = getTemplateResponseKey({
        templateName: templateId,
        language,
        channel: channel as WhatsappChannelType,
        sid: contentSid,
      });
      if (channel === "whatsapp360dialog")
        return whatsappTemplates.whatsapp360Templates.data[id].translations[
          language
        ];
      if (channel === "whatsappcloudapi") {
        const channelIds = selectedWhatsAppCloudApi?.map((s) => s.id);
        const currentChannelTemplates =
          whatsappTemplates.whatsappCloudApiTemplates.find((temp) =>
            channelIds?.includes(temp.channelId)
          );
        if (currentChannelTemplates) {
          return currentChannelTemplates.data[id].translations[language];
        }
      }
      return whatsappTemplates.templates.data[id].translations[language];
    };

    const selectedTemplate = getTemplate(selectedChannel);
    broadcastDispatch({
      type: "SELECTED_TEMPLATE_SELECTION",
      template: selectedTemplate,
      language: language,
      templateName: templateId,
      channelType: selectedChannel,
      currentId: selectedChannelIndex,
    });
  };

  return (
    <div className="content">
      <BroadcastTitle
        header={selectedChannelHeader.header}
        subHeader={selectedChannelHeader.subHeader}
      />
      {selectedChannelMessage && (
        <div
          className={`content-columns ${
            isOfficialChannel
              ? params.length > 0
                ? "template-selected-params"
                : "template-selected"
              : ""
          }`}
        >
          <Dimmer.Dimmable
            className={`text-editor-column rounded ${
              selectedChannelHeader.warning ? "has-warning" : ""
            }
            ${
              selectedChannel === "facebook"
                ? "text-editor-column-facebook"
                : ""
            }
            `}
          >
            <Dimmer active={!contentLoaded} inverted>
              <Loader active={true} inverted />
            </Dimmer>
            <BroadcastOptInContextProvider
              getIsVarValid={(name, variables, varsTouched, idx, errors) => {
                return errors
                  ? errors[
                      `campaignChannelMessages[${idx}].sendWhatsAppTemplate.variables.content[${name}]`
                    ] === undefined
                  : getIsVarsSetValid("content", name, variables, varsTouched);
              }}
            >
              <ContentBodyView
                selectedChannelMessage={selectedChannelMessage}
                isOfficialChannel={isOfficialChannel}
                isSelectedTemplate={
                  (selectedChannelMessage.isSelectedTemplate ?? false) &&
                  selectedChannelMessage?.mode === "template"
                }
                params={params}
                warning={selectedChannelHeader.warning}
                contentLoaded={contentLoaded}
                updateContent={updatedContent}
                selectedChannelMessageIndex={selectedChannelIndex}
                templateContent={template?.content}
                formErrors={formErrors}
                enableTextEditMode={allowToEdit}
                isOptIn={isOptIn}
                isSMSWordExceedLimit={isSMSWordExceedLimit || false}
                smsWordLimit={SMS_WORD_LIMIT}
                characterLimit={selectedChannelHeader.characterLimit}
                updateChange={updateChange}
                startTemplateSelection={() =>
                  broadcastDispatch({ type: "SET_TEMPLATE_SELECTION" })
                }
                clearTemplateSelection={() =>
                  broadcastDispatch({ type: "CLEAR_TEMPLATE_SELECTION" })
                }
                readonly={false}
                beforeHeader={beforeHeader}
              />
            </BroadcastOptInContextProvider>

            {(!CHANNELS_NOT_ALLOWED_FILES_ATTACHED.includes(selectedChannel) ||
              (selectedChannel === "twilio_whatsapp" && isOptIn)) && (
              <>
                <ImagesInput<UploadedBroadcastFileType>
                  uploadedFiles={selectedChannelMessage.uploadedFiles}
                  id={routeId}
                  broadcastDispatch={broadcastDispatch}
                  submitFiles={submitFiles}
                  onFilesDropped={(accepted) => {
                    updatedContent("uploadedFiles", [
                      ...selectedChannelMessage.uploadedFiles,
                      ...accepted.map((f) => createUploadFileProxy(f)),
                    ]);
                  }}
                  onFilesUploaded={(files) => {
                    if (files.length === 0) {
                      return;
                    }
                    updatedContent("uploadedFiles", files);
                  }}
                  onDropzoneConnected={(open) => {
                    broadcastDispatch({
                      type: "CONNECT_FILES_INPUT",
                      addAttachment: open,
                    });
                  }}
                  idFieldName={"campaignUploadedFileId"}
                  submitDelete={async (file) => {
                    if (file.fileProxy) {
                      updatedContent("uploadedFiles", [
                        ...selectedChannelMessage.uploadedFiles.filter(
                          (f) => f.fileProxy !== file.fileProxy
                        ),
                      ]);
                    }
                    if (file.campaignUploadedFileId) {
                      updatedContent("uploadedFiles", [
                        ...selectedChannelMessage.uploadedFiles.filter(
                          (f) =>
                            f.campaignUploadedFileId !==
                            file.campaignUploadedFileId
                        ),
                      ]);
                      return await deleteMethod(
                        DELETE_BROADCAST_FILE.replace(
                          "{fileId}",
                          file.campaignUploadedFileId
                        ),
                        { param: {} }
                      );
                    }
                  }}
                  channelMessageId={selectedChannelMessage.id}
                  createProxy={createUploadFileProxy}
                  limit={
                    ["wechat", "twilio_whatsapp", "whatsapp360dialog"].includes(
                      selectedChannel
                    )
                      ? 1
                      : undefined
                  }
                  mimeType={
                    CHANNELS_ONLY_ALLOWED_IMAGE.includes(selectedChannel)
                      ? "image/jpeg,image/png"
                      : undefined
                  }
                />
                <FieldError
                  text={
                    validateFormMessage[
                      formErrors[
                        `campaignChannelMessages[${selectedChannelIndex}].files`
                      ]
                    ]
                  }
                />
              </>
            )}
          </Dimmer.Dimmable>
          {templateSelection && isAnyWhatsappChannel(selectedChannel) && (
            <SelectMode
              channelType={selectedChannel}
              anchor={document.body}
              onClose={cancelTemplateSelection}
              conversationId=""
              onSelect={selectTemplate}
              templatesList={templates}
            />
          )}
          {!readOnly && (
            <div className={`variables-column`}>
              {selectedChannel !== "wechat" && (
                <VariablesSelection
                  bordered
                  isSearchable
                  enablePaymentLink={isPaymentIntegrationEnabled}
                  showGroupName
                  updateText={updateVariableText}
                  textareaId={
                    selectedChannelMessage.sendWhatsAppTemplate?.lastVarInputId
                      ? getInputId(
                          selectedChannelMessage.sendWhatsAppTemplate
                            ?.lastVarInputId
                        )
                      : "new-broadcast-text-content"
                  }
                  disabled={disabled}
                />
              )}
            </div>
          )}
          {readOnly && stripePaymentRequestOption && (
            <div className={`variables-column`}>
              <PaymentLinkDetail paymentLink={stripePaymentRequestOption} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
