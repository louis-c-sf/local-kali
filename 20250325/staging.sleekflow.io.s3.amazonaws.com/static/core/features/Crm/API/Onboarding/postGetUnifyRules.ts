import { post } from "api/apiRequest";
import { camelize } from "lib/utility/caseConverter";
import { UnifyRuleType } from "./contracts";

type GetUnifyRules = {
  data: {
    unifyRules: UnifyRuleType[];
  };
  dateTime: string;
  httpStatusCode: number;
  requestId: string;
  success: boolean;
};

export default async function postGetUnifyRules(
  entityTypeName: string
): Promise<GetUnifyRules> {
  const response = await post("/CrmHub/GetUnifyRules", {
    param: { entity_type_name: entityTypeName },
  });
  return camelize(response) as GetUnifyRules;
}
