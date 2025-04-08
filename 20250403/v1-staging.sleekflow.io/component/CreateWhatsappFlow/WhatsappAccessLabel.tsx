import React, { ReactNode } from "react";
import styles from "./WhatsappAccessLabel.module.css";
import popupStyles from "../Channel/ChannelActive.module.css";
import { useTranslation } from "react-i18next";
import { use360DialogApiLocales } from "./use360DialogApiLocales";
import { Popup } from "semantic-ui-react";
import { WhatsApp360DialogConfigsType } from "../../types/CompanyType";

export enum WhatsappAccessLevel {
  Unknown = 0,
  BasicTrial = 1,
  ExpandedTrial = 2,
  LimitedAccess = 3,
  Standard = 4,
}

export function is360DialogConnected(x: WhatsApp360DialogConfigsType): boolean {
  return x.isClient;
}

export function WhatsappAccessLabel(props: {
  level: WhatsappAccessLevel;
  abilities?: ReactNode[];
  size?: "small" | "normal";
}) {
  const { level, abilities, size = "normal" } = props;
  const { titleMap } = use360DialogApiLocales();
  const { t } = useTranslation();

  const colorMap: Record<WhatsappAccessLevel, string> = {
    [WhatsappAccessLevel.Unknown]: styles.red,
    [WhatsappAccessLevel.BasicTrial]: styles.yellow,
    [WhatsappAccessLevel.ExpandedTrial]: styles.cyan,
    [WhatsappAccessLevel.LimitedAccess]: styles.blue,
    [WhatsappAccessLevel.Standard]: styles.green,
  };

  const labelRendered = (
    <div
      className={`
      ${styles.label}
      ${colorMap[level]}
      ${size === "small" ? styles.small : ""}
       `}
    >
      {titleMap[level]}
    </div>
  );
  return abilities ? (
    <Popup
      position="top center"
      className={`${popupStyles.statusTooltip} info-tooltip`}
      content={
        <div className={styles.popup}>
          <div className={styles.head}>{t("channels.statusTooltip.can")}</div>
          <ul>
            {abilities.map((text, i) => {
              return (
                <li key={i} className={styles.item}>
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      }
      trigger={labelRendered}
    />
  ) : (
    labelRendered
  );
}
