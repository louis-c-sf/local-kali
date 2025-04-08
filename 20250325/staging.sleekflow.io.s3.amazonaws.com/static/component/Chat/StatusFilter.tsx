import { Menu } from "semantic-ui-react";
import React, { useEffect, useState } from "react";
import {
  StatusSelectionItemType,
  useStatusSelectionChoices,
} from "./localizable/useStatusSelectionChoices";
import { useAppSelector, useAppDispatch } from "../../AppRootContext";

export function StatusFilter() {
  const selectedStatus = useAppSelector((s) => s.selectedStatus);
  const loginDispatch = useAppDispatch();
  const statusSelection = useStatusSelectionChoices();
  const [queryInitialized, setQueryInitialized] = useState(false);
  const [querySelectedStatus, setQuerySelectedStatus] = useState<string>();

  useEffect(() => {
    const params = new URLSearchParams(document.location.search.substring(1));
    setQuerySelectedStatus(params.get("selectedStatus") ?? undefined);
    setQueryInitialized(true);
  }, []);

  useEffect(() => {
    if (!queryInitialized) {
      return;
    }
    if (querySelectedStatus && selectedStatus !== querySelectedStatus) {
      const selectedStatusNew =
        statusSelection.find((status) => status.name === querySelectedStatus)
          ?.name ?? statusSelection[0].name;
      loginDispatch({
        type: "INBOX.FILTER_STATUS_UPDATE",
        selectedStatus: selectedStatusNew,
      });
    }
  }, [querySelectedStatus, queryInitialized]);

  const selectStatus = (status: StatusSelectionItemType) => {
    loginDispatch({ type: "CLEAR_PROFILE" });
    loginDispatch({
      type: "INBOX.FILTER_STATUS_UPDATE",
      selectedStatus: status.name,
    });
  };

  return (
    <Menu
      pointing
      secondary
      className={"filter-status"}
      items={statusSelection}
      onItemClick={(event, data) => {
        selectStatus(data as StatusSelectionItemType);
      }}
    />
  );
}
