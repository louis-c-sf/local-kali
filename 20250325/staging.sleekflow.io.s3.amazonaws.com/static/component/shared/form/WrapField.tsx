import React, { useState, useEffect } from "react";
import { Form } from "semantic-ui-react";
import { FieldError } from "./FieldError";
import styles from "./WrapField.module.css";

type textLimitType = {
  max: number;
  currentTextLength: number;
};

export function WrapField(props: {
  label: string;
  children: any;
  error: string;
  fieldClass?: string;
  id: string;
  required?: boolean;
  limit?: textLimitType;
  readonly?: boolean;
}) {
  const { required = false, limit, readonly = false } = props;
  const [localTextLength, setLocalTextLength] = useState(
    limit?.currentTextLength ?? 0
  );
  useEffect(() => {
    setLocalTextLength(props.limit?.currentTextLength ?? 0);
  }, [props.limit?.currentTextLength]);

  return (
    <Form.Field
      className={`${props.fieldClass ?? ""} ${styles.wrapField}`}
      data-id={`${props.id}__wrap`}
    >
      <label id={props.id} className={`${styles.label} custom-field-label`}>
        {props.label}
        {required && <span className={styles.required}>*</span>}
        {props.limit && (
          <span className={styles.limit}>
            {localTextLength}/{props.limit?.max}
          </span>
        )}
      </label>
      {props.children}
      {!readonly && <FieldError text={props.error} />}
    </Form.Field>
  );
}
