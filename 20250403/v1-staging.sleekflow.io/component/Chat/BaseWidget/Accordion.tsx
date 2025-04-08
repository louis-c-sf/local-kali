import React, { useState, ReactNode } from "react";
import styles from "./Accordion.module.css";
import iconStyles from "../../shared/Icon/Icon.module.css";
import { useVerticalCurtain } from "../../../lib/effects/useVerticalCurtain";

export function Accordion(props: {
  head: ReactNode;
  children: ReactNode;
  initOpen: boolean;
  headSuffix?: ReactNode;
}) {
  const { children, head, headSuffix, initOpen } = props;
  const [isCollapsed, setIsCollapsed] = useState(!initOpen);
  const [curtainNode, setCurtainNode] = useState<HTMLDivElement | null>(null);
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);

  useVerticalCurtain({
    contents: contentNode,
    curtain: curtainNode,
    opened: !isCollapsed,
  });

  const handleToggleAccordion = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <div
        className={`${styles.header} ${isCollapsed ? "collapsed" : ""}`}
        onClick={handleToggleAccordion}
      >
        <div className={styles.content}>
          <i
            className={`
              ${iconStyles.dropdownIcon} ${iconStyles.icon}
              ${
                isCollapsed
                  ? styles.collapsedShopifyDropdownIcon
                  : styles.shopifyDropdownIcon
              }
          `}
          />
          {head}
        </div>
        {headSuffix && <div className={styles.postfix}>{headSuffix}</div>}
      </div>
      <div
        className={isCollapsed ? styles.itemCollapsed : styles.item}
        ref={setCurtainNode}
      >
        <div className={styles.content} ref={setContentNode}>
          {children}
        </div>
      </div>
    </div>
  );
}
