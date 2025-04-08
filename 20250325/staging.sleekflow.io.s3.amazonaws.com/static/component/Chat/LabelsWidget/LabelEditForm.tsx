import React, { useState } from "react";
import { HashTagType } from "../../../types/ConversationType";
import { Button, Form, Input, Portal } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { usePopperPopup } from "../../shared/popup/usePopperPopup";
import { ColorPickerInput } from "./ColorPicker";

export function LabelEditForm(props: {
  onFormUpdate: (tag: HashTagType) => void;
  onEditComplete: (tag: HashTagType) => void;
  onDismiss: () => void;
  tag: HashTagType;
  anchor: HTMLElement | null;
  setFormNode: (node: HTMLElement | null) => void;
}) {
  const { onDismiss, onEditComplete, tag, onFormUpdate } = props;
  const [popupNode, setPopupNode] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSave(values: HashTagType) {
    setLoading(true);
    try {
      await onEditComplete(values);
      onDismiss();
    } catch (e) {
      console.error("LabelEditForm.handleSave", e);
    } finally {
      setLoading(false);
    }
  }

  usePopperPopup(
    {
      popupRef: popupNode,
      onClose: onDismiss,
      placement: "bottom-end",
      anchorRef: props.anchor,
      closeOnOutsideClick: false,
      offset: [-8, 8],
    },
    [popupNode]
  );

  return (
    <Portal open mountNode={document.body}>
      <div
        className="label-edit dialog ui popup visible"
        ref={(node) => {
          setPopupNode(node);
          props.setFormNode(node);
        }}
      >
        <div className="label-edit-form">
          <Form>
            <Form.Field>
              <label>{t("chat.labels.manage.field.name.label")}</label>
              <Input
                onChange={(event, data) => {
                  onFormUpdate({ ...tag, hashtag: data.value });
                }}
                onKeyDown={(event: KeyboardEvent) => {
                  if (event.code === "Enter") {
                    handleSave(tag);
                  }
                }}
                type={"text"}
                value={tag.hashtag}
                maxLength={100}
                fluid
              />
            </Form.Field>
            <Form.Field>
              <label>{t("chat.labels.manage.field.color.label")}</label>
              <ColorPickerInput
                onPickColor={(color) => {
                  onFormUpdate({ ...tag, hashTagColor: color });
                }}
                tag={tag}
              />
            </Form.Field>
            <Form.Field className={"actions"}>
              <Button
                content={t("nav.backShort")}
                onClick={onDismiss}
                disabled={loading}
              />
              <Button
                content={t("form.button.save")}
                className={"button-small"}
                disabled={loading}
                loading={loading}
                primary
                onClick={() => {
                  handleSave(tag);
                }}
              />
            </Form.Field>
          </Form>
        </div>
      </div>
    </Portal>
  );
}
