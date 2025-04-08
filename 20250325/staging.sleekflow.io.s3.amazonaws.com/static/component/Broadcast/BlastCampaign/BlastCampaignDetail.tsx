import React, { useReducer } from "react";
import { Trans, useTranslation } from "react-i18next";
import BroadcastTitle from "../shared/BroadcastTitle";
import { useBroadcastChannelLocales } from "../shared/useBroadcastChannelLocales";
import {
  BlastCampaignContext,
  blastCampaignReducer,
  initialState,
} from "./blastCampaignReducer";
import {
  TargetedChannelType,
  TargetedChannelWithIdType,
} from "../../../types/BroadcastCampaignType";
import { Button } from "../../shared/Button/Button";
import styles from "./BlastCampaignDetail.module.css";

import { ChannelConfiguredType } from "../../Chat/Messenger/types";
import { toPairs } from "ramda";
import { IdNormalizedWhatsAppTemplateLanguageType } from "../../Chat/Messenger/SelectWhatsappTemplate/useSelectWhatsappTemplateFlow";
import { BlastCampaignType } from "../../../api/Broadcast/Blast/BlastCampaignType";
import ModalConfirm from "../../shared/ModalConfirm";
import useCompanyChannels from "../../Chat/hooks/useCompanyChannels";
import { findConfigInCompany } from "../../Channel/selectors";
import {
  useBlastCampaignForm,
  VARIABLES_VALUE_PATH,
} from "./useBlastCampaignForm";
import { Sidebar } from "./Sidebar";
import { Content } from "./Content";
import { useChatChannelLocales } from "../../Chat/localizable/useChatChannelLocales";
import { useBlastCampaignInteractions } from "./useBlastCampaignInteractions";
import { useBlastCampaignPolicies } from "../../../api/Broadcast/Blast/useBlastCampaignPolicies";
import { DisableControls } from "../../../core/components/DisableControls/DisableControls";
import { walkWhatsappTemplateParts } from "../../Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import { TemplatesGroupedByChannelType } from "../../../container/BlastCampaignDetailContainer";
import {
  NormalizedWhatsAppTemplateLanguageType,
  OptInContentType,
} from "../../../features/Whatsapp360/models/OptInType";
import { getLocalTemplate } from "../../../features/Whatsapp360/API/getLocalTemplate";

type TemplatePairType = [string, NormalizedWhatsAppTemplateLanguageType];

export function BlastCampaignDetail(props: {
  initCampaign: BlastCampaignType | null;
  channel: TargetedChannelType;
  whatsapp360Templates: TemplatesGroupedByChannelType;
  channelsAvailable: ChannelConfiguredType<"whatsapp360dialog">[];
}) {
  const { initCampaign, channel, whatsapp360Templates, channelsAvailable } =
    props;
  const { t } = useTranslation();
  const companyChannels = useCompanyChannels();
  const guard = useBlastCampaignPolicies();

  const { getConfigName } = useChatChannelLocales();
  const { getChannelHeader } = useBroadcastChannelLocales({
    readOnly: false /*todo*/,
  });
  const channelHeader = getChannelHeader("whatsapp360dialog");

  const [state, dispatch] = useReducer(
    blastCampaignReducer,
    initialState(initCampaign?.status ?? null)
  );

  const form = useBlastCampaignForm({
    initCampaign,
    initChannel: channel as TargetedChannelWithIdType,
    submitForm: async (values) => await api.submitForm(values),
    getTemplateSelected,
  });

  const api = useBlastCampaignInteractions({
    isNew: !initCampaign,
    channel,
    dispatch,
    getTemplateSelected,
    form,
  });

  const isSending = state.mutating || state.testing;

  function getTemplateSelected(
    templateId: string,
    channelId: string,
    language: string
  ): OptInContentType | null {
    const templateSelected = templateId
      ? getTemplatesActive(channelId).find(
          (t) => t.template.template_name === templateId
        )?.template
      : undefined;
    return templateSelected
      ? getLocalTemplate(templateSelected, language)
      : null;
  }

  function getTemplatesActive(
    channelId: string
  ): IdNormalizedWhatsAppTemplateLanguageType[] {
    const nextTemplate = whatsapp360Templates[channelId];
    if (!nextTemplate) {
      return [];
    }

    const templatePairs = toPairs(nextTemplate) as TemplatePairType[];

    const pairsPassed = templatePairs.reduce<TemplatePairType[]>(
      (acc, next) => {
        const [id, template] = next;
        const translationsWithVars = Object.entries(
          template.translations
        ).filter(([_, tpl]) => {
          const headerParts = walkWhatsappTemplateParts(tpl.header?.text ?? "");
          const bodyParts = walkWhatsappTemplateParts(tpl.content);
          const footerParts = walkWhatsappTemplateParts(tpl.footer?.text ?? "");
          return ![...headerParts, ...bodyParts, ...footerParts].some(
            (p) => p.type === "var"
          );
        });

        if (translationsWithVars.length > 0) {
          const templateFiltered: TemplatePairType = [
            id,
            {
              ...template,
              translations: Object.fromEntries(translationsWithVars),
            },
          ];

          return [...acc, templateFiltered];
        }
        return acc;
      },
      []
    );

    return pairsPassed.map(([id, tpl]) => {
      return { id: id, template: tpl };
    });
  }

  function getChannelName(targeted: TargetedChannelType): string | undefined {
    const [channelId] = targeted.ids ?? [];
    if (!channelId) {
      return;
    }

    const targetConfig = findConfigInCompany(
      companyChannels,
      targeted.channel,
      channelId
    );

    return targetConfig
      ? getConfigName({
          name: targeted.channel,
          config: targetConfig,
        })
      : undefined;
  }

  async function sendTestMessage(profileIdList: string[]) {
    try {
      const errors = await form.validateForm();
      if (errors.templateId || errors[VARIABLES_VALUE_PATH]) {
        return;
      }
      await api.submitTestMessage(profileIdList, form.values);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className={`main newbroadcast-content ${styles.content}`}>
      <DisableControls disabled={guard.isFormEditable(state)}>
        <BlastCampaignContext.Provider
          value={{
            ...state,
            dispatch,
          }}
        >
          <>
            <Sidebar
              sendTestMessage={sendTestMessage}
              downloadResultsUrl={
                initCampaign?.messageHubRequestResultCsvFileUrl ?? undefined
              }
              form={form}
            />
            <div className="main-content main-primary-column">
              <div className="header">
                <BroadcastTitle
                  header={channelHeader.header}
                  subHeader={channelHeader.subHeader}
                />
              </div>
              <div className="content">
                <Content
                  templatesActive={getTemplatesActive(
                    form.values.channel.ids[0]
                  )}
                  clearTemplateSelection={api.clearTemplateSelection}
                  startTemplateSelection={api.startTemplateSelection}
                  selectTemplate={api.chooseTemplate}
                  form={form}
                />
                {!guard.isCampaignFrozen(state) && (
                  <div className={styles.actions}>
                    <Button
                      primary
                      onClick={!form.isValid ? undefined : api.startSubmit}
                      disabled={!form.isValid}
                      loading={isSending}
                    >
                      {t("form.button.send")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>

          <ModalConfirm
            opened={state.confirming}
            onConfirm={api.confirmSend}
            onCancel={api.cancelSend}
            cancelText={t("form.button.cancel")}
            title={t("broadcast.blast.form.confirm.title")}
            confirmText={t("form.button.send")}
          >
            <Trans
              i18nKey={"broadcast.blast.form.confirm.body"}
              values={{
                channel:
                  getChannelName(form.values.channel) ??
                  form.values.channel.channel,
              }}
            >
              <p>
                Please confirm the following details before sending this
                campaign.
              </p>
              <p>Channel: channel_name</p>
            </Trans>
          </ModalConfirm>
        </BlastCampaignContext.Provider>
      </DisableControls>
    </div>
  );
}
