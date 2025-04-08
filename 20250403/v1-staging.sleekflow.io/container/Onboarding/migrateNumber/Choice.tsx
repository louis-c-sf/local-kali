import React from "react";
import { Dropdown } from "semantic-ui-react";
import styles from "./Choice.module.css";

export const Choice = (props: { text: string; index: number }) => {
  const { text, index } = props;
  const newText = text.split("(");
  return (
    <Dropdown.Item key={index} className={styles.item}>
      {text.includes("(") ? (
        <>
          <span>{newText[0]}</span>
          <span className={styles.number}>{`(${newText[1]}`}</span>
        </>
      ) : (
        text
      )}
    </Dropdown.Item>
  );
};
