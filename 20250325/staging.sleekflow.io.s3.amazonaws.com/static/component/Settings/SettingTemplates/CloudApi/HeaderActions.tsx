import React from "react";
import styles from "./HeaderActions.module.css";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import { CloudAPITemplateFormValue } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";
import { useCopyAPIPayload } from "component/Settings/SettingTemplates/360Dialog/TemplatesFiltered/useCopyAPIPayload";
import { buildCloudApiTemplatePayload } from "features/WhatsappCloudAPI/API/buildCloudApiTemplatePayload";

export function HeaderActions(props: {
  id: string;
  channelPhone: string;
  template: CloudAPITemplateFormValue;
}) {
  const { t } = useTranslation();
  const copyPayload = useCopyAPIPayload();

  function copyZapierPayload() {
    const payload = buildCloudApiTemplatePayload(
      props.id,
      props.template.name,
      props.template.language,
      props.template
    );
    copyPayload.copyCloudApiZapier(payload);
  }

  function copyCloudApiPayload() {
    const payload = buildCloudApiTemplatePayload(
      props.id,
      props.template.name,
      props.template.language,
      props.template
    );
    copyPayload.copyCloudApi(payload);
  }

  return (
    <div className={styles.headerActions}>
      {
        <Button
          content={t("settings.templates.actions.copyPayloadZapier")}
          onClick={copyZapierPayload}
        />
      }
      <Button
        content={t("settings.templates.actions.copyPayload")}
        onClick={copyCloudApiPayload}
      />
    </div>
  );
}
