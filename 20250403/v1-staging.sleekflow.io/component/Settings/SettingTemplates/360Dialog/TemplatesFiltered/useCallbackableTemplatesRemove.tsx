import { useState } from "react";
import { TemplateGridItemType } from "../../../../../features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { matchesTemplateGridItem } from "../../../../../features/Whatsapp360/models/matchesTemplateGridItem";
import { deleteCallbackTemplate } from "../../../../../features/Whatsapp360/API/deleteCallbackTemplate";

export function useCallbackableTemplatesRemove(props: {
  data: TemplateGridItemType[];
  onCallbackRemoved: (templateId: string, templateLanguage: string) => void;
}) {
  const [templateToRemoveCallback, setTemplateToRemoveCallback] =
    useState<TemplateGridItemType | null>(null);

  const [confirmVisible, setConfirmVisible] = useState(false);

  function startRemoving(templateId: string, language: string) {
    const template = props.data.find(
      matchesTemplateGridItem(templateId, language)
    );
    if (template) {
      setTemplateToRemoveCallback(template);
      setConfirmVisible(true);
    }
  }

  function cancelRemovingCallback() {
    setTemplateToRemoveCallback(null);
    setConfirmVisible(false);
  }

  async function removeCallback() {
    setTemplateToRemoveCallback(null);
    setConfirmVisible(false);
    if (!templateToRemoveCallback) {
      return;
    }
    try {
      await deleteCallbackTemplate(
        templateToRemoveCallback.id,
        templateToRemoveCallback.template.namespace ?? ""
      );
      props.onCallbackRemoved(
        templateToRemoveCallback.id,
        templateToRemoveCallback.language
      );
    } catch (e) {
      console.error(e);
    }
  }

  return {
    startRemoving,
    cancelRemovingCallback,
    removeCallback,
    confirmVisible,
    templateToRemoveCallback,
  };
}
