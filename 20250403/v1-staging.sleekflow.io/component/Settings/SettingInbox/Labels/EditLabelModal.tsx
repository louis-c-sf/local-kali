import React from "react";
import styles from "./EditLabelModal.module.css";
import { ColorPickerInput } from "../../../Chat/LabelsWidget/ColorPicker";
import { ModalForm } from "../../../shared/ModalForm";
import { HashTagType } from "../../../../types/ConversationType";
import { useTranslation } from "react-i18next";

export function EditLabelModal(props: {
  tag: HashTagType;
  onCancel: () => void;
  onChange: (tag: HashTagType) => void;
  onComplete: () => void;
}) {
  const { onCancel, onChange, onComplete, tag } = props;
  const { t } = useTranslation();
  return (
    <ModalForm
      opened={true}
      onCancel={onCancel}
      onConfirm={onComplete}
      title={t("settings.inbox.labels.modal.add.title")}
      confirmText={t("form.button.add")}
      cancelText={t("form.button.cancel")}
      minimal={false}
      size={"tiny"}
      isLoading={false}
      darkHeader
    >
      <div className={styles.field}>
        <div className={styles.label}>
          {t("settings.inbox.labels.modal.add.labelName")}
        </div>
        <div className={`${styles.input} ui input`}>
          <input
            type={"text"}
            className={"ui input"}
            value={tag.hashtag}
            placeholder={t("settings.inbox.labels.modal.add.placeholder")}
            onChange={(ev) => {
              onChange({ ...tag, hashtag: ev.target.value });
            }}
          />
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.label}>
          {t("settings.inbox.labels.modal.add.labelColour")}
        </div>
        <div className={styles.input}>
          <ColorPickerInput
            onPickColor={(color) => {
              onChange({ ...tag, hashTagColor: color });
            }}
            tag={tag}
          />
        </div>
      </div>
    </ModalForm>
  );
}
