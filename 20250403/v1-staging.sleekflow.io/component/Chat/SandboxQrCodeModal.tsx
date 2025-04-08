import React, { useEffect, useState } from "react";
import { Dimmer, Image, Loader } from "semantic-ui-react";
import { GET_SANDBOX_QRCODE_URL, GET_SANDBOX_USER } from "../../api/apiPath";
import "../../style/css/sandbox-popup.css";
import { get } from "../../api/apiRequest";
import SandboxWhatsappImage from "../../assets/images/sandbox-whatsapp.svg";
import { fetchOnboardingProgress } from "../../api/Onboarding/fetchOnboardingProgress";
import { Trans, useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { pick } from "ramda";
import useRouteConfig from "../../config/useRouteConfig";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import { QrCodeInfoType } from "../shared/QrCodeInfoType";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

function SandboxQrCodeModal(props: {
  setIsSandbox: (sandbox: boolean) => void;
}) {
  const { currentPlan, numOfNewMessages, company, profile } = useAppSelector(
    pick(["currentPlan", "numOfNewMessages", "company", "profile"])
  );
  const loginDispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { routeTo } = useRouteConfig();
  const [qrCodeInfo, setQrCodeInfo] = useState<QrCodeInfoType>();
  const [loading, isLoading] = useState(false);
  const { t } = useTranslation();
  const accessRuleGuard = useAccessRulesGuard();

  async function checkSandbox() {
    const result = await get(GET_SANDBOX_USER, { param: {} });
    const onBoardingFlag = await fetchOnboardingProgress();
    if (onBoardingFlag.isWebWidgetAdded === false && result.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  const fetchSandboxQrCode = async () => {
    if (profile.id) {
      setOpen(false);
      return;
    }
    isLoading(true);
    try {
      const result: boolean = await checkSandbox();
      if (result) {
        const qrCodeUrl = await get(GET_SANDBOX_QRCODE_URL, { param: {} });
        loginDispatch({
          type: "CLEAR_PROFILE",
        });
        setQrCodeInfo({
          qrcodeBase64: `data:image/png;base64, ${qrCodeUrl.qrcodeBase64}`,
          url: qrCodeUrl.url,
        });
        setOpen(true);
        props.setIsSandbox(true);
      } else {
        setOpen(false);
        props.setIsSandbox(false);
      }
    } catch (e) {
      console.error(`fetchSandboxQrCode error ${e}`);
    } finally {
      isLoading(false);
    }
  };
  const link = accessRuleGuard.isPaid()
    ? routeTo("/guide/whatsapp-comparison/cloudAPI", true)
    : routeTo("/settings/plansubscription", true);
  useEffect(() => {
    if (currentPlan.id && numOfNewMessages) {
      if (company?.isSandbox) {
        fetchSandboxQrCode();
      } else {
        setOpen(false);
      }
    }
  }, [currentPlan.id, numOfNewMessages]);

  if (!open) {
    return null;
  }
  return (
    <div className="chat-info sandbox-popup">
      <div className="content">
        <div className="header">{t("chat.sandbox.content.header")}</div>
        <div className="subTitle">{t("chat.sandbox.content.subTitle")}</div>
        <div className="warning">
          <div className="header">{t("chat.sandbox.warning.header")}</div>
          <div className="content">
            <Trans i18nKey="chat.sandbox.warning.content">
              To connect to your Official WhatsApp Channel, please click
              <a
                className="link"
                target="_blank"
                rel="noopener noreferrer"
                href={link}
              >
                here
              </a>
              .
            </Trans>
          </div>
        </div>
        <div className="content">
          <div className="qrcode">
            <div className="image">
              {loading ? (
                <Dimmer active>{<Loader active />}</Dimmer>
              ) : (
                qrCodeInfo?.qrcodeBase64 && (
                  <Image alt={"sandbox qrCode"} src={qrCodeInfo.qrcodeBase64} />
                )
              )}
            </div>
            <span className="_or">{t("or")}</span>
            <a
              className="ui button primay send-btn"
              target={"_blank"}
              href={qrCodeInfo?.url}
            >
              <Image src={SandboxWhatsappImage} />
              {t("chat.sandbox.content.button.sendWhatsapp")}
            </a>
          </div>
          <div className="content">
            <Trans i18nKey="chat.sandbox.content.guide.step1">
              1. Scan the QR code with the camera on your phone.
              <br /> Please
              <span className="bold">DO NOT use WhatsApp to scan</span>
              directly.
            </Trans>
          </div>
          <div className="content">{t("chat.sandbox.content.guide.step2")}</div>
          <div className="content">
            <Trans i18nKey="chat.sandbox.content.guide.step3">
              3. After receiving an automatic response, send any
              <br />
              message back and explore our inbox in real-time.
            </Trans>
          </div>
          <div className="content-link">
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href={getWhatsAppSupportUrl(
                "Hi SleekFlow. I'd like to learn more about the platform."
              )}
            >
              {t("chat.actions.callSupport")}{" "}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SandboxQrCodeModal;
