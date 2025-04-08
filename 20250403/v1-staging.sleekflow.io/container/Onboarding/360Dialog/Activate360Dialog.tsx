import React, { useState } from "react";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import flowStyles from "../../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import styles from "./Activate360DialogHelp.module.css";
import { PostLogin } from "../../../component/Header";
import BannerMessage from "../../../component/BannerMessage/BannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { Create360DialogForm } from "../../../component/CreateWhatsappFlow/steps/Create360DialogForm";
import { BackLink } from "../../../component/shared/nav/BackLink";
import { Create360DialogChannelResponseType } from "../../../api/Channel/submitCreate360DialogChannel";
import CompleteOfficialVerification from "../../../component/CreateWhatsappFlow/CompleteOfficialVerification/CompleteOfficialVerification";

function Activate360Dialog() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const [channelCreated, setChannelCreated] =
    useState<Create360DialogChannelResponseType>();
  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <div className="main content create-whatsapp-form">
        <div className={flowStyles.container}>
          <div className={`create-form`}>
            {channelCreated ? (
              <CompleteOfficialVerification
                accessLevel={channelCreated.accessLevel}
                phone={channelCreated.whatsAppPhoneNumber}
                channelName={channelCreated.channelName}
                channelId={channelCreated.id}
              />
            ) : (
              <div className={flowStyles.wrapper}>
                <div className={styles.nav}>
                  <BackLink onClick={() => history.goBack()} />
                </div>
                <div className={flowStyles.contentContainer}>
                  <div className={styles.headerPic}>💡</div>
                  <div className={`${styles.header} ${styles.centered}`}>
                    {t("onboarding.officialActivate.form.header")}
                  </div>
                  <div className={styles.subheaderLight}>
                    <Trans i18nKey={"onboarding.officialActivate.form.footer"}>
                      Not sure about the progress? Check our step-by-step guide
                      <a
                        href={
                          "https://docs.sleekflow.io/messaging-channels/360dialog-whatsapp/apply-via-360dialog/add-an-additional-number"
                        }
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                      >
                        here
                      </a>
                    </Trans>
                  </div>
                  <p className={styles.text}>
                    1. {t("onboarding.officialActivate.form.step1")}
                  </p>
                  <p className={styles.text}>
                    2. {t("onboarding.officialActivate.form.step2")}
                  </p>
                  <Create360DialogForm
                    onSuccess={(
                      channelCreated: Create360DialogChannelResponseType
                    ) => {
                      setChannelCreated(channelCreated);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <BannerMessage />
      </div>
    </div>
  );
}

export default Activate360Dialog;
