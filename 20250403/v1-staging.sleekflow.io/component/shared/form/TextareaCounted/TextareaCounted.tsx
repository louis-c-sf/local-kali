import React, { ReactNode } from "react";
import styles from "./TextareaCounted.module.css";
import EmojiButton from "../../../EmojiButton";

export function TextareaCounted(props: {
  onChange: (value: string) => void;
  onFocus?: () => void;
  id?: string;
  value: string;
  onEmojiSelected?: (emoji: string) => void;
  formatCounter?: (size: number) => ReactNode;
  max: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  const disabled = props.disabled ?? false;

  function defaultFormat() {
    return `${props.value.length} / ${props.max}`;
  }

  function changeValue(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = ev.target.value;
    if (newValue.length < props.max) {
      return props.onChange(newValue);
    }
    props.onChange(newValue.substring(0, props.max));
  }

  return (
    <div className={styles.content}>
      <textarea
        cols={5}
        onInput={changeValue}
        onFocus={props.onFocus}
        id={props.id}
        value={props.value}
        className={styles.textarea}
        disabled={disabled}
        placeholder={props.placeholder}
      />
      <div className={styles.control}>
        {props.onEmojiSelected && (
          <EmojiButton handleEmojiInput={props.onEmojiSelected} />
        )}
        <div className={styles.count}>
          {props.formatCounter
            ? props.formatCounter(props.value.length)
            : defaultFormat()}
        </div>
      </div>
    </div>
  );
}
