import React from "react";
import { Radio, Form } from "semantic-ui-react";
import styles from "./TypeCard.module.css";

export const TypeCard = (props: {
  title: string;
  value: string;
  content: string;
  onChange: () => void;
  selectedType: string;
  disabled: boolean;
}) => {
  const { title, value, content, onChange, selectedType, disabled } = props;
  return (
    <div className={styles.card}>
      <Form>
        <Form.Field>
          <Radio
            label={title}
            value={value}
            onChange={onChange}
            checked={selectedType === value}
            disabled={disabled}
          />
        </Form.Field>
      </Form>
      <div className={styles.content}>{content}</div>
    </div>
  );
};
