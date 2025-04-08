import { post } from "api/apiRequest";
import { UnifyRuleType } from "./contracts";
import { snakelize, CaseConverterParamsType } from "lib/utility/caseConverter";

export default async function postUpsertUnifyRules(
  entityTypeName: string,
  unifyRules: UnifyRuleType[]
): Promise<void> {
  return await post("/CrmHub/UpsertUnifyRules", {
    param: {
      entity_type_name: entityTypeName,
      unify_rules: snakelize(unifyRules as unknown as CaseConverterParamsType),
    },
  });
}
