import React, { ReactNode } from "react";
import styles from "./TableView.module.css";
import Logo from "../assets/salesforce-logo.svg";
import { Dimmer, Loader } from "semantic-ui-react";

export function TableView(props: {
  filter: ReactNode;
  table: ReactNode;
  pagination: ReactNode;
  loading: boolean;
  title: string;
}) {
  const { filter, loading, pagination, table } = props;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.text}>{props.title}</div>
          <div className={styles.logo}>
            <img src={Logo} />
          </div>
        </div>
        <div className={styles.filter}>{filter}</div>
      </div>
      <Dimmer.Dimmable dimmed={loading} className={styles.table}>
        <Dimmer active={loading} inverted>
          <Loader active={loading} />
        </Dimmer>
        {table}
      </Dimmer.Dimmable>
      <div className={styles.footer}>{pagination}</div>
    </div>
  );
}
