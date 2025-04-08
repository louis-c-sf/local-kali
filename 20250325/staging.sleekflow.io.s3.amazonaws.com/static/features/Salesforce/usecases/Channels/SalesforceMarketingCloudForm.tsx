import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CopyField } from "component/Channel/CopyField";
import { fetchSalesforceMarketingEndpointUrl } from "api/SalesforceMarketingCloud/fetchSalesforceMarketingEndpointUrl";
import { submitGenerateCompanyApiKey } from "api/Channel/submitGenerateCompanyApiKey";

export function SalesforceMarketingCloudForm() {
  const [apiKey, setApiKey] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");

  const { t } = useTranslation();

  async function fetchApiKey() {
    try {
      const [keyResult, endpointUrlResult] = await Promise.all([
        submitGenerateCompanyApiKey("JourneyBuilder"),
        fetchSalesforceMarketingEndpointUrl(),
      ]);
      setApiKey(keyResult.apiKey);
      setEndpointUrl(endpointUrlResult.endpointUrl);
    } catch (e) {
      console.error(`getApiKey error: ${e}`);
    }
  }

  useEffect(() => {
    fetchApiKey();
  }, []);

  let loginUrl = "https://mc.exacttarget.com/";

  return (
    <div className={"channel-setup"}>
      <p>{t("channels.form.salesforceMC.steps.intro")}</p>
      <ol>
        <li>
          <Trans i18nKey={"channels.form.salesforceMC.steps.login"}>
            Sign in to your{" "}
            <a target={"_blank"} rel={"noopener noreferrer"} href={loginUrl}>
              Salesforce
            </a>{" "}
            account
          </Trans>
        </li>
        <li>{t("channels.form.salesforceMC.steps.selectNew")}</li>
        <li>{t("channels.form.salesforceMC.steps.inputName")}</li>
        <li>{t("channels.form.salesforceMC.steps.addComponent")}</li>
        <li>{t("channels.form.salesforceMC.steps.selectJourneyBuilder")}</li>
        <li>{t("channels.form.salesforceMC.steps.enterEndpointUrl")}</li>
      </ol>
      <p>{t("channels.form.salesforceMC.steps.success")}</p>
      <CopyField
        label={t("channels.form.salesforceMC.field.apiKey.label")}
        text={apiKey}
        long={false}
        masked
      />
      <CopyField
        label={t("channels.form.salesforceMC.field.endpointUrl.label")}
        text={endpointUrl}
        long={false}
      />
    </div>
  );
}
