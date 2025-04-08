import { useState, useEffect } from "react";
import { CrmHubUserMappingType, fetchUserMappings } from "./fetchUserMappings";
import { ObjectNormalizedType } from "../Objects/contracts";
import { getOwnerByMapping } from "./getOwnerByMapping";

export function useSalesforceUsers() {
  const [mappingsCache, setMappingsCache] =
    useState<CrmHubUserMappingType | null>(null);

  useEffect(() => {
    fetchUserMappings().then(setMappingsCache).catch(console.error);
  }, []);

  return {
    getObjectOwner: (object: ObjectNormalizedType) => {
      if (mappingsCache === null) {
        return;
      }
      return getOwnerByMapping(object, "salesforce", mappingsCache);
    },
  };
}
