import React from "react";
import styles from "./EditCallbackModal.module.css";
import { Modal } from "semantic-ui-react";
import { Formik, useFormikContext } from "formik";
import { TemplateGridItemType } from "../../../../../features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { useTranslation } from "react-i18next";
import { Body } from "./Body";
import { Button } from "../../../../shared/Button/Button";
import { array, object, string } from "yup";
import { Icon } from "../../../../shared/Icon/Icon";

type WebhookType = {
  buttonIndex: number;
  webhookUrl: string;
  buttonType: string;
};

export type EditCallbackFormikType = {
  webhookUrls: Array<WebhookType>;
};

export function EditCallbackModal(props: {
  content: TemplateGridItemType;
  onSend: (
    template: TemplateGridItemType,
    data: EditCallbackFormikType
  ) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { content, onSend } = props;
  const buttonsInit = content.template.buttons?.map<WebhookType>(
    (btn, idx) => ({
      buttonIndex: idx,
      webhookUrl:
        content.callbacks?.find((c) => c.quickReplyButtonIndex === idx)
          ?.webhookUrl ?? "",
      buttonType: btn.type,
    })
  );

  const initialValues = {
    webhookUrls: buttonsInit ?? [],
  };

  const executeSave = (values: EditCallbackFormikType) => {
    onSend(props.content, values);
  };

  return (
    <Formik<EditCallbackFormikType>
      initialValues={initialValues}
      validationSchema={object({
        webhookUrls: array(
          object({
            webhookUrl: string().required().url(),
          })
        ),
      })}
      onSubmit={executeSave}
    >
      <Modal
        open
        className={styles.modal}
        closeOnDimmerClick
        closeOnDocumentClick
        onClose={props.onClose}
      >
        <div className={styles.header}>
          <div className={styles.close} onClick={props.onClose}>
            <Icon type={"close"} colored />
          </div>
          <div className={styles.title}>
            {t("settings.templates.whatsapp360.modal.addCallback.title")}
          </div>
          <div className={styles.subtitle}>
            {t("settings.templates.whatsapp360.modal.addCallback.subtitle")}
          </div>
        </div>
        <div className={styles.body}>
          <Body content={props.content} />
        </div>
        <Footer />
      </Modal>
    </Formik>
  );
}

function Footer() {
  const form = useFormikContext<EditCallbackFormikType>();
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      <Button
        customSize={"mid"}
        content={t("form.button.save")}
        onClick={form.submitForm}
        disabled={form.isSubmitting || !form.isValid}
        loading={form.isSubmitting}
        primary
      />
    </div>
  );
}
