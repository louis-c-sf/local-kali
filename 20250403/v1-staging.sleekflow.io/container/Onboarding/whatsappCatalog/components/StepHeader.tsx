import React from "react";
import styles from "./StepHeader.module.css";
import WhatsappIcon from "../../../../assets/images/channels/whatsapp.svg";

export default function StepHeader(props: { title: string }) {
  return (
    <div className={styles.header}>
      <img className={styles.icon} src={WhatsappIcon} alt="Whatsapp" />
      <h1 className={styles.title}>{props.title}</h1>
    </div>
  );
}
