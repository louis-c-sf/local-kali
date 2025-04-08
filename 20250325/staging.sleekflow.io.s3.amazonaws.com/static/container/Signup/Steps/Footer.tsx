import React from "react";
import signupStyles from "./Signup.module.css";
import { useTranslation } from "react-i18next";
import moment from "moment";

function Footer() {
  const { t } = useTranslation();

  return (
    <div className={signupStyles.footer}>
      <div>
        <a
          className={signupStyles.link}
          target="_blank"
          rel="noreferrer"
          href="https://sleekflow.io/terms"
        >
          {t("form.signin.nav.terms")}
        </a>
        <a
          className={signupStyles.link}
          target="_blank"
          rel="noreferrer"
          href="https://sleekflow.io/privacy"
        >
          {t("form.signin.nav.privacy")}
        </a>
        <a
          className={`${signupStyles.link} ${signupStyles.last}`}
          target="_blank"
          rel="noreferrer"
          href="https://sleekflow.io"
        >
          © SleekFlow {moment().year()}
        </a>
      </div>
    </div>
  );
}

export default Footer;
