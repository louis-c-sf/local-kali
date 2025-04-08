import React from "react";
import { Image } from "semantic-ui-react";
import Sleekflow_logo_2x from "../assets/images/Sleekflow_logo_svg.svg";
import Helmet from "react-helmet";
import SuccessTick from "../assets/images/official-guide/topup-success.svg";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function WhatsappTopupSuccess() {
  const { t } = useTranslation();
  const pageTitle = t("nav.menu.prelogin.topupWhatsApp.success");
  return (
    <div className="single-form">
      <div className="prelogin menu">
        <a href="https://sleekflow.io" target="_blank" className="logo">
          <Image src={Sleekflow_logo_2x} />
        </a>
      </div>
      <div className="ui container whatsapp-success">
        <div className="container_cotent">
          <div className="success-image">
            <Image src={SuccessTick} />
          </div>
          <div className="header">{t("account.topUpWhatsapp.header")}</div>
          <div className="content">
            <Trans i18nKey={"account.topUpWhatsapp.content"}>
              Please wait for ~2 weeks for the application to process.
              <br />
              Meanwhile, feel free to connect to other channels if applicable.
            </Trans>
          </div>
          <Link
            to="/guide/get-started"
            className="ui button primary small"
          >{`${t("account.topUpWhatsapp.button.explorer")} →`}</Link>
        </div>
      </div>
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
    </div>
  );
}

export default WhatsappTopupSuccess;
