import { postWithExceptions } from "../apiRequest";

export async function fetchSalesforceMarketingEndpointUrl(): Promise<EndpointUrlResponseType> {
  return await postWithExceptions(
    "/JourneyBuilderCustomActivity/GetEndpointUrl",
    {
      param: {},
    }
  );
}

type EndpointUrlResponseType = {
  endpointUrl: string;
};
