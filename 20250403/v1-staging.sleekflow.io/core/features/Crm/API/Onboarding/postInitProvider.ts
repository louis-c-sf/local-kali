import { post } from "api/apiRequest";
import { ProviderType } from "./contracts";
import { camelize } from "lib/utility/caseConverter";

type InitProviderResponse = {
  providerName: ProviderType;
  context: {
    salesforceAuthenticationUrl?: string;
    hubspotAuthenticationUrl?: string;
  };
};

export default async function postInitProvider(
  providerName: string,
  returnToUrl: string
): Promise<InitProviderResponse> {
  const response = await post("/CrmHub/InitProvider", {
    param: { provider_name: providerName, return_to_url: returnToUrl },
  });
  return camelize(response) as InitProviderResponse;
}
