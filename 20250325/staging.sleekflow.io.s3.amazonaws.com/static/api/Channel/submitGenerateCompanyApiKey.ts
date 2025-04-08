import { postWithExceptions } from "../apiRequest";

export async function submitGenerateCompanyApiKey(
  type: VendorType
): Promise<CompanyKeyApiResponseType> {
  return await postWithExceptions(`/company/apiKeys/${type}`, {
    param: {},
  });
}

type VendorType = "Zapier" | "Make" | "PublicApi" | "JourneyBuilder";

interface CompanyKeyApiResponseType {
  apiKey: string;
  permissions: string[];
  createdAt: string;
  callLimit: number | null;
  calls: number;
  keyType: string;
}
