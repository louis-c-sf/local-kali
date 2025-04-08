import React from "react";
import styles from "./TabMenu.module.css";
import { Menu } from "semantic-ui-react";
import { MenuProps } from "semantic-ui-react/dist/commonjs/collections/Menu/Menu";

interface TabMenuProps extends MenuProps {
  underscore?: "thin" | "thick";
}

export function TabMenu(props: TabMenuProps) {
  const {
    underscore = "thin",
    pointing,
    secondary,
    tabular,
    ...menuProps
  } = props;

  return (
    <Menu
      className={`
        ${styles.menu}
        ${props.size === "large" ? styles.large : ""}
        ${underscore === "thick" ? styles.thick : ""}
      `}
      tabular
      secondary
      pointing
      {...menuProps}
    />
  );
}
