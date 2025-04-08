import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "../../config/useRouteConfig";
import TickIcon from "../../assets/tsx/icons/TickIcon";
import ShopifyUpgradeIcon from "./assets/ShopifyUpgradeIcon";
import styles from "./ShopifyUpgrade.module.css";
import { BackLink } from "../shared/nav/BackLink";

export default function ShopifyUpgrade() {
  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  return (
    <div className="main">
      <div className={styles.wrap}>
        <div className="back">
          <BackLink onClick={() => history.push("/channels")}>
            {t("nav.back", { to: t("nav.menu.channels") })}
          </BackLink>
        </div>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className="image">
              <ShopifyUpgradeIcon />
            </div>
            <div className="text">
              <div className="header">{t("shopifyUpgrade.header")}</div>
              <div className="subHeader">{t("shopifyUpgrade.subHeader")}</div>
            </div>
          </div>
          <div className={styles.content}>
            <div className="header">{t("shopifyUpgrade.benefit.header")}</div>
            <ul>
              <li>
                <TickIcon />
                {t("shopifyUpgrade.benefit.item1")}
              </li>
              <li>
                <TickIcon />
                {t("shopifyUpgrade.benefit.item2")}
              </li>
              <li>
                <TickIcon />
                {t("shopifyUpgrade.benefit.item3")}
              </li>
              <li>
                <TickIcon />
                {t("shopifyUpgrade.benefit.item4")}
              </li>
            </ul>
          </div>
          <div
            onClick={() =>
              history.push({
                pathname: routeTo("/settings/plansubscription"),
                state: {
                  isFromShopify: true,
                },
              })
            }
            className="ui button primary"
          >
            {t("shopifyUpgrade.button.upgrade")}
          </div>
        </div>
      </div>
    </div>
  );
}
