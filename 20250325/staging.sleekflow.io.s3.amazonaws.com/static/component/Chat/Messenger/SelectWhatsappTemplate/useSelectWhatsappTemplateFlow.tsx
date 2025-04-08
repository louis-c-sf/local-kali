import { useChatSelectors } from "../../utils/useChatSelectors";
import { useOfficialWhatsappWindow } from "../../hooks/Labels/useOfficialWhatsappWindow";
import useSelectedChat from "lib/effects/useSelectedChat";
import { useAppSelector } from "AppRootContext";
import { History } from "history";
import useRouteConfig from "config/useRouteConfig";
import { isVarFilled } from "./EditTemplateInline";
import { equals } from "ramda";
import { useTranslation } from "react-i18next";
import { ChannelType, WhatsappChannelType } from "../types";
import useGetCurrentChannel from "../../useGetCurrentChannel";
import { getLocalTemplate } from "features/Whatsapp360/API/getLocalTemplate";
import {
  NormalizedWhatsAppTemplateLanguageType,
  NormalizedWhatsAppTemplateType,
} from "features/Whatsapp360/models/OptInType";
import { isAnyWhatsappChannel } from "core/models/Channel/isAnyWhatsappChannel";
import { WhatsappTemplatesStateType } from "App/reducers/Chat/whatsappTemplatesReducer";

export type InboxLocationStateType = {
  fromConversationId: string;
  path: string;
  query?: string;
};
export type IdNormalizedWhatsAppTemplateLanguageType = {
  id: string;
  template: NormalizedWhatsAppTemplateLanguageType;
};

export function selectCachedTemplateList(
  channel: WhatsappChannelType,
  cache: WhatsappTemplatesStateType,
  channelId?: number
): NormalizedWhatsAppTemplateType | undefined {
  const selectorMap: Record<
    WhatsappChannelType,
    (channelId?: number) => NormalizedWhatsAppTemplateType
  > = {
    whatsapp: () => {
      return cache.templates.data;
    },
    twilio_whatsapp: () => {
      return cache.templates.data;
    },
    whatsapp360dialog: () => {
      return cache.whatsapp360Templates.data;
    },
    whatsappcloudapi: (channelId?: number) => {
      return cache.whatsappCloudApiTemplates
        .filter((t) => t.channelId === channelId)
        .reduce<NormalizedWhatsAppTemplateType>(
          (acc, next) => ({ ...acc, ...next.data }),
          {}
        );
    },
  };
  const selector = selectorMap[channel];
  return selector ? selector(channelId) : {};
}

export function selectCachedTemplate(
  channel: WhatsappChannelType,
  cache: WhatsappTemplatesStateType,
  templateId: string,
  channelId?: number
): NormalizedWhatsAppTemplateLanguageType | undefined {
  const cachedList = selectCachedTemplateList(channel, cache, channelId);
  return cachedList?.[templateId] ?? undefined;
}

const indexedById = (
  entry: [string, NormalizedWhatsAppTemplateLanguageType]
) => ({
  id: entry[0],
  template: entry[1],
});

export function useSelectWhatsappTemplateFlow(
  conversationId: string | undefined,
  selectedChannel?: ChannelType,
  selectedChannelId?: number
) {
  const { lastChannel } = useChatSelectors();
  const { latestCustomerMessage } = useSelectedChat(conversationId);
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);
  const { currentChannel, currentChannelId } =
    useGetCurrentChannel(messagesFilter);
  const channel = selectedChannel ?? currentChannel;
  const { getIsConversationWithinOfficialWindow } = useOfficialWhatsappWindow({
    selectedChannel: channel,
  });
  const { routeTo } = useRouteConfig();
  const { i18n } = useTranslation();
  const selectedCloudAPI = useAppSelector(
    (s) =>
      s.company?.whatsappCloudApiConfigs?.find(
        (c) => c.whatsappPhoneNumber === currentChannelId
      )?.id ?? undefined,
    equals
  );
  const cloudAPIId = selectedCloudAPI || selectedChannelId;
  const template = useAppSelector((s) => {
    const templateId = s.inbox.messenger.sendWhatsappTemplate.templateId;
    const language = s.inbox.messenger.sendWhatsappTemplate.language;
    const contentSid = s.inbox.messenger.sendWhatsappTemplate.contnentSid;
    if (!templateId) {
      return;
    }
    const template = selectCachedTemplate(
      channel as WhatsappChannelType,
      s.inbox.whatsAppTemplates,
      templateId,
      cloudAPIId
    );
    if (!template) {
      return;
    }
    return getLocalTemplate(template, language ?? i18n.language, contentSid);
  }, equals);

  const templates: Array<IdNormalizedWhatsAppTemplateLanguageType> =
    useAppSelector((state) => {
      const whatsAppTemplates = state.inbox.whatsAppTemplates;
      if (
        channel === "whatsapp360dialog" &&
        !whatsAppTemplates.whatsapp360Templates.booted
      ) {
        return [];
      }
      if (
        channel === "twilio_whatsapp" &&
        !whatsAppTemplates.templates.booted
      ) {
        return [];
      }
      //todo choose from all channels & use id
      return Object.entries(
        selectCachedTemplateList(
          channel as WhatsappChannelType,
          whatsAppTemplates,
          cloudAPIId
        ) ?? {}
      ).map(indexedById);
    }, equals);

  const selectVisible = useAppSelector(
    (s) => s.inbox.messenger.sendWhatsappTemplate.isTemplatesSelectionVisible
  );
  const hasError = useAppSelector(
    (s) => s.inbox.messenger.sendWhatsappTemplate.hasError
  );

  const submitBlocked = useAppSelector((s) => {
    const tplState = s.inbox.messenger.sendWhatsappTemplate;
    return (
      tplState.hasError ||
      (tplState.isHeaderFileRequired && tplState.file === undefined)
    );
  });

  const noteMode = useAppSelector((s) => s.inbox.messenger.mode === "note");

  const templateMode = useAppSelector(
    (s) => s.inbox.messenger.sendWhatsappTemplate.mode
  );
  const hasVariables = useAppSelector(
    (s) =>
      Object.keys(s.inbox.messenger.sendWhatsappTemplate.variables.content)
        .length > 0 ||
      Object.keys(s.inbox.messenger.sendWhatsappTemplate.variables.header)
        .length > 0
  );
  const variables = useAppSelector(
    (s) => s.inbox.messenger.sendWhatsappTemplate.variables,
    equals
  );
  const lastVarInputId = useAppSelector(
    (s) => s.inbox.messenger.sendWhatsappTemplate.lastVarInputId
  );

  const hasNoEmptyParams = useAppSelector((s) => {
    const varValues = Object.values(
      s.inbox.messenger.sendWhatsappTemplate.variables.content
    );
    return varValues.filter((v) => !isVarFilled(v)).length === 0;
  });
  const { showOverlay: showFbOverlay, value: selectedMessageType } =
    useAppSelector((s) => s.inbox.facebook.messageType, equals);

  const isCouldUseWhatsappTemplates =
    isAnyWhatsappChannel(channel ?? "") ||
    (channel === "whatsapp" && isAnyWhatsappChannel(lastChannel));

  const isOutOfWhatsappTimeWindow =
    Boolean(
      latestCustomerMessage &&
        !getIsConversationWithinOfficialWindow(latestCustomerMessage)
    ) || latestCustomerMessage === undefined;
  const isTemplateModeRequired =
    isCouldUseWhatsappTemplates && isOutOfWhatsappTimeWindow;

  const isTemplateContentsEditable = Boolean(
    templateMode === "template" && template && hasVariables
  );

  const editTemplatesUrl: History.LocationDescriptor<{
    backToInbox: InboxLocationStateType;
  }> = {
    pathname: routeTo("/settings/templates"),
    state: {
      backToInbox: {
        path: window.location.pathname,
        fromConversationId: conversationId ?? "",
        query: window.location.search ? window.location.search : undefined,
      },
    },
  };

  return {
    template,
    /**
     * @deprecated select the templates directly from corresponding stores
     * */
    templates,
    isTemplateModeRequired,
    editTemplatesUrl,
    isTemplateContentsEditable,
    hasNoEmptyParams,
    templateMode,
    lastVarInputId,
    variables,
    submitBlocked,
    hasError,
    editTemplateActive: Boolean(
      (templateMode === "template" && template && !noteMode) ||
        (!noteMode &&
          channel?.toLocaleLowerCase() === "facebook" &&
          selectedMessageType === undefined &&
          showFbOverlay)
    ),
    sendOverlayActive:
      !noteMode &&
      isTemplateModeRequired &&
      ((templateMode === "template" && !template) || templateMode === "off"),
    selectTemplateModalVisible: selectVisible,
    hasActiveContent:
      templateMode === "template" && template && hasNoEmptyParams,
  };
}
