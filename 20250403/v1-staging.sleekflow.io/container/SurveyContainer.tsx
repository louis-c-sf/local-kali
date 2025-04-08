import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import PostLoginHeaderWithoutMenu from "../component/Header/PostLoginHeaderWithoutMenu";
import Questionnaires from "../component/Questionnaires";

function SurveyContainer() {
  const { t } = useTranslation();
  const pageTitle = t("nav.menu.survey");
  return (
    <div className="post-login survey-container">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLoginHeaderWithoutMenu />
      <Questionnaires />
    </div>
  );
}

export default SurveyContainer;
