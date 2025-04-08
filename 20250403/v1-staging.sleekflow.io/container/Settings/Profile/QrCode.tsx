import React, { useCallback, useEffect, useState } from "react";
import { Button, Image, Input, Loader } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { GET_PERSONAL_WHATSAPP_QR_CODE } from "../../../api/apiPath";
import useFetchAutomationRulesByTriggerType from "../hooks/useFetchAutomationRulesByTriggerType";
import {
  QRCodeAutomationTriggerType,
  SubTabEnum,
} from "../WhatsAppQrCode/types/WhatsAppQrCodeTypes";
import whatsApp from "../../../assets/images/channels/whatsapp.svg";
import { messageUnserialized } from "../helper/convertMessageFormat";
import DownloadIcon from "../../../assets/tsx/icons/DownloadIcon";
import { useFetchWhatsappQrCode } from "../hooks/useFetchWhatsappQrCode";
import { QrCodeInfoType } from "../../../component/shared/QrCodeInfoType";
import styles from "./QrCode.module.css";

type MsgType = {
  top: string;
  bottom: string;
};
export const QrCode = (props: {
  isEdit: boolean;
  staffId: string;
  displayName: string;
  setDisplayName: (displayName: string) => void;
  defaultChannel: string;
  refresh: boolean;
}) => {
  const { t } = useTranslation();
  const {
    staffId,
    displayName,
    setDisplayName,
    isEdit,
    defaultChannel,
    refresh,
  } = props;
  const { fetchAutomationRulesByTriggerType } =
    useFetchAutomationRulesByTriggerType();
  const [qrCodeInfo, setQrCodeInfo] = useState<QrCodeInfoType>();
  const { fetchQrCodeInfo } = useFetchWhatsappQrCode();
  const [msg, setMsg] = useState<MsgType>({
    top: "",
    bottom: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const getMessage = useCallback(async () => {
    try {
      const result = await fetchAutomationRulesByTriggerType(
        QRCodeAutomationTriggerType.user
      );
      if (result) {
        const { top, bottom } = messageUnserialized({
          msgType: SubTabEnum.first,
          msg: result,
        });
        setMsg({
          top,
          bottom,
        });
      }
    } catch (e) {
      console.error("fetchAutomationRulesByTriggerType error: ", e);
    }
  }, [fetchAutomationRulesByTriggerType]);

  const handleDownloadClick = () => {
    window.open(qrCodeInfo?.qrcodeUrl, "WhatsappQrCode_download");
  };

  const getQrCodeInfo = useCallback(() => {
    try {
      setIsLoading(true);
      Promise.all([
        fetchQrCodeInfo(
          GET_PERSONAL_WHATSAPP_QR_CODE.replace("{staffId}", staffId)
        ),
        getMessage(),
      ]).then((values) => {
        const qrCodeInfo = values[0];
        if (qrCodeInfo) {
          setQrCodeInfo({
            qrcodeBase64: `data:image/png;base64, ${qrCodeInfo?.qrcodeBase64}`,
            qrcodeUrl: qrCodeInfo?.qrcodeUrl,
            url: qrCodeInfo?.url,
          });
        }
      });
    } catch (e) {
      console.error("getQrCodeInfo: ", e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchQrCodeInfo, getMessage, staffId]);

  useEffect(() => {
    getQrCodeInfo();
  }, []);

  useEffect(() => {
    if (refresh) {
      getQrCodeInfo();
    }
  }, [refresh]);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <Loader active />
      ) : (
        <>
          <div className={styles.contentContainer}>
            <div className={styles.title}>{t("account.qrCode.title")}</div>
            <div className={styles.description}>
              {t("account.qrCode.description")}
            </div>
            <div className={styles.msgContainer}>
              <span className={styles.msg}>{msg.top}</span>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                icon="pencil"
              />
              <span className={styles.msg}>{msg.bottom}</span>
            </div>
          </div>
          <div className={styles.qrCodeContainer}>
            <div className={styles.title}>{t("account.qrCode.share")}</div>
            {qrCodeInfo?.qrcodeUrl && (
              <Image alt={"qrCode"} src={qrCodeInfo.qrcodeUrl} />
            )}
            {defaultChannel !== "" && (
              <div className={styles.channelContainer}>
                <Image src={whatsApp} size={"mini"} />
                <span>{defaultChannel}</span>
              </div>
            )}
            <Button
              className={styles.download}
              primary
              disabled={isEdit}
              onClick={handleDownloadClick}
            >
              <DownloadIcon className={styles.downloadIcon} />
              {t("form.button.download")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
