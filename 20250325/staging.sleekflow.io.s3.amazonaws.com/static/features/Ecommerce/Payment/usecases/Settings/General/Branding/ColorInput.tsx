import React from "react";
import { Input } from "semantic-ui-react";
import styles from "../Branding/ColorInput.module.css";

export default function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.wrapper}>
      <Input
        className={styles.colorInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        className={styles.colorIndicator}
        style={{
          backgroundColor: value,
        }}
      />
    </div>
  );
}
