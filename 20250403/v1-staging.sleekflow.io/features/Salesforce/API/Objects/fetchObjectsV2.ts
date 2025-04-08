import {
  FilterGroupType,
  SortType,
  RequestType,
  EntityType,
  ResponseType,
  ExpandTypeV2,
  ObjectNormalizedExpandedType,
} from "./contracts";
import { post } from "../../../../api/apiRequest";

export async function fetchObjectsV2<TExpands extends string>(
  type: EntityType,
  filters: FilterGroupType[],
  sorts: SortType[],
  limit: number,
  expands: ExpandTypeV2[],
  offsetToken?: string
): Promise<ResponseType<ObjectNormalizedExpandedType<TExpands>>> {
  const request: RequestType = {
    entity_type_name: type,
    continuation_token: offsetToken ?? null,
    limit: limit,
    filter_groups: filters,
    sorts: sorts,
    expands,
  };

  return await post("/CrmHub/GetObjectsV2", { param: request });
}
