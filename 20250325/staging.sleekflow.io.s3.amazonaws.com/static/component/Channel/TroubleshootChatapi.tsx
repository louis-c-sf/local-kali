import { TFunction } from "i18next";
import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { PostLogin } from "../../component/Header";
import { Button, Icon, Portal } from "semantic-ui-react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import WifiImg from "../../assets/images/troubleshoot-chatapi/wifi.png";
import NoDesktopImg from "../../assets/images/troubleshoot-chatapi/no-desktop.png";
import ReconnectImg from "../../assets/images/troubleshoot-chatapi/reconnect.png";
import TickImg from "../../assets/images/troubleshoot-chatapi/tick.png";
import { fetchCompany } from "../../api/Company/fetchCompany";
import { parseHttpError, postWithExceptions } from "../../api/apiRequest";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { useAppDispatch } from "../../AppRootContext";
import { POST_WHATSAPP_REBOOT } from "../../api/apiPath";
import useCompanyChannels from "../Chat/hooks/useCompanyChannels";
import useRouteConfig from "../../config/useRouteConfig";
import moment from "moment";
import { BackLink } from "../shared/nav/BackLink";
import { htmlEntities } from "../../lib/utility/htmlEntities";
import { htmlEscape } from "../../lib/utility/htmlEscape";

const StepContent = (t: TFunction) => ({
  1: {
    title: t("channels.troubleshootChatapi.checkWifi"),
    reminder: [
      <Trans i18nKey="channels.troubleshootChatapi.wifiReminder1">
        Make sure your phone is connecting to a &nbsp;
        <div className="bold-reminder">stable Internet connection</div>
      </Trans>,
      <Trans i18nKey="channels.troubleshootChatapi.wifiReminder2">
        to avoid disconnection
        <div className="bold-reminder">Connect to Wi-Fi at all times</div>
      </Trans>,
    ],
    img: WifiImg,
  },
  2: {
    title: t("channels.troubleshootChatapi.noDesktop"),
    img: NoDesktopImg,
    reminder: [
      <Trans i18nKey="channels.troubleshootChatapi.noDesktopReminder1">
        Please <div className="bold-reminder">do not</div> troubleshoot with
        <div className="bold-reminder">WhatsApp Desktop</div>
      </Trans>,
      <Trans i18nKey="channels.troubleshootChatapi.noDesktopReminder2">
        Ensure WhatsApp mobile app is
        <div className="bold-reminder">open</div>
        and the screen is active{" "}
        <div className="bold-reminder">at all times</div>
      </Trans>,
    ],
  },
  3: {
    title: t("channels.troubleshootChatapi.tryReconnect"),
    reminder: [
      <Trans i18nKey="channels.troubleshootChatapi.reconnectReminder1">
        This action attempts to clear message queue and
        <div className="bold-reminder">establishes a new connection</div>
        reconnect
      </Trans>,
      <Trans i18nKey="channels.troubleshootChatapi.reconnectReminder2">
        Please keep your phone connected to a stable internet connection
      </Trans>,
    ],
    img: ReconnectImg,
  },
});

interface LocationChatapi {
  chatapi: string;
  disconnectedChatapi?: string[];
}

function TroubleshootChatapiPage() {
  const { t } = useTranslation();
  const pageTitle = t("channels.troubleshootChatapi.pageTitle");
  const [step, setStep] = useState(1);
  const history = useHistory();
  const location = useLocation<LocationChatapi>();
  const flash = useFlashMessageChannel();
  const loginDispatch = useAppDispatch();
  const ChatApiInstance = location.state?.chatapi;
  const [isLoading, setIsLoading] = useState(false);
  const [isShowBanner, setIsShowBanner] = useState(false);
  const { routeTo } = useRouteConfig();
  const [isRebooted, setIsRebooted] = useState(false);
  const channels = useCompanyChannels();

  useEffect(() => {
    const chatAPI = channels.find((c) => c.type == "whatsapp");
    const currentInstance = chatAPI?.configs?.find(
      (c) => c.wsChatAPIInstance == location.state?.chatapi
    );
    if (currentInstance) {
      const { lastRebootedAt } = currentInstance;
      let rebootedIn15Mins = false;
      if (lastRebootedAt) {
        rebootedIn15Mins = moment(lastRebootedAt).add(15, "minutes") > moment();
      }
      if (currentInstance?.status == "Rebooting" || rebootedIn15Mins) {
        setIsRebooted(true);
      }
    }
  }, [channels]);

  useEffect(() => {
    const disconnectedInstances = location.state.disconnectedChatapi;
    if (disconnectedInstances && disconnectedInstances.length > 0) {
    }
  }, [location.state.disconnectedChatapi]);

  async function onReboot() {
    setIsLoading(true);
    if (!location.state.chatapi && !location.state.disconnectedChatapi) {
      return;
    }
    const disconnectedInstances = location.state.disconnectedChatapi;
    if (disconnectedInstances && disconnectedInstances.length > 0) {
      try {
        Promise.all(
          disconnectedInstances.map((instanceId: string) => {
            postWithExceptions(
              POST_WHATSAPP_REBOOT.replace("{instanceId}", instanceId),
              { param: {} }
            );
          })
        );
        flash(t("flash.channels.status.whatsapp.rebooting"));
        const result = await fetchCompany();
        loginDispatch({
          type: "ADD_COMPANY",
          company: result,
        });
        setIsLoading(false);
        setIsShowBanner(true);
        setIsRebooted(true);
      } catch (e) {
        const error = parseHttpError(e);
        let errorMsg = t("chat.error.reboot.unable");
        if (typeof error === "string") {
          errorMsg = error;
        } else if (error.message) {
          errorMsg = error.message;
        }
        flash(t("system.error.error", { error: htmlEscape(errorMsg) }));
      }
    } else {
      try {
        await postWithExceptions(
          POST_WHATSAPP_REBOOT.replace("{instanceId}", ChatApiInstance),
          { param: {} }
        );
        flash(t("flash.channels.status.whatsapp.rebooting"));
        const result = await fetchCompany();
        loginDispatch({
          type: "ADD_COMPANY",
          company: result,
        });
        setIsLoading(false);
        setIsShowBanner(true);
        setIsRebooted(true);
      } catch (e) {
        const error = parseHttpError(e);
        let errorMsg = t("chat.error.reboot.unable");
        if (typeof error === "string") {
          errorMsg = error;
        } else if (error.message) {
          errorMsg = error.message;
        }
        flash(t("system.error.error", { error: htmlEscape(errorMsg) }));
      }
    }
  }

  function goNext() {
    setStep(step + 1);
  }

  const handleBack = () => {
    if (step == 1) {
      history.goBack();
    } else {
      setStep(step - 1);
    }
  };

  if (!location.state?.chatapi && !location.state?.disconnectedChatapi) {
    return <Redirect to={routeTo("/channels")} />;
  }

  return (
    <div className="post-login">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={""} />
      <div className="main troubleshoot">
        <div className="nav-container">
          <BackLink onClick={handleBack}>
            {t("channels.troubleshootChatapi.back")}
          </BackLink>
          {step === 3 ? (
            <div className="link" onClick={() => history.push("/channels")}>
              {t("channels.troubleshootChatapi.goToChannels")} →
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="troubleshoot-container">
          <div className="header">
            {t("channels.troubleshootChatapi.step")} {step}.{" "}
            {StepContent(t)[step].title}
          </div>
          <div className="img-container">
            <img src={StepContent(t)[step].img} alt="" />
          </div>
          {StepContent(t)[step].reminder.map((r: any, index: number) => (
            <div className="reminder-container" key={`${step}-${index}`}>
              <img src={TickImg} alt="" />
              {r}
            </div>
          ))}
          <div className="action">
            {step === 3 ? (
              <Button
                className="ui button primary cta-button"
                disabled={isLoading || isRebooted}
                loading={isLoading}
                onClick={onReboot}
              >
                {isRebooted
                  ? t("channels.troubleshootChatapi.rebooting")
                  : t("channels.troubleshootChatapi.reconnect")}
              </Button>
            ) : (
              <Button className="ui button primary cta-button" onClick={goNext}>
                {t("form.button.next")}
              </Button>
            )}
          </div>
          {step === 3 ? (
            <>
              <div className="chatapi-footer">
                {t("channels.troubleshootChatapi.cannotConnect")}
              </div>
              <a
                className="contact-link"
                href={`https://api.whatsapp.com/send?phone=17162266665&text=Hello%20Chat%20API%20Team!%20Please%20check%20my%20instance%20${ChatApiInstance}%20as%20we%20have%20problems%20connecting.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("channels.troubleshootChatapi.contactChatapi")} →
              </a>
            </>
          ) : (
            ""
          )}
        </div>
        <Portal open={isShowBanner} mountNode={document.body}>
          <div className={`top-display-banner connected-status troubleshoot`}>
            <div className="content">
              <Trans i18nKey="channels.troubleshootChatapi.bannerMessage">
                We are trying to reconnect you, please check the status in
                &nbsp;
                <div
                  className="contact-link"
                  onClick={() => history.push("/channels")}
                >
                  Channels
                </div>
              </Trans>
            </div>
            <span className={"close-button"}>
              <Icon name={"close"} onClick={() => setIsShowBanner(false)} />
            </span>
          </div>
        </Portal>
      </div>
    </div>
  );
}

export default TroubleshootChatapiPage;
