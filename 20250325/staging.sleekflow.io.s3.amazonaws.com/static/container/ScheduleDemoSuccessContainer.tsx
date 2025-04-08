import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../component/Header";
import ScheduleDemoSuccess from "../component/ScheduleDemoSuccess/ScheduleDemoSuccess";

function ScheduleDemoSuccessContainer() {
  const { t } = useTranslation();
  const pageTitle = t("nav.demoScheduleSuccess.title");
  return (
    <div className="post-login">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={""} />
      <ScheduleDemoSuccess />
    </div>
  );
}

export default ScheduleDemoSuccessContainer;
