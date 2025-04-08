import React, { useContext } from "react";
import styles from "./BriefData.module.css";
import { CampaignStatus } from "../CampaignStatus";
import { CampaignDetailsContext } from "./CampaignDetailsContext";
import { Placeholder } from "semantic-ui-react";

export function BriefData() {
  const { campaign } = useContext(CampaignDetailsContext);

  return (
    <>
      <div className={styles.container}>
        {campaign && (
          <>
            <div className={styles.headerWrap}>
              <div className={styles.header}>{campaign.templateName}</div>
              <div className={styles.status}>
                <CampaignStatus
                  value={campaign.status ?? "draft"}
                  type={"broadcast"}
                />
              </div>
            </div>
          </>
        )}
        {!campaign && (
          <>
            <div className={styles.headerWrap}>
              <Placeholder>
                <Placeholder.Header>
                  <Placeholder.Line length={"long"} />
                </Placeholder.Header>
              </Placeholder>
            </div>
          </>
        )}
      </div>
    </>
  );
}
