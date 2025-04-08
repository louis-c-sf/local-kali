import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button, Image, Popup } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import InfoIcon from "./assets/info.svg";
import styles from "./ChannelsTooltip.module.css";

const ChannelsTooltip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const channelsTooltipStatus = Cookies.get("channelsTooltipStatus");

  useEffect(() => {
    if (channelsTooltipStatus !== "closed") {
      setTimeout(() => {
        setIsOpen(true);
      }, 100);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    Cookies.set("channelsTooltipStatus", "closed");
    setIsOpen(false);
  };

  return (
    <Popup
      className="info-tooltip"
      position="right center"
      on={channelsTooltipStatus === "closed" ? "hover" : "click"}
      open={isOpen}
      onClose={handleClose}
      onOpen={handleOpen}
      pinned
      offset={"0 15px"}
      children={
        <>
          <div>{t("settings.inbox.channels.tooltip.content")}</div>
          {channelsTooltipStatus !== "closed" && (
            <div className={styles.buttonWrap}>
              <Button primary className={styles.button} onClick={handleClose}>
                {t("settings.inbox.channels.tooltip.button")}
              </Button>
            </div>
          )}
        </>
      }
      trigger={<Image src={InfoIcon} className={styles.icon} />}
    />
  );
};

export default ChannelsTooltip;
