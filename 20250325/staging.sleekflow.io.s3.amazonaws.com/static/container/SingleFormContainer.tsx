import React, { useEffect, useRef } from "react";
import Helmet from "react-helmet";
import { useHistory } from "react-router";
import BannerMessage from "../component/BannerMessage/BannerMessage";
import { Trans, useTranslation } from "react-i18next";
import useRouteConfig from "../config/useRouteConfig";
import { BackLink } from "../component/shared/nav/BackLink";
import { PreLogin } from "../component/Header";

interface SingleFormContainerProps {
  children: any;
  isDisplaySignUp: boolean;
  headerText: string;
  pageTitle: string;
  additonalText?: JSX.Element;
  isDisplaySignIn: boolean;
  subHeader?: JSX.Element;
  className?: string;
  isDisplayFooter?: boolean;
  onClickBack?: () => void;
}

const SingleFormContainer = (props: SingleFormContainerProps) => {
  const {
    additonalText,
    isDisplaySignUp = false,
    headerText,
    pageTitle,
    isDisplaySignIn,
    subHeader,
    className,
    isDisplayFooter,
    onClickBack,
  } = props;
  let history = useHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const beamerElem = document.querySelector("#beamerSelector");
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  if (beamerElem) {
    beamerElem.classList.add("hidden");
  }
  const signUp = () => {
    history.push(routeTo(`/signup`));
  };
  useEffect(() => {
    if (containerRef.current) {
      const firstInput = containerRef.current.querySelector(
        ".ui.form > .field > .field > .ui.input > input"
      ) as HTMLInputElement;
      firstInput?.focus();
    }
  }, [containerRef]);
  return (
    <div className="single-form">
      <Helmet title={pageTitle} />
      <PreLogin className={className} isDisplaySignIn={isDisplaySignIn} />
      {onClickBack && (
        <div className="back">
          <BackLink onClick={onClickBack}>{t("nav.backShort")}</BackLink>
        </div>
      )}
      <div className={`form-container ${className ? className : ""}`}>
        <div className="header">{headerText}</div>
        {subHeader && <div className="subHeader">{subHeader}</div>}
        <div
          className={`content-container ${className ? className : ""}`}
          ref={containerRef}
        >
          {props.children}
        </div>
        {additonalText}
        {isDisplaySignUp && (
          <div className="message ask-signup">
            <Trans i18nKey={"form.signin.prompt.signup"}>
              Don't have an account?
              <span className="link2" onClick={signUp}>
                Sign up
              </span>
            </Trans>
          </div>
        )}
      </div>
      {isDisplayFooter && (
        <div className="footer">
          <a target="_blank" href="https://sleekflow.io">
            SleekFlow
          </a>
          <a target="_blank" href="https://sleekflow.io/terms">
            {t("form.signin.nav.terms")}
          </a>
          <a target="_blank" href="https://sleekflow.io/privacy">
            {t("form.signin.nav.privacy")}
          </a>
        </div>
      )}
      <BannerMessage />
    </div>
  );
};

export default SingleFormContainer;
