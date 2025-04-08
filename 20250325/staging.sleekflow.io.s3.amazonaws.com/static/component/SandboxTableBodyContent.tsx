import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

interface SandboxDisableFunctionProps {
  header: string;
  content: string;
}

export default function SandboxTableBodyContent(
  props: SandboxDisableFunctionProps
) {
  const { t } = useTranslation();
  return (
    <div className="sandbox">
      <div className="content">
        <div className="header">{props.header}</div>
        <div className="content">{props.content}</div>
        <Link className="ui button primary" to={"/settings/plansubscription"}>
          {t("account.sandbox.startTrial")}
        </Link>
        <a
          className="link"
          target={"_blank"}
          rel="noopener noreferrer"
          href={getWhatsAppSupportUrl(
            "Hi SleekFlow. I'd like to learn more about the platform."
          )}
        >
          {t("account.sandbox.contactSales")}
        </a>
      </div>
    </div>
  );
}
