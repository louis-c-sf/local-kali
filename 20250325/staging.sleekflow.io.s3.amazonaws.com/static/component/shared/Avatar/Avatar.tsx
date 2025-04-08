import React from "react";
import styles from "./Avatar.module.css";
import ReactAvatar from "react-avatar";

export function Avatar(props: {
  name: string | undefined | null;
  size: string;
}) {
  return (
    <ReactAvatar
      name={props.name ?? ""}
      maxInitials={2}
      round
      size={props.size}
      className={Boolean(props.name) ? "" : styles.blank}
    />
  );
}
