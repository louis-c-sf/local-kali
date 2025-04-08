import React from "react";
import styles from "features/Analytics/usecases/Performance/TotalSalesChart/SummaryItem.module.css";
import { Placeholder } from "semantic-ui-react";

export function SummaryItemDummy(props: {}) {
  return (
    <div className={`${styles.root} ${styles.pending}`}>
      <div className={styles.head}>
        <div className={styles.text}>
          <Placeholder>
            <Placeholder.Line length={"long"} />
          </Placeholder>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.value}>
          <Placeholder>
            <Placeholder.Line length={"medium"} />
          </Placeholder>
        </div>
      </div>
      <div className={styles.previous}>
        <div className={styles.label}>
          <Placeholder>
            <Placeholder.Line length={"very short"} />
          </Placeholder>
        </div>
        <div className={styles.value}>
          <Placeholder>
            <Placeholder.Line length={"short"} />
          </Placeholder>
        </div>
      </div>
    </div>
  );
}
