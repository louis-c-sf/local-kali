import React, { ReactNode, useEffect, useState } from "react";
import styles from "./QRCodeStart.module.css";
import { Checkbox, Loader, Modal } from "semantic-ui-react";
import { iconFactory } from "../../Chat/hooks/useCompanyChannels";
import { Button } from "../../shared/Button/Button";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_GENERATE_WHATSAPP_QR_CODE } from "../../../api/apiPath";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import { CloseIcon } from "../../shared/modal/CloseIcon";
import { Trans, useTranslation } from "react-i18next";
import { useOpenInboxChat } from "../../Contact/Individual/useOpenInboxChat";
import { useAppSelector } from "../../../AppRootContext";

export type QRCodeResponseType = { url: string; qrcodeBase64: string };

export function QRCodeStart(props: {
  trigger: ReactNode;
  phone: string;
  channelName: string;
  channelId: number;
}) {
  const { phone, trigger, channelName, channelId } = props;
  const [sentMessage, setSentMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string>();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const userId = useAppSelector((s) => s.user.id);
  const openInboxChat = useOpenInboxChat();

  useEffect(() => {
    setLoading(true);
    postWithExceptions(POST_GENERATE_WHATSAPP_QR_CODE, {
      param: {
        phoneNumber: phone,
        message: "Hello! Please deliver my message to the SleekFlow Inbox.",
      },
    })
      .then((result: QRCodeResponseType) => {
        setQrCodeDataUri(result.qrcodeBase64);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      setLoading(false);
    };
  }, [phone]);

  return (
    <Modal
      trigger={trigger}
      dimmer={"inverted"}
      className={styles.modal}
      closeIcon={<CloseIcon />}
    >
      <div className={styles.root}>
        <div className={styles.mainHeader}>
          {t("onboarding.tryQrCode.header")}
        </div>
        <p className={styles.text}>
          {t("onboarding.tryQrCode.subheader")} {phone}.
        </p>
        <div className={styles.code}>
          <div className={styles.preview}>
            <div className={styles.icon}>
              <img src={iconFactory("whatsapp")} alt="Whatsapp" />
            </div>
            <div className={styles.title}>{channelName}</div>
            <div className={styles.account}>
              {t("onboarding.tryQrCode.businessAccount")}
            </div>
            <div className={styles.qrImage}>
              {!qrCodeDataUri && <Loader active size={"large"} />}
              {qrCodeDataUri && (
                <img src={`data:image/png;base64,${qrCodeDataUri}`} />
              )}
            </div>
          </div>
          <div className={styles.checkboxWrap}>
            <Checkbox
              label={t("onboarding.tryQrCode.agreement")}
              onClick={(e, { checked }) => {
                setSentMessage(!!checked);
              }}
            />
          </div>
          <p className={styles.text}>
            <Trans i18nKey={"onboarding.tryQrCode.sendHint"}>
              You’ll see the conversation in Inbox after you send a message. To
              know more about the basic functions of the Inbox, check
              <a
                href={"https://docs.sleekflow.io/using-the-platform/inbox"}
                target={"_blank"}
                rel={"nofollow noopener"}
              >
                here
              </a>
              .
            </Trans>
          </p>
          <div className={styles.actions}>
            <Button
              content={t("onboarding.tryQrCode.goToInbox")}
              disabled={!sentMessage || !qrCodeDataUri}
              customSize={"mid"}
              onClick={() => {
                openInboxChat(userId, "whatsapp360dialog", channelId + "");
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
