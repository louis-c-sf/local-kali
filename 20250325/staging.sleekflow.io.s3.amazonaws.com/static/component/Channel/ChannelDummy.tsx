import React from "react";
import { Placeholder } from "semantic-ui-react";
import styles from "./ChannelActive.module.css";

export function ChannelDummy(props: { noMargin?: boolean }) {
  return (
    <div
      className={`${styles.channel} ${props.noMargin ? styles.noMargin : ""}`}
    >
      <div className={styles.image}>
        <Placeholder>
          <Placeholder.Image square className={styles.imagePlaceholder} />
        </Placeholder>
      </div>
      <div className={styles.description}>
        <div className={styles.name}>
          <Placeholder>
            <Placeholder.Line length={"medium"} />
          </Placeholder>
        </div>
        <div className={styles.params}>
          <Placeholder>
            <Placeholder.Line length={"long"} />
          </Placeholder>
        </div>
        <div className={styles.labels}>
          <Placeholder>
            <Placeholder.Line length={"short"} />
          </Placeholder>
        </div>
      </div>
    </div>
  );
}
