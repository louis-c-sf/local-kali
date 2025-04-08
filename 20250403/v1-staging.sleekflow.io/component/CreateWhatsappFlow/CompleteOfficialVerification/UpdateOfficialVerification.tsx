import React from "react";
import { useTranslation } from "react-i18next";
import { WhatsappAccessLevel } from "../WhatsappAccessLabel";
import CompleteOfficialVerificationView from "./CompleteOfficialVerificationView";
import useRouteConfig from "../../../config/useRouteConfig";
import { useHistory } from "react-router";

export default function UpdateOfficialVerification(props: {
  accessLevel: WhatsappAccessLevel;
}) {
  const { accessLevel } = props;
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <CompleteOfficialVerificationView
      accessLevel={accessLevel}
      primaryAction={() => history.push(routeTo("/channels"))}
      primaryActionName={t("form.createWhatsapp.complete.action.goBack")}
      reviewMode={true}
    />
  );
}
