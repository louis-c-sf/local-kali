import React from "react";
import { useLocation } from "react-router";
import flowStyles from "../../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import styles from "./Activate360DialogHelp.module.css";
import { PostLogin } from "../../../component/Header";
import BannerMessage from "../../../component/BannerMessage/BannerMessage";
import helpImg from "./assets/screenshot1.png";
import logoImg from "./assets/360DialogLogo.svg";
import { Trans } from "react-i18next";
import { ChannelActive } from "../../../component/Channel/ChannelActive";
import { ChannelInfoConfiguredType } from "../../../types/ChannelInfoType";
import { ChannelDummy } from "../../../component/Channel/ChannelDummy";

function Activate360DialogHelp(props: {}) {
  const location = useLocation<{
    channel: ChannelInfoConfiguredType<"whatsapp360dialog">;
  }>();
  const channel = location.state?.channel;

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <div className="main content create-whatsapp-form">
        <div className={flowStyles.container}>
          <div className={`create-form`}>
            <div className={flowStyles.wrapper}>
              <div className={styles.content}>
                <Trans i18nKey={"onboarding.officialActivate.body"}>
                  <div className={styles.header}>
                    You’ve registered 360 Dialog account in Sleekflow
                  </div>
                  <div className={styles.subheader}>
                    Want to add new phone number to your Whatsapp Official
                    account in Sleekflow?
                  </div>
                  <div className={styles.text}>
                    Please access the 360 Client Hub and find the “+” button
                    under WhatsApp Accounts tab. You will be able to add new
                    number or port existing business API there. Each additional
                    number added via the Hub will be charged accordingly.
                  </div>
                  <div className={styles.pic}>
                    <figure>
                      <img src={helpImg} />
                      <figcaption>
                        <img src={logoImg} alt="" />
                      </figcaption>
                    </figure>
                  </div>
                  <div className={styles.text}>
                    You will be asked to input the phone number to be migrated,
                    as well as the Facebook ID that owns the number.
                  </div>
                  <div className={styles.subheader}>
                    Retrieving the API Key in Sleekflow to Go Live!
                  </div>
                  <div className={styles.text}>
                    It may takes a few days for 360dialog to confirm the new
                    added numbers. Once it is ready, you will be able to
                    generate API key from the 360 Client Hub.
                  </div>
                  <div className={styles.text}>
                    New added number will be reflected in Channels page with an
                    Inactive label. Click ‘Activate’ to fill in the registered
                    phone number and API key in order to make it live!
                  </div>
                </Trans>
                <div className={styles.channels}>
                  {channel ? (
                    <ChannelActive noMargin hideActions channel={channel} />
                  ) : (
                    <ChannelDummy noMargin />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <BannerMessage />
      </div>
    </div>
  );
}

export default Activate360DialogHelp;
