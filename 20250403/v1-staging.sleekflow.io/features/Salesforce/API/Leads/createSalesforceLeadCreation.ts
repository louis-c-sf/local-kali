import { postWithExceptions } from "api/apiRequest";
type RequestType = {
  sleekflow_company_id: string;
  userprofile_id: string;
  salesman_id_field_name: string;
};

export function createSalesforceLeadCreation(param: RequestType) {
  return postWithExceptions("/suzuki-integration/salesforceLeadCreation", {
    param: {
      ...param,
    },
  });
}
