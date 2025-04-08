import React from "react";
import { Image } from "semantic-ui-react";
import WhatsappLogo from "../../../assets/images/whatsapp.svg";
import styles from "./MigrateBspHeader.module.css";

export const MigrateBspHeader = (props: {
  title: string;
  description: string;
}) => {
  const { title, description } = props;

  return (
    <header className={styles.container}>
      <Image src={WhatsappLogo} className={styles.logo} />
      <div className="content">
        <div className={styles.title}>{title}</div>
        <div>{description}</div>
      </div>
    </header>
  );
};
