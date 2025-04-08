import React, { useState } from "react";
import styles from "./SelectMode.module.css";
import { Modal } from "semantic-ui-react";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import { NoTemplatesWarning } from "./NoTemplatesWarning";
import { IdNormalizedWhatsAppTemplateLanguageType } from "../useSelectWhatsappTemplateFlow";
import { TemplatesFilter } from "features/Whatsapp360/components/TemplatesFilter/TemplatesFilter";
import { WhatsappChannelType } from "../../types";
import { useAppSelector } from "AppRootContext";
import { matchesOptInFilters } from "features/Whatsapp360/components/TemplatesGrid/matchesOptInFilters";
import { HandleTemplateSelectInterface } from "features/Whatsapp360/components/TemplatesGrid/contracts";
import { TemplatesGrid } from "features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { TopControls } from "./TopControls";
import { ButtonType } from "features/Whatsapp360/API/ButtonType";
import { extractTemplateLanguages } from "features/Whatsapp360/models/extractTemplateLanguages";
import { extractTemplatesGridItems } from "features/Whatsapp360/models/extractTemplatesGridItems";
import { ProfileType } from "types/LoginType";
import { getChannelInstanceId } from "component/Chat/utils/useChatSelectors";
import { useWhatsappCloudApiChat } from "features/WhatsappCloudAPI/usecases/Inbox/useWhatsappCloudApiChat";
import { useWhatsapp360Template } from "features/Whatsapp360/usecases/Inbox/useWhatsapp360Template";
import { useWhatsappCloudApiTemplate } from "features/WhatsappCloudAPI/usecases/Inbox/useWhatsappCloudApiTemplate";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";

export type TemplateCategoryTabEnum =
  | "marketing"
  | "utility"
  | "authentication";

export type TemplateSelectionEnum =
  | "bookmarked"
  | "templates"
  | TemplateCategoryTabEnum;

function matchBookmarked(
  template: IdNormalizedWhatsAppTemplateLanguageType
): boolean {
  return template.template.isBookmarked;
}

function matchApproved(
  template: IdNormalizedWhatsAppTemplateLanguageType
): boolean {
  return Object.keys(template.template.translations).some(
    (t) => template.template.translations[t].status === "approved"
  );
}

function matchMarketing(
  template: IdNormalizedWhatsAppTemplateLanguageType
): boolean {
  return (
    matchApproved(template) &&
    template.template.category.toLowerCase() === "marketing"
  );
}
function matchUtility(
  template: IdNormalizedWhatsAppTemplateLanguageType
): boolean {
  return (
    matchApproved(template) &&
    template.template.category.toLowerCase() === "utility"
  );
}
function matchAuthentication(
  template: IdNormalizedWhatsAppTemplateLanguageType
): boolean {
  return (
    matchApproved(template) &&
    template.template.category.toLowerCase() === "authentication"
  );
}

export function SelectMode(props: {
  onSelect: HandleTemplateSelectInterface;
  onClose: () => void;
  anchor: HTMLElement | null;
  conversationId: string;
  refresh?: {
    profile: ProfileType;
  };
  channelType: WhatsappChannelType;
  templatesList: IdNormalizedWhatsAppTemplateLanguageType[];
}) {
  const { templatesList, refresh } = props;
  const cloudApi = useWhatsappCloudApiChat(refresh?.profile);

  const selectedChatChannel = useAppSelector(
    (s) => s.selectedChannelFromConversation as WhatsappChannelType | undefined
  );
  const selectedChatChannelId = useAppSelector(
    (s) => s.selectedChannelIdFromConversation
  );

  const selectedChannel = selectedChatChannel ?? props.channelType;

  const isChannelAbleToRefresh = [
    "whatsapp360dialog",
    "whatsappcloudapi",
  ].includes(selectedChannel);

  const canRefresh = isChannelAbleToRefresh && props.refresh;
  const whatsapp360template = useWhatsapp360Template();
  const cloudAPItemplate = useWhatsappCloudApiTemplate();

  const refreshTemplates = async () => {
    if (!props.refresh || !isChannelAbleToRefresh) {
      return;
    }
    const configId = getChannelInstanceId(
      selectedChannel,
      props.refresh.profile
    );
    //todo CloudAPI
    if (selectedChannel === "whatsapp360dialog") {
      await whatsapp360template.refresh(configId);
    } else if (selectedChannel === "whatsappcloudapi") {
      await cloudAPItemplate.refresh(cloudApi.wabaId, cloudApi.configId);
    }
  };

  return (
    <SelectModeModal
      onSelect={props.onSelect}
      onClose={props.onClose}
      conversationId={props.conversationId}
      refresh={canRefresh ? refreshTemplates : undefined}
      selectedChannel={selectedChannel}
      templates={templatesList}
      loading={
        selectedChannel === "whatsapp360dialog"
          ? whatsapp360template.loading
          : cloudAPItemplate.loading
      }
    />
  );
}

function SelectModeModal(props: {
  conversationId: string;
  onSelect: HandleTemplateSelectInterface;
  onClose: () => void;
  loading: boolean;
  refresh?: () => void;
  templates: IdNormalizedWhatsAppTemplateLanguageType[];
  selectedChannel: WhatsappChannelType;
}) {
  const { onSelect, onClose, conversationId, templates } = props;
  const accessGuard = useAccessRulesGuard();
  const featuresGuard = useFeaturesGuard();
  const hasTemplates = Object.entries(templates).length > 0;
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedType, setSelectedType] = useState<ButtonType>();

  const [selectedTab, setSelectedTab] =
    useState<TemplateSelectionEnum>("bookmarked");

  function onTabChange(selectedTab: TemplateSelectionEnum) {
    setSelectedTab(selectedTab);
  }

  const criteria = {
    bookmarked: matchBookmarked,
    templates: matchApproved,
    marketing: matchMarketing,
    utility: matchUtility,
    authentication: matchAuthentication,
    default: matchApproved,
  };

  const hiddenCategoryTabs = {
    marketing: templates.filter(criteria.marketing).length === 0,
    utility: templates.filter(criteria.utility).length === 0,
    authentication: templates.filter(criteria.authentication).length === 0,
  };

  const templatesVisible = (templates ?? [])
    .filter(criteria[selectedTab] ?? criteria.default)
    .filter((t) =>
      matchesOptInFilters(
        selectedTemplateName,
        t.template,
        selectedLang,
        selectedType
      )
    );

  const translationsVisible = extractTemplatesGridItems(templatesVisible);

  const canBookmarkTemplates = featuresGuard.hasWhatsappTemplateBookmarkFeature(
    props.selectedChannel
  );
  return (
    <Modal
      open
      closeOnDimmerClick
      dimmer={"inverted"}
      className={styles.modal}
      closeIcon={true}
      onClose={onClose}
    >
      <div
        className={`${styles.templates} ${!hasTemplates ? styles.empty : ""}`}
      >
        <div className={styles.overlayWrap}>
          <>
            <TopControls
              hasTemplates={hasTemplates}
              selectedChannelFromConversation={props.selectedChannel}
              hiddenCategoryTabs={hiddenCategoryTabs}
              onTabChange={onTabChange}
              showEdit={accessGuard.canEditWhatsappTemplates()}
              fromConversationId={conversationId}
              loading={props.loading}
              isDisplayRefresh={Boolean(props.refresh)}
              refreshTemplates={props.refresh}
              canBookmarkTemplates={canBookmarkTemplates}
            />
            <TemplatesFilter
              languages={extractTemplateLanguages(templates)}
              searchLanguage={selectedLang}
              searchButtonType={selectedType}
              onButtonTypeChange={setSelectedType}
              onLanguageChanged={setSelectedLang}
              onTemplateChange={setSelectedTemplateName}
              noLabel={true}
            />
            {!hasTemplates && !props.loading && (
              <NoTemplatesWarning conversationId={conversationId} />
            )}
            {hasTemplates && !props.loading && (
              <TemplatesGrid
                templates={translationsVisible ?? []}
                onSelect={onSelect}
                bookmarkable={canBookmarkTemplates}
              />
            )}
          </>
        </div>
      </div>
    </Modal>
  );
}
