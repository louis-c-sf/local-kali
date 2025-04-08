import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../component/Header";
import ConsultationPaymentSuccess from "../component/Settings/ConsultationPaymentSucces";

function ConsultationPaymentSuccessContainer() {
  const { t } = useTranslation();
  const pageTitle = t("nav.consultationPaymentSuccess.title");
  return (
    <div className="post-login">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem="" />
      <ConsultationPaymentSuccess />
    </div>
  );
}

export default ConsultationPaymentSuccessContainer;
