import React, { useEffect, useState } from "react";
import { CopyField } from "../CopyField";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { submitGenerateCompanyApiKey } from "api/Channel/submitGenerateCompanyApiKey";

export default function MakeComForm() {
  const companyId = useAppSelector((s) => s.company?.id);
  const [apiKey, setApiKey] = useState("");

  const { t } = useTranslation();

  async function fetchApiKey() {
    try {
      const result = await submitGenerateCompanyApiKey("Make");
      setApiKey(result.apiKey);
    } catch (e) {
      console.error(`getApiKey error: ${e}`);
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchApiKey();
    }
  }, [companyId]);
  const loginUrl = "https://www.make.com/en/login";

  return (
    <div className={"channel-setup"}>
      <ol>
        <li>
          {t("channels.form.makeCom.step.login")}
          <br />
          <a
            target="_blank"
            href={loginUrl}
            className="link3"
            rel={"noopener noreferrer"}
          >
            {loginUrl}
          </a>
        </li>
        <li>{t("channels.form.makeCom.step.createScenario")}</li>
        <li>{t("channels.form.makeCom.step.pickAction")}</li>
        <li>{t("channels.form.makeCom.step.continueWithOthers")}</li>
      </ol>
      <CopyField
        label={t("channels.form.makeCom.field.apiKey.label")}
        text={apiKey}
        long={false}
        masked
      />
    </div>
  );
}
