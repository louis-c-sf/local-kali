import styles from "./EditTemplateInline.module.css";
import React, { useState, useLayoutEffect } from "react";
import { UPDATED_PART_ENUM } from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import WarningIcon from "../Warning/assets/warning.svg";
import { Image } from "semantic-ui-react";
function updateInputRect(
  inputStyles: any,
  text: string,
  name: string,
  input: HTMLElement
) {
  let rect: HTMLElement | null = document.createElement("div");
  rect.classList.add(inputStyles);
  rect.style.display = "inline-block";
  rect.style.visibility = "hidden";
  rect.style.zIndex = "-1000000";
  rect.style.position = "absolute";
  rect.style.whiteSpace = "pre";
  document.body.appendChild(rect);
  rect.innerText = text;
  const valueWidth = rect.getBoundingClientRect().width;

  rect.innerText = name;
  const nameWidth = rect.getBoundingClientRect().width;
  document.body.removeChild(rect);
  rect = null;
  const parentWidth = input.parentElement?.clientWidth ?? 200;
  const fieldWidth = Math.ceil(Math.max(nameWidth, valueWidth));
  input.style.width = `${Math.min(fieldWidth, parentWidth)}px`;
  const getInputElem = input.querySelector("input");
  if (getInputElem) {
    getInputElem.style.width = `${Math.min(fieldWidth, parentWidth)}px`;
  }
}

export function VarInput(props: {
  name: string;
  value: string;
  id: string;
  valid: boolean;
  updatedPart: UPDATED_PART_ENUM;
  onChange: (
    updatedPart: UPDATED_PART_ENUM,
    name: string,
    value: string
  ) => void;
  onFocus: (name: string) => void;
  onBlur: (name: string) => void;
  onSubmit?: () => void;
  errorMessage?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const {
    id,
    name,
    onChange,
    value,
    valid,
    onBlur,
    onFocus,
    updatedPart,
    errorMessage,
    disabled = false,
  } = props;
  const [input, setInput] = useState<HTMLElement | null>(null);
  const inputStyles = styles.input;

  useLayoutEffect(() => {
    if (!input) {
      return;
    }
    updateInputRect(
      inputStyles,
      value,
      name.replace(`${updatedPart}_`, ""),
      input
    );
  }, [input]);
  function keydown(e: React.KeyboardEvent) {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      props.onSubmit && props.onSubmit();
    }
  }
  return (
    <div
      ref={setInput}
      className={`${styles.wrapper} ${errorMessage ? styles.error : ""}`}
    >
      <input
        id={id}
        value={value}
        className={`${inputStyles} ${
          valid && !errorMessage ? "" : styles.invalid
        }`}
        type={"text"}
        placeholder={name.replace(`${updatedPart}_`, "")}
        autoComplete={"off"}
        onFocus={() => {
          onFocus(name);
        }}
        onBlur={() => {
          onBlur(name);
        }}
        disabled={disabled}
        onKeyDown={keydown}
        data-catch_typing="true"
        onChange={(event) => {
          const text = event.target.value;
          onChange(updatedPart, name, text);
          if (!input) {
            return;
          }
          updateInputRect(inputStyles, text, name, input);
        }}
      />
      {errorMessage && (
        <InfoTooltip
          trigger={<Image className={styles.warning} src={WarningIcon} />}
          placement={"right"}
        >
          {errorMessage}
        </InfoTooltip>
      )}
    </div>
  );
}
