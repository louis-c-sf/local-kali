import React, { useEffect, useState } from "react";
import { CopyField } from "../CopyField";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { submitGenerateCompanyApiKey } from "api/Channel/submitGenerateCompanyApiKey";

export default function SleekflowAPIForm() {
  const company = useAppSelector((s) => s.company);
  const [apiKey, setApiKey] = useState("");
  const { t } = useTranslation();

  async function fetchApiKey() {
    try {
      const result = await submitGenerateCompanyApiKey("PublicApi");
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

  return (
    <>
      <div className={"channel-setup channel-setup_sleekflow-api"}>
        <CopyField
          label={t("channels.form.sleekflow.field.apiKey.label")}
          text={apiKey}
          long={false}
          masked
        />
      </div>
    </>
  );
}
