import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./FieldError.module.css";

export function FieldError(props: {
  text: string | undefined | any;
  className?: string;
  position?: "above" | "below";
  standalone?: boolean;
}) {
  const { text, className, position = "below", standalone = false } = props;
  const { t } = useTranslation();

  let displayText = text;
  if (text !== undefined && typeof text !== "string") {
    console.error("Invalid error format: " + JSON.stringify(text));
    displayText = t("form.field.any.error.common");
  }

  return (
    <div
      className={`
        ${styles.fieldError} 
        field-error 
        ${text ? "visible" : "hidden"} 
        ${className ?? ""}
        ${position === "above" ? styles.above : styles.below}
        ${standalone ? styles.standalone : ""}
      `}
    >
      {(displayText as string)?.split("\n").map((str, i) => (
        <div key={i}>{str}</div>
      ))}
    </div>
  );
}
