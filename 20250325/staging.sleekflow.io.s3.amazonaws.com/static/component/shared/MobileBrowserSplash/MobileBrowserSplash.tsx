import React from "react";
import styles from "./MobileBrowserSplash.module.css";
import IosEnImg from "./assets/appstore-en.png";
import IosHkImg from "./assets/appstore-zh-HK.png";
import IosCnImg from "./assets/appstore-zh-CN.png";
import AndroidEnImg from "./assets/googleplay-en.png";
import AndroidHkImg from "./assets/googleplay-zh-HK.png";
import AndroidCnImg from "./assets/googleplay-zh-CN.png";
import Logo from "../../../assets/images/Black_logo.svg";

import { Trans, useTranslation } from "react-i18next";
import { Portal } from "semantic-ui-react";
import { useHistory, useLocation } from "react-router";
import { useDetectMobile } from "lib/effects/useDetectMobile";

const LOCALSTORAGE_DISPLAY_MOBILE = "isMobilePageDisplayed";

export function MobileBrowserSplash(props: { children: JSX.Element }) {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const isMobile = useDetectMobile();
  const history = useHistory();
  const location = useLocation();

  const disableSplash =
    localStorage.getItem(LOCALSTORAGE_DISPLAY_MOBILE) ||
    location.pathname.includes("payment-result");

  if (!isMobile || disableSplash) {
    return props.children ?? null;
  }

  const assetsMap: Record<string, { ios: string; android: string }> = {
    en: {
      ios: IosEnImg,
      android: AndroidEnImg,
    },
    "zh-HK": {
      ios: IosHkImg,
      android: AndroidHkImg,
    },
    "zh-cn": {
      ios: IosCnImg,
      android: AndroidCnImg,
    },
  } as const;

  const assets = assetsMap[language] ?? assetsMap.en;

  const localeMap = {
    "en-US": "",
    "en-GB": "/en-gb",
    "en-SG": "/en-sg",
    "id-ID": "/id-id",
    "nl-NL": "/nl-nl",
    "pt-BR": "/pt-br",
    "zh-CN": "/zh-cn",
    "zh-HK": "/zh-hk",
  };

  const redirectUrl = `https://sleekflow.io${localeMap[language] ?? ""}`;

  function onClick() {
    if (!disableSplash) {
      localStorage.setItem(LOCALSTORAGE_DISPLAY_MOBILE, "true");
    }
    history.replace({
      pathname: location.pathname,
      search: location.search,
      state: location.state,
    });
  }

  return (
    <>
      <Portal open mountNode={document.body}>
        <div className={styles.root}>
          <div className={styles.logo}>
            <a href={redirectUrl}>
              <img src={Logo} />
            </a>
          </div>
          <div className={styles.body}>
            <div className={styles.head}>
              <Trans i18nKey={"system.mobileSplash.head"}>
                Experience the power of social commerce with the{" "}
                <a href={redirectUrl}>SleekFlow</a> desktop and mobile app
              </Trans>
            </div>
            <div className={styles.downloadLink}>
              {t("system.mobileSplash.download")}
            </div>
            <div className={styles.apps}>
              <a href="https://apps.apple.com/app/sleekflow/id1495751100">
                <img src={assets.ios} alt="App Store" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=io.sleekflow.sleekflow">
                <img src={assets.android} alt="Google Play" />
              </a>
            </div>
          </div>
          <div className={styles.home}>
            <div className={styles.link} onClick={onClick}>
              {t("system.mobileSplash.back")}
            </div>
          </div>
        </div>
      </Portal>
    </>
  );
}
