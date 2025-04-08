import React, { ReactNode } from "react";
import styles from "./Tabs.module.css";
import ScrollTo from "react-scroll-into-view-if-needed";
import { isFunction } from "../../../utility/function";

export function Tabs<TName extends string>(props: {
  tabs: Partial<Record<TName, ReactNode>>;
  contents: Record<TName, ReactNode | (() => ReactNode)>;
  active: TName;
  setActive: (name: TName) => void;
}) {
  const tabHeads = Object.entries(props.tabs) as [TName, ReactNode][];
  const tabSheet = props.contents[props.active];

  function getTabClassName(name: TName) {
    const list = [styles.tab];
    if (props.active === name) {
      list.push(styles.active);
    }
    return list.join(" ");
  }

  function switchTab(to: TName) {
    return () => props.setActive(to);
  }

  return (
    <>
      <div className={styles.tabs}>
        {tabHeads.map(([name, contents]) => (
          <ScrollTo
            key={name}
            active={props.active === name}
            options={{
              behavior: "smooth",
              block: "end",
              inline: "nearest",
            }}
          >
            <span className={getTabClassName(name)} onClick={switchTab(name)}>
              {contents}
            </span>
          </ScrollTo>
        ))}
      </div>
      <div className={styles.content}>
        {isFunction(tabSheet) ? tabSheet() : tabSheet}
      </div>
    </>
  );
}
