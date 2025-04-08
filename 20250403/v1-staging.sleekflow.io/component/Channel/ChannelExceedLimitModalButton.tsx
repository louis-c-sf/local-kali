import { CloseButton } from "component/shared/CloseButton";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Modal } from "semantic-ui-react";
import UpgradeImg from "../../assets/images/upgrade.svg";
import { Link } from "react-router-dom";
import { Button } from "../shared/Button/Button";

const ChannelExceedLimitModalButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button customSize={"sm"} onClick={() => setOpen(true)}>
        {t("channels.selection.button.add")}
      </Button>
      <Modal open={open} className="contact-exceed-modal">
        <Modal.Content className="_content">
          <CloseButton onClick={() => setOpen(false)} />
          <div className="container">
            <div className="header">
              {t("channels.exceedChannelsModal.title")}
            </div>
            <Image src={UpgradeImg} />
            <div className="content">
              {t("channels.exceedChannelsModal.description")}
            </div>
            <Link to="/settings/plansubscription">
              <div className="ui button primary">
                {t("account.upgrade.button")}
              </div>
            </Link>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default ChannelExceedLimitModalButton;
