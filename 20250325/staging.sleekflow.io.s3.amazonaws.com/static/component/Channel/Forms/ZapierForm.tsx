import React, { useEffect, useState } from "react";
import { CopyField } from "../CopyField";
import { Trans, useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { submitGenerateCompanyApiKey } from "api/Channel/submitGenerateCompanyApiKey";

export default function ZapierForm() {
  const company = useAppSelector((s) => s.company);
  const [apiKey, setApiKey] = useState("");

  const { t } = useTranslation();

  async function fetchApiKey() {
    try {
      const result = await submitGenerateCompanyApiKey("Zapier");
      setApiKey(result.apiKey);
    } catch (e) {
      console.error(`getApiKey error: ${e}`);
    }
  }

  useEffect(() => {
    if (company?.id) {
      fetchApiKey();
    }
  }, [company?.id]);
  const zapierUrl =
    "https://zapier.com/developer/public-invite/109282/f2979329e314eb4bf01be8f32ce5c116/";

  return (
    <div className={"channel-setup"}>
      <ol>
        <li>
          {t("channels.form.zapier.step.login")}
          <br />
          <a target="_blank" href={zapierUrl} className="link3">
            {zapierUrl}
          </a>
        </li>
        <li>
          <Trans i18nKey={"channels.form.zapier.step.zap"}>
            Create a new Zap and choose SleekFlow as your Trigger or Action App.
          </Trans>
        </li>
        <li>
          <Trans i18nKey={"channels.form.zapier.step.name"}>
            Click Continue. When prompted, name your connection and then enter
            your Unique API Key.
          </Trans>
        </li>
        <li>
          <Trans i18nKey={"channels.form.zapier.step.complete"}>
            Please remember to turn your Zap live. You're set!
          </Trans>
        </li>
      </ol>
      <CopyField
        label={t("channels.form.zapier.field.apiKey.label")}
        text={apiKey}
        long={false}
        masked
      />
    </div>
  );
}
