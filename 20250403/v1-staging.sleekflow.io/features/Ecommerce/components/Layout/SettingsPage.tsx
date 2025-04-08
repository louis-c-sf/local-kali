import React, { ReactNode } from "react";
import styles from "./SettingsPage.module.css";
import { Header, Tab } from "semantic-ui-react";
import { StrictTabProps } from "semantic-ui-react/dist/commonjs/modules/Tab/Tab";

export function SettingsPage<TIndex extends string>(props: {
  header: ReactNode;
  panes: StrictTabProps["panes"];
  hasTableContent: boolean;
  selectedItem: TIndex;
  onItemSelected: (name: TIndex) => void;
  children?: ReactNode;
}) {
  const selectedIndex = props.panes?.findIndex((p) => {
    return p.menuItem?.name === props.selectedItem;
  });

  return (
    <div className={styles.root}>
      <div className={`${styles.header}`}>
        <Header as="h4" content={props.header} />
      </div>
      <div className={styles.body}>
        {props.children ?? (
          <Tab
            className={`${styles.tab} ${
              props.hasTableContent ? styles.hasTable : ""
            }`}
            menu={{
              secondary: true,
              pointing: true,
              className: styles.tabs,
            }}
            panes={props.panes}
            onTabChange={(e, data) => {
              const itemName = props.panes?.find(
                (p, idx) => idx === data.activeIndex
              )?.menuItem.name;
              if (itemName) {
                props.onItemSelected(itemName as TIndex);
              }
            }}
            activeIndex={selectedIndex}
          />
        )}
      </div>
    </div>
  );
}
