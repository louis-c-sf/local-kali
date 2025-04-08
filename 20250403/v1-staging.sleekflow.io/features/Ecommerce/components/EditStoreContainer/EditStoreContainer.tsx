import React, { ReactNode } from "react";
import styles from "features/Ecommerce/components/EditStoreContainer/EditStoreContainer.module.css";
import { BackNavBar } from "features/Ecommerce/components/BackNavBar/BackNavBar";

export function EditStoreContainer(props: {
  children: ReactNode;
  backLink: string;
  header: ReactNode;
  catchActionsPortal: React.Dispatch<
    React.SetStateAction<HTMLDivElement | null>
  >;
  insideTab: boolean;
}) {
  return (
    <div className={styles.canvas}>
      <BackNavBar to={props.backLink} />
      <div className={styles.container}>
        <div className={styles.header}>{props.header}</div>
        {props.insideTab ? (
          <div className={styles.tabs}> {props.children}</div>
        ) : (
          props.children
        )}
      </div>
      <div className={styles.actions} ref={props.catchActionsPortal} />
    </div>
  );
}
