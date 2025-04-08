import { Image } from "semantic-ui-react";
import { iconFactory } from "../Chat/hooks/useCompanyChannels";
import styles from "./WhatsappFlowHeader.module.css";
import React from "react";

export function WhatsappFlowHeader(props: {
  header: string;
  subheader: string;
  icon: Parameters<typeof iconFactory>[0];
}) {
  return (
    <div className={`header ${styles.header}`}>
      <div className={`image ${styles.image}`}>
        <Image src={iconFactory(props.icon)} />
      </div>
      <div className="text">
        <div className="header">{props.header}</div>
        <div className="subHeader">{props.subheader}</div>
      </div>
    </div>
  );
}
