import React from "react";
import { Placeholder } from "semantic-ui-react";
import styles from "../Profile/ProfileDetails.module.css";
function ProfileDetailDummmy() {
  let rowSteps = Math.min(Math.abs(10), 10);
  return (
    <div className={styles.wrap}>
      <div className={styles.details}>
        {Array(rowSteps)
          .fill(1)
          .map((_, i) => (
            <div
              className={styles.detail}
              style={{ opacity: (rowSteps - i) / 10 }}
              key={i}
            >
              <span className={`${styles.name} dummy`}>
                <Placeholder>
                  <Placeholder.Line length={"full"} />
                </Placeholder>
              </span>
              <span className={`${styles.value} dummy`}>
                <Placeholder>
                  <Placeholder.Line length={"full"} />
                </Placeholder>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ProfileDetailDummmy;
