import { useState } from "react";
import { TemplateGridItemType } from "../../../../../features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { matchesTemplateGridItem } from "../../../../../features/Whatsapp360/models/matchesTemplateGridItem";
import { EditCallbackFormikType } from "../EditCallbackModal/EditCallbackModal";
import { submitCallbackTemplate } from "../../../../../api/WhatsappTemplate/submitCallbackTemplate";
import { WhatsappTemplateCallbackType } from "../../../../../features/Whatsapp360/API/fetchCallbackTemplates";

export function useCallbackableTemplatesEdit(props: {
  onCallbackAdded: (data: WhatsappTemplateCallbackType) => void;
  data: TemplateGridItemType[];
}) {
  const [templateToUpdate, setTemplateToUpdate] =
    useState<TemplateGridItemType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const startEditingCallback = (templateId: string, language: string) => {
    const template = props.data.find(
      matchesTemplateGridItem(templateId, language)
    );
    if (template) {
      setTemplateToUpdate(template);
      setModalVisible(true);
    }
  };

  function hideCallbackModal() {
    setTemplateToUpdate(null);
    setModalVisible(false);
  }

  async function saveCallbackAction(
    template: TemplateGridItemType,
    data: EditCallbackFormikType
  ) {
    try {
      const result = await submitCallbackTemplate({
        templateName: template.id,
        templateNamespace: template.template.namespace ?? "",
        callbackActions: data.webhookUrls.map((urlData) => {
          return {
            quickReplyButtonIndex: urlData.buttonIndex,
            webhookUrl: urlData.webhookUrl,
            type: urlData.buttonType,
          };
        }),
      });

      props.onCallbackAdded(result);
      hideCallbackModal();
    } catch (e) {
      console.error(e);
    }
  }

  return {
    startEditing: startEditingCallback,
    saveCallbackAction,
    callbackModalVisible: modalVisible,
    templateToUpdate,
    hideCallbackModal,
  };
}
