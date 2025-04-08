import React, { useContext } from "react";
import styles from "./StatusTabs.module.css";
import { Menu, MenuItemProps } from "semantic-ui-react";
import { useCampaignStatusLocales } from "../useCampaignStatusLocales";
import { CampaignDetailsContext } from "./CampaignDetailsContext";
import { BroadcastStatusAliasType } from "../../../types/BroadcastCampaignType";

export const statusesToShow: BroadcastStatusAliasType[] = [
  "sent",
  "delivered",
  "failed",
  "read",
  "replied",
];

export function StatusTabs(props: {
  onChange: (status: BroadcastStatusAliasType) => void;
}) {
  const { statusSelected, statusCount, booted } = useContext(
    CampaignDetailsContext
  );
  const { statusMapping } = useCampaignStatusLocales();
  const totalSent = statusCount.delivered;

  function getNumericValue(status: string) {
    if (isNaN(totalSent)) {
      return "";
    }
    if (status === "sent") {
      return statusCount.sent;
    }
    if (status === "failed") {
      const failed = statusCount.failed;
      if (failed > 0) {
        const failed = statusCount.failed;
        return `${failed} (${(
          failed /
          ((statusCount.sent + failed) / 100)
        ).toFixed(2)}%)`;
      }
      return `0`;
    }
    if (statusCount[status] === 0) {
      return "0";
    }
    return `${statusCount[status]} (${(
      statusCount[status] /
      (totalSent / 100)
    ).toFixed(2)}%)`;
  }

  const tabItems: MenuItemProps[] = statusesToShow.map((status) => ({
    content: (
      <div className={styles.nameWrap}>
        <span className={styles.name}>{statusMapping[status]}</span>
        {booted && (
          <span className={styles.count}>{getNumericValue(status)}</span>
        )}
      </div>
    ),
    onClick: () => props.onChange(status),
    active: statusSelected === status,
    key: status,
  }));

  return (
    <div className={styles.component}>
      <Menu tabular className={styles.menu} pointing secondary>
        {tabItems.map((item) => (
          <Menu.Item {...item} />
        ))}
      </Menu>
    </div>
  );
}
