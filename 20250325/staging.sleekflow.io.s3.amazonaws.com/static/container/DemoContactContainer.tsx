import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import DemoContact from "../component/DemoContact/DemoContact";
import { PostLogin } from "../component/Header";

function DemoContactContainer() {
  const { t } = useTranslation();
  const pageTitle = t("nav.contactSales.title");
  return (
    <div className="post-login">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={""} />
      <DemoContact />
    </div>
  );
}

export default DemoContactContainer;
