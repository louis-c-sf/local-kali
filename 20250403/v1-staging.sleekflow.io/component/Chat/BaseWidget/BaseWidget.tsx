import React, { useState, ReactElement, ReactNode } from "react";
import styles from "./BaseWidget.module.css";
import iconStyles from "../../shared/Icon/Icon.module.css";
import { Placeholder } from "semantic-ui-react";
import { useVerticalCurtain } from "../../../lib/effects/useVerticalCurtain";

export interface BaseWidgetPropsType {
  isCollapsed: boolean;
  toggleCollapse: (collapsed: boolean) => void;
  isLoading: boolean;
  toggleLoading: (loading: boolean) => void;
}

export function BaseWidget(props: {
  children: ReactElement<any>;
  header: string;
  loading: boolean;
  icon: ReactNode;
  forceCollapse?: boolean;
}) {
  const { children, header, loading, forceCollapse = false } = props;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [curtainNode, setCurtainNode] = useState<HTMLDivElement | null>(null);
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
  const isWidgetCollapsed = forceCollapse || isCollapsed;

  useVerticalCurtain({
    contents: contentNode,
    curtain: curtainNode,
    opened: !isCollapsed,
  });

  function getWidgetClass() {
    const list = [styles.widget];
    isWidgetCollapsed && list.push(styles.collapsed);
    !isWidgetCollapsed && list.push(styles.opened);
    return list.join(" ");
  }

  function toggleCollapse() {
    setIsCollapsed((c) => !c);
  }

  if (loading) {
    return (
      <Placeholder>
        <Placeholder.Header image>
          <Placeholder.Line length={"long"} />
          <Placeholder.Line length={"medium"} />
        </Placeholder.Header>
        <Placeholder.Paragraph>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Paragraph>
      </Placeholder>
    );
  }
  return (
    <div className={getWidgetClass()}>
      <div className={styles.header} onClick={toggleCollapse}>
        <div className={styles.logo}>{props.icon}</div>
        <div className={styles.text}>{header}</div>

        <div className={styles.collapser}>
          <i
            className={`
              ${iconStyles.dropdownIcon} ${iconStyles.icon}
              ${styles.dropdownIcon}
          `}
          />
        </div>
      </div>
      <div className={styles.curtain} ref={setCurtainNode}>
        <div ref={setContentNode} className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
