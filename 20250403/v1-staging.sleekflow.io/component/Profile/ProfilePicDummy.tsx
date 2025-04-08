import React from "react";
import { Placeholder } from "semantic-ui-react";
import styles from "./ProfilePic.module.css";

export default function ProfilePicDummy(props: { large?: boolean }) {
  return (
    <div className={`${styles.wrap} ${props.large ? styles.large : ""}`}>
      <Placeholder className={styles.picHolder}>
        <Placeholder.Image square />
      </Placeholder>
      <Placeholder>
        <Placeholder.Line />
      </Placeholder>
    </div>
  );
}
