import React, { useState, ReactNode } from "react";
import { Image } from "semantic-ui-react";
import styles from "./Accordion.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";

export default function Accordion(props: {
  title: string | ReactNode;
  children: ReactNode;
  extra?: string | ReactNode;
  image?: ReactNode;
  background?: boolean;
}) {
  const { title, children, extra, image, background } = props;
  const [expanded, setExpanded] = useState(false);

  function handleClick() {
    setExpanded(!expanded);
  }

  return (
    <div
      className={`container ${styles.accordion} ${
        background && expanded && styles.background
      }`}
    >
      <div className={styles.accordionTitle} onClick={handleClick}>
        <div className={styles.title}>
          {image && (
            <div className={styles.img}>
              <Image src={image} />
            </div>
          )}
          {title}
        </div>
        <div>
          {extra && <div className={styles.extraText}>{extra}</div>}
          <div className={styles.expandBtn}>
            <span
              className={`${iconStyles.icon} ${styles.arrowIcon} ${
                expanded && styles.active
              }`}
            />
          </div>
        </div>
      </div>
      {expanded && <div className={`${styles.accordionBody}`}>{children}</div>}
    </div>
  );
}
