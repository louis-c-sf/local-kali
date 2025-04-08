import React from "react";
import { useTranslation } from "react-i18next";
import BannerMessage from "../component/BannerMessage/BannerMessage";
import Helmet from "react-helmet";
import { PostLogin } from "../component/Header";
import { useAppSelector } from "../AppRootContext";
import CreateWhatsappFlow from "../component/CreateWhatsappFlow/CreateWhatsappFlow";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";

function CreateWhatsappFormContainer() {
  const { t } = useTranslation();
  const pageTitle = t("nav.menu.prelogin.createWhatsApp.pageTitle");
  const [userId] = useAppSelector((s) => [s.user?.id]);

  return (
    <div className={`${userId ? "post-login" : "pre-login"}`}>
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={""} />
      <div className="main content create-whatsapp-form">
        <CreateWhatsappFlow />
      </div>
      <BannerMessage />
    </div>
  );
}

export default CreateWhatsappFormContainer;
