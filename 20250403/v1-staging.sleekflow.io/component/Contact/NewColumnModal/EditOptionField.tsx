import { Form, Icon } from "semantic-ui-react";
import React from "react";
import { TFunction } from "i18next";

export function EditOptionField(props: {
  index: number;
  optionVal: string;
  optionValueChanged: (value: string, index: number) => void;
  removeOptions?: (index: number) => void;
  t: TFunction;
}) {
  const { index, optionVal, optionValueChanged, removeOptions, t } = props;

  return (
    <div className={`edit-columns-modal__option`} key={index}>
      <div className="drag-handle">
        <Icon className={"button-dots"} />
      </div>
      <Form.Input
        value={optionVal}
        onChange={(e) => optionValueChanged(e.target.value, index)}
      />
      {removeOptions && (
        <span className="delete-option" onClick={() => removeOptions(index)}>
          {t("form.button.delete")}
        </span>
      )}
    </div>
  );
}
