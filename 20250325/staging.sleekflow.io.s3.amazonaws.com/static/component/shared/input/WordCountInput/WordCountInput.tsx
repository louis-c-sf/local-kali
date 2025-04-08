import React from "react";
import { FormInputProps, Input } from "semantic-ui-react";
import styles from "./WordCountInput.module.css";

const WordCountInput: React.FC<{
  onChange: (value: string) => void;
  value: string;
  maxLength?: number;
} & Omit<FormInputProps, "onChange">> = ({
  onChange,
  value,
  maxLength = 20,
  ...props
}) => {
  return (
    <div className={styles.wrapper}>
      <Input
        className={styles.input}
        value={value}
        onChange={(e) => {
          if (onChange && e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        {...props}
      />
      <span className={styles.counter}>
        {value.length}/{maxLength}
      </span>
    </div>
  );
};

export default WordCountInput;
