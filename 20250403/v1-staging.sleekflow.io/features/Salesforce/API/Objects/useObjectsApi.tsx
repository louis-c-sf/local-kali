import { EntityType, FilterGroupType } from "./contracts";
import { useCallback } from "react";
import { fetchObjectSalesforceLink } from "./fetchObjectSalesforceLink";
import { fetchObjectConversation } from "./fetchObjectConversation";
import { fetchObjectsCount } from "./fetchObjectsCount";
import { fetchGetObjectsByIdentities } from "./fetchGetObjectsByIdentities";

export function useObjectsApi(props: { type: EntityType }) {
  const getObjectUrl = useCallback(async (id: string) => {
    try {
      const linkData = await fetchObjectSalesforceLink(props.type, id);
      return linkData.object_direct_ref_url ?? null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const getConversation = useCallback(async (id: string) => {
    try {
      return (
        (await fetchObjectConversation(props.type, id)).conversation_id ?? null
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const getObjectDetailsByIdentity = useCallback(
    async (phoneNumber: string, providerName?: string) => {
      try {
        return (
          (await fetchGetObjectsByIdentities(
            props.type,
            phoneNumber,
            providerName
          )) ?? null
        );
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    []
  );

  const getCount = useCallback(async (filters: FilterGroupType[]) => {
    try {
      return (await fetchObjectsCount(props.type, filters)).count ?? null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  return {
    getObjectUrl,
    getCount,
    getConversation,
    getObjectDetailsByIdentity,
  };
}
