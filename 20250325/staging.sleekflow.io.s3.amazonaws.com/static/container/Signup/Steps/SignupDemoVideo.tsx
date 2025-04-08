import React from "react";
import { useTranslation } from "react-i18next";
import signupStyles from "./Signup.module.css";
import styles from "./SignupDemoVideo.module.css";
import { Button } from "component/shared/Button/Button";
import { useHistory } from "react-router";
import useRouteConfig from "../../../config/useRouteConfig";
import { useAppSelector } from "AppRootContext";
import { fetchWebVersion } from "api/Setting/fetchWebVersion";
import { VersionDic } from "container/Settings/Profile/types";
import { WEB_VERSION_V2_URL } from "auth/Auth0ProviderWithRedirect";

export default function SignupDemoVideo() {
  const { t } = useTranslation();
  const userId = useAppSelector((s) => s.user?.id ?? "");
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const onRedirectClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      return;
    }
    const reuslt = await fetchWebVersion(userId);
    if (reuslt.version === VersionDic.v2) {
      window.location.href = WEB_VERSION_V2_URL;
    } else {
      return history.replace(routeTo("/guide/get-started"));
    }
  };
  return (
    <div className={`main-content ${signupStyles.content} ${styles.content}`}>
      <div className={styles.title}>
        {t("form.signup.signupDemoVideo.title")}
      </div>
      <div className={styles.desc}>
        {t("form.signup.signupDemoVideo.subTitle")}
      </div>
      <div className={`container ${styles.videoWrapper}`}>
        <iframe
          title="sleekflow onboarding video"
          src={t("form.signup.signupDemoVideo.youtubeLink")}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className={styles.desc}>
        {t("form.signup.signupDemoVideo.description")}
      </div>
      <div className={styles.btn}>
        <Button onClick={onRedirectClick} primary>
          {t("form.signup.button.start")}
        </Button>
      </div>
    </div>
  );
}
