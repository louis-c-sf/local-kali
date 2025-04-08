import React from "react";
import styles from "./TextInput.module.css";

export function TextInput(props: {
  onChange: (data: string) => void;
  value: string;
  fluid?: boolean;
  type: "text" | "email" | "password" | "number";
  placeholder?: string;
}) {
  const { onChange, value, type, placeholder, fluid = false } = props;
  return (
    <input
      className={`${styles.input} ${fluid ? styles.fluid : ""}`}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
}
