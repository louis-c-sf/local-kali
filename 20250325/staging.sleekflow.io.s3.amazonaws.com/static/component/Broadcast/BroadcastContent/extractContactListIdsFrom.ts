import {
  AudienceFilterConditionType,
  FilterConditionCommonType,
} from "../../../types/BroadcastCampaignType";
import { isUserGroupCondition } from "../../../api/Broadcast/buildSaveCampaignRequest";
import { uniq } from "lodash-es";

export function extractContactListIdsFrom(
  conditions: AudienceFilterConditionType[]
): number[] {
  let ids = conditions
    .filter(isUserGroupCondition)
    .reduce(
      (acc: string[], condition) => [
        ...acc,
        ...((condition as FilterConditionCommonType)?.values ?? []),
      ],
      []
    )
    .map((id) => Number.parseInt(id))
    .filter((id) => !isNaN(id));

  return uniq(ids);
}
