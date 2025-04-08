import React, { useCallback, useEffect, useState } from "react";
import { UserProfileGroupType } from "./UserProfileGroupType";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { fetchUserGroups } from "../../../api/Company/fetchUserGroups";

export default useImportedLists;

function useImportedLists() {
  const [loading, setLoading] = useState(false);
  const lists = useAppSelector((s) => s.contacts.lists, equals);
  const listsBooted = useAppSelector((s) => s.contacts.listsBooted);

  const loginDispatch = useAppDispatch();

  const refreshUserGroups = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchUserGroups();
      loginDispatch({ type: "LISTS_LOADED", lists: result.userGroups });
    } catch (error) {
      console.error("refreshUserGroups", error);
    } finally {
      setLoading(false);
    }
  }, [loginDispatch, setLoading]);

  useEffect(() => {
    if (listsBooted) {
      return;
    }
    refreshUserGroups();
  }, [refreshUserGroups]);

  const listAdded = useCallback(
    (list: UserProfileGroupType) => {
      loginDispatch({ type: "LIST_ADDED", list });
    },
    [loginDispatch]
  );

  const refresh = useCallback(() => {
    if (loading) {
      return;
    }
    refreshUserGroups();
  }, [loading]);

  return {
    lists,
    listsBooted: listsBooted,
    loading,
    refresh,
    listAdded,
  };
}
