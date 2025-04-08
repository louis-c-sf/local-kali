import { putMethodWithExceptions } from "api/apiRequest";

export default async function submitWabaOptIn(props: {
  wabaId: string;
  templateName?: string;
  templateLanguage?: string;
  isOptInEnable?: boolean;
}) {
  const { wabaId, templateName, templateLanguage, isOptInEnable } = props;
  return await putMethodWithExceptions(
    "/company/whatsapp/cloudapi/waba/opt-in",
    {
      param: {
        wabaId,
        ...{ templateName },
        ...{ templateLanguage },
        ...{ isOptInEnable },
      },
    }
  );
}
