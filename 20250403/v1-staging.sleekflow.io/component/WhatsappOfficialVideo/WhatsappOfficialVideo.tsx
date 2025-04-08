import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image } from "semantic-ui-react";
import { iconFactory } from "../Chat/hooks/useCompanyChannels";
import styles from "./WhatsappOfficialVideo.module.css";
import { TickedList } from "../shared/content/TickedList";
import { Button } from "../shared/Button/Button";
import { ConnectFailWarning, RegularWarning } from "./WarningComponent";
import { useFacebookLogin } from "features/Facebook/helper/useFacebookLogin";
import useRouteConfig from "config/useRouteConfig";
import { useAppSelector } from "AppRootContext";
import { useHistory } from "react-router";
import paymentFailIcon from "../../assets/images/payment-fail.svg";
import { submitFacebookAccessToken } from "api/Channel/submitFacebookAccessToken";

export function retrieveOfficialWhatsappLink(
  language: string,
  channel: string
) {
  const videoLinkMapping = {
    cloudAPI: {
      zh: "https://www.youtube.com/embed/CgwVPGEL8ZM",
      en: "https://www.youtube.com/embed/Ul2UMBO9SxI",
    },
    default: {
      zh: "https://www.youtube.com/embed/UP8rk_ayrz4",
      en: "https://www.youtube.com/embed/kIYRzu1gdLg",
    },
  };
  const lang = language.substring(0, 2).toLowerCase();
  return videoLinkMapping[channel][lang] ?? videoLinkMapping.default[lang];
}

export default function WhatsappOfficialVideo(props: {
  onSubmit: () => void;
  isCloudAPI?: boolean;
  stripeStatus: string;
  showConnectionFee: boolean;
  setShowConnectionFee: (showConnectionFee: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const { routeTo } = useRouteConfig();
  const videoLink = retrieveOfficialWhatsappLink(
    i18n.language,
    props.isCloudAPI ? "cloudAPI" : "default"
  );
  const { isCloudAPI } = props;
  const history = useHistory();
  const [showConnectError, setShowConnectError] = useState(false);
  const facebookLogin = useFacebookLogin({
    updateEvent: useCallback(
      async (accessToken: string) => {
        try {
          const result = await submitFacebookAccessToken(accessToken);
          props.onSubmit();
          if (result.connectedWaba.length) {
            setShowConnectError(true);
          }
        } catch (e) {
          setShowConnectError(true);
          console.error("postAccessToken e: ", e);
        }
      },
      [props.onSubmit]
    ),
  });

  const [connectedPhoneNumbers = 0, maximumWhatsappInstance = 0] =
    useAppSelector((s) => [
      s.company?.whatsappCloudApiConfigs?.length,
      s.company?.maximumWhatsappInstance,
    ]);
  const isExceedPurchasedLimit =
    maximumWhatsappInstance <= connectedPhoneNumbers;
  const [stripeFail, setStripeFail] = useState(false);

  useEffect(() => {
    if (props.stripeStatus === "fail") {
      setStripeFail(true);
    }
  }, [props.stripeStatus]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="image">
            <Image src={iconFactory("whatsapp")} />
          </div>
          <div className="text">
            <div className="header">
              {t("guideContainer.official.video.header")}
            </div>
            <div className="subHeader">
              {t("guideContainer.official.video.subHeader")}
            </div>
          </div>
        </div>
        <iframe
          height="320"
          src={videoLink}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className={styles.todoTasks}>
          <div className="title">
            {t("guideContainer.official.video.nextStep.header")}
          </div>
          <TickedList
            inset
            items={
              isCloudAPI
                ? [
                    t("guideContainer.official.video.nextStep.cloudAPI.step1"),
                    t("guideContainer.official.video.nextStep.cloudAPI.step2"),
                    t("guideContainer.official.video.nextStep.cloudAPI.step3"),
                  ]
                : [
                    t(
                      "guideContainer.official.video.nextStep.official360dialog.step1"
                    ),
                    t(
                      "guideContainer.official.video.nextStep.official360dialog.step2"
                    ),
                    t(
                      "guideContainer.official.video.nextStep.official360dialog.step3"
                    ),
                  ]
            }
          />

          <div className={styles.action}>
            {isCloudAPI ? (
              <>
                <Button
                  primary
                  fluid
                  centerText
                  customSize={"mid"}
                  onClick={() => {
                    if (isExceedPurchasedLimit) {
                      props.setShowConnectionFee(true);
                      props.onSubmit();
                    } else {
                      props.setShowConnectionFee(false);
                      facebookLogin.handleClick({ type: "cloudAPIConnect" });
                    }
                  }}
                  loading={facebookLogin.loader.isLoading}
                  disabled={facebookLogin.loader.isLoading}
                >
                  {t("guideContainer.button.connectNew")}
                </Button>
                <Button
                  fluid
                  centerText
                  customSize={"mid"}
                  onClick={() => {
                    if (isExceedPurchasedLimit) {
                      props.setShowConnectionFee(true);
                      props.onSubmit();
                    } else {
                      props.setShowConnectionFee(false);
                      facebookLogin.handleClick({
                        type: "existingCloudAPIConnect",
                      });
                    }
                  }}
                  loading={facebookLogin.loader.isLoading}
                  disabled={facebookLogin.loader.isLoading}
                  className={styles.connectExisting}
                >
                  {t("guideContainer.button.connectExisting")} →
                </Button>
                {!facebookLogin.loader.isLoading && (
                  <div
                    className={styles.migrate}
                    onClick={() => {
                      if (isExceedPurchasedLimit) {
                        props.setShowConnectionFee(true);
                        props.onSubmit();
                      } else {
                        history.push(routeTo("/guide/migrate-phone-number"));
                      }
                    }}
                  >
                    {t("guideContainer.button.migrate")} →
                  </div>
                )}
              </>
            ) : (
              <Button
                primary
                fluid
                centerText
                customSize={"mid"}
                onClick={props.onSubmit}
              >
                {t("guideContainer.button.start")}
              </Button>
            )}
          </div>
        </div>
      </div>
      {isCloudAPI && <RegularWarning type="warning" />}
      {showConnectError && <ConnectFailWarning />}
      {stripeFail && (
        <div className={styles.stripeFail}>
          <Image src={paymentFailIcon} />
          {t("onboarding.cloudApi.connectFee.paymentFail")}
        </div>
      )}
    </>
  );
}
