import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, CheckboxProps, Form } from "semantic-ui-react";
import {
  InboxOrderDic,
  InboxOrderDictEnum,
} from "../../../../types/state/InboxStateType";

import styles from "./SortCheckboxGroup.module.css";

const Field = (props: {
  label: string;
  checked: boolean;
  value: string;
  handleOnChange: (
    e: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => void;
}) => {
  const { label, checked, value, handleOnChange } = props;

  return (
    <Form.Field>
      <Checkbox
        radio
        label={label}
        name="checkboxRadioGroup"
        value={value}
        checked={checked}
        onChange={handleOnChange}
      />
    </Form.Field>
  );
};

function SortCheckboxGroup(props: {
  sort: InboxOrderDictEnum;
  setSort: (sort: InboxOrderDictEnum) => void;
}) {
  const { t } = useTranslation();
  const { sort, setSort } = props;

  const handleOnChange = (
    e: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => {
    setSort(data.value as InboxOrderDictEnum);
  };

  const options = [
    {
      label: t("settings.inbox.sort.content.options.newest.label"),
      checked: sort === InboxOrderDic.newest,
      value: InboxOrderDic.newest,
    },
    {
      label: t("settings.inbox.sort.content.options.oldest.label"),
      checked: sort === InboxOrderDic.oldest,
      value: InboxOrderDic.oldest,
    },
  ];

  return (
    <Form className={styles.checkboxGroup}>
      {options.map((option, index) => (
        <Field
          label={option.label}
          checked={option.checked}
          value={option.value}
          handleOnChange={handleOnChange}
          key={`${option.value}_${index}`}
        />
      ))}
    </Form>
  );
}

export default SortCheckboxGroup;
