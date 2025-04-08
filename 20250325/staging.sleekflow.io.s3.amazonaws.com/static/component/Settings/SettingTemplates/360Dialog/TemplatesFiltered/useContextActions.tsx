import { TemplateGridItemType } from "features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { Button } from "component/shared/Button/Button";
import React from "react";
import { useTranslation } from "react-i18next";
import { RenderTemplateActionsInterface } from "features/Whatsapp360/components/TemplatesGrid/contracts";
import { useCopyAPIPayload } from "./useCopyAPIPayload";
import { buildTemplatePayloadSample } from "features/Whatsapp360/API/buildTemplatePayloadSample";

interface TemplateActionInterface {
  (id: string, language: string): void;
}

export function useContextActions(props: {
  data: TemplateGridItemType[];
  startEditing: TemplateActionInterface;
  startRemoving: TemplateActionInterface;
  editable: boolean;
}) {
  const { t } = useTranslation();
  const copyPayload = useCopyAPIPayload();

  const renderContextActions: RenderTemplateActionsInterface = (
    templateId: string,
    language: string
  ) => {
    const templateMatch = props.data.find((tpl) => tpl.id === templateId);
    if (!templateMatch) {
      return null;
    }
    const copyCloudApi = () => {
      const payload = buildTemplatePayloadSample(templateMatch);
      copyPayload.copyWhatsapp360(payload);
    };

    const copyZapier = () => {
      const payload = buildTemplatePayloadSample(templateMatch);
      copyPayload.copyWhatsapp360Zapier(payload);
    };

    const buttons = [
      <Button
        key={"copyCloudAPI"}
        content={t("settings.templates.actions.copyPayload")}
        onClick={copyCloudApi}
      />,
      <Button
        key={"copyZapier"}
        content={t("settings.templates.actions.copyPayloadZapier")}
        onClick={copyZapier}
      />,
    ];

    const hasNoCallbacks =
      !templateMatch.callbacks || templateMatch.callbacks.length === 0;

    const canHaveCallback =
      props.editable &&
      templateMatch.template.buttons?.some((btn) => btn.type === "QUICK_REPLY");

    if (canHaveCallback) {
      if (hasNoCallbacks) {
        buttons.push(
          <Button
            key={"add"}
            content={t("settings.templates.actions.addCallback")}
            onClick={() => props.startEditing(templateId, language)}
          />
        );
      } else {
        buttons.push(
          <Button
            key={"edit"}
            content={t("settings.templates.actions.editCallback")}
            onClick={() => props.startEditing(templateId, language)}
          />
        );
        buttons.push(
          <Button
            key={"remove"}
            content={t("settings.templates.actions.removeCallback")}
            onClick={() => props.startRemoving(templateId, language)}
          />
        );
      }
    }
    return <>{buttons}</>;
  };

  return {
    render: renderContextActions,
  };
}
