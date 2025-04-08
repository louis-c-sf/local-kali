import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Dimmer, Dropdown, Input, Loader, Modal } from "semantic-ui-react";
import {
  AutomationActionType,
  AutomationSendWebhookActionType,
} from "../../../../../types/AutomationActionType";
import { FieldError } from "../../../../shared/form/FieldError";
import { CloseButton } from "../../../../shared/CloseButton";
import { WaitableActionProps } from "../../ActionsForm";
import WaitTimeAction, { AddWaitActionButton } from "../WaitTimeAction";
import styles from "./SendWebhookAction.module.css";
import actionStyles from "../AutomationAction.module.css";
import { CodeBlock, nord } from "react-code-blocks";
import { AutomationTypeEnum } from "../../../../../types/AssignmentRuleType";
import { getWithExceptions } from "../../../../../api/apiRequest";
import {
  GET_CONTACT_WEBHOOK_SAMPLE,
  GET_MESSAGE_WEBHOOK_SAMPLE,
} from "../../../../../api/apiPath";
import useCompanyChannels from "../../../../Chat/hooks/useCompanyChannels";
import { getConfigId } from "../../../../Channel/selectors";
import { ChannelType } from "../../../../Chat/Messenger/types";
import { useChatChannelLocales } from "../../../../Chat/localizable/useChatChannelLocales";
import { uniq } from "ramda";
import { copyToClipboard } from "../../../../../utility/copyToClipboard";
import { useFlashMessageChannel } from "../../../../BannerMessage/flashBannerMessage";
import CopyIcon from "./assets/CopyIcon";
import { DummyField } from "../../input/DummyField";

interface SendWebhookActionProps extends WaitableActionProps {
  type: AutomationTypeEnum;
  action: AutomationSendWebhookActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
}

export default function SendWebhookAction(props: SendWebhookActionProps) {
  const {
    action,
    setAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    canAddWaitAction,
  } = props;
  const { t } = useTranslation();

  function updatedWebhookURL(value: string) {
    setAction({
      ...action,
      webhookURL: value,
    });
  }

  const [openSamplePayloadModal, setOpenSamplePayloadModal] = useState(false);
  return (
    <>
      <div className={actionStyles.action}>
        {action.actionWaitDenormalized && (
          <WaitTimeAction
            action={action.actionWaitDenormalized}
            onChange={waitActionChange}
            onRemove={waitActionRemove}
            error={props.waitError}
          />
        )}
        <div className={actionStyles.controls}>
          <div className={actionStyles.head}>
            <DummyField>
              {t("automation.action.sendWebhook.field.label")}
            </DummyField>
          </div>
          <div className={actionStyles.body}>
            <Input
              placeholder={t("automation.action.sendWebhook.field.placeholder")}
              onChange={(e) => updatedWebhookURL(e.target.value)}
              fluid
              value={action.webhookURL}
            />
          </div>
          <div className={actionStyles.buttons}>
            {canAddWaitAction && (
              <AddWaitActionButton onAddAction={waitActionAdd} />
            )}
          </div>
          <div className={actionStyles.errors}>
            {props.error && <FieldError text={props.error} />}
          </div>
        </div>
        <div className={styles.reminder}>
          <div className={styles.subHeader}>
            <Trans i18nKey="automation.action.sendWebhook.subHeader">
              Check the sample payload
              <span
                onClick={() => setOpenSamplePayloadModal(true)}
                className={styles.link}
              >
                here
              </span>
              .
            </Trans>
          </div>
        </div>
      </div>
      {openSamplePayloadModal && (
        <SamplePayloadModal
          type={props.type}
          onClick={() => setOpenSamplePayloadModal(false)}
        />
      )}
    </>
  );
}

function SamplePayloadModal(props: {
  onClick: () => void;
  type: AutomationTypeEnum;
}) {
  const companyChannels = useCompanyChannels();
  const { type } = props;
  const [content, setContent] = useState("");
  const { t } = useTranslation();
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const { broadcastChannelNameDisplay } = useChatChannelLocales();
  const flash = useFlashMessageChannel();
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const SAMPLE_PAYLOAD = {
    OutgoingMessageTrigger: {
      header: t(
        "automation.action.sendWebhook.modal.outgoingMessageTrigger.header"
      ),
    },
    MessageReceived: {
      header: t("automation.action.sendWebhook.modal.messageReceived.header"),
    },
    ContactAdded: {
      header: t("automation.action.sendWebhook.modal.contactAdded.header"),
    },
    FieldValueChanged: {
      header: t("automation.action.sendWebhook.modal.contactAdded.header"),
    },
  };
  useEffect(() => {
    if (
      companyChannels.length > 0 &&
      ["MessageReceived", "OutgoingMessageTrigger"].includes(type)
    ) {
      const channelTypeList = uniq(
        companyChannels.map((channel) => channel.type)
      );
      const [firstChannel] = channelTypeList;
      setChannelTypes(channelTypeList);
      setSelectedChannel(firstChannel);
    }
  }, [companyChannels.map((channel) => channel.type).join("")]);
  useEffect(() => {
    if (["FieldValueChanged", "ContactAdded"].includes(type)) {
      setLoading(true);
      getWithExceptions(GET_CONTACT_WEBHOOK_SAMPLE, {
        param: {},
      })
        .then((res) => {
          setContent(JSON.stringify(res, null, 2));
        })
        .catch((e) => {
          setContent("");
          console.error(`GET_CONTACT_WEBHOOK_SAMPLE error ${e}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [type]);

  function triggerChannelSample(value: string) {
    setSelectedChannel(value);
  }

  useEffect(() => {
    const foundChannel = companyChannels.find(
      (channel) => channel.type === selectedChannel
    );
    if (!foundChannel) {
      return;
    }
    setLoading(true);
    getWithExceptions(GET_MESSAGE_WEBHOOK_SAMPLE, {
      param: {
        channel:
          selectedChannel === "twilio_whatsapp" ? "whatsapp" : selectedChannel,
        channelIds:
          foundChannel.configs?.map((config) =>
            getConfigId({
              name: foundChannel.type,
              config: config,
            })
          ) ?? "",
      },
    })
      .then((res) => {
        setContent(JSON.stringify(res, null, 2));
      })
      .catch((e) => {
        setContent("");
        console.error(`GET_MESSAGE_WEBHOOK_SAMPLE error ${e}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedChannel]);

  function copyText() {
    copyToClipboard(content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
    flash(t("flash.inbox.message.copied"));
  }

  const payload = SAMPLE_PAYLOAD[props.type] ?? SAMPLE_PAYLOAD.MessageReceived;
  return (
    <Modal open>
      <Modal.Header className={styles.sampleHeader}>
        <CloseButton onClick={props.onClick} />
      </Modal.Header>
      <Modal.Content className={styles.content} scrolling>
        <div className={styles.sampleContent}>
          <div className={styles.headerContainer}>
            <div className={styles.header}>
              <div className={styles.description}>{payload.header}</div>
              {channelTypes.length > 0 && (
                <div className={styles.dropdown}>
                  {t(
                    "automation.action.sendWebhook.modal.contactAdded.channelLabel"
                  )}
                  <Dropdown
                    options={channelTypes.map((channel) => ({
                      key: channel,
                      value: channel,
                      text: broadcastChannelNameDisplay[channel],
                    }))}
                    placeholder={t(
                      "automation.action.sendWebhook.modal.contactAdded.placeholder"
                    )}
                    selection
                    value={selectedChannel}
                    onChange={(_, data) =>
                      triggerChannelSample(data.value as string)
                    }
                    selectOnBlur={false}
                  />
                </div>
              )}
            </div>
            <div className={styles.action}>
              <div
                onClick={copyText}
                className={`ui button ${styles.copyButton}`}
              >
                <CopyIcon />
                {isCopied
                  ? t("form.field.copy.copied")
                  : t("automation.action.sendWebhook.modal.button.copy")}
              </div>
            </div>
          </div>
          <Dimmer.Dimmable>
            <Dimmer active={loading}>
              <Loader active={true} />
            </Dimmer>
            <CodeBlock
              text={content}
              language="javascript"
              showLineNumbers
              theme={nord}
              codeBlock
            />
          </Dimmer.Dimmable>
          <div className={styles.action}>
            <div
              onClick={props.onClick}
              className="ui button primary button-small"
            >
              {t("automation.action.sendWebhook.modal.button.confirm")}
            </div>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}
