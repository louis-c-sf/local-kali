import React, { useState } from "react";
import { Table } from "semantic-ui-react";
import { catchLinkClicked } from "../../utility/dom";
import BroadcastCampaignType from "../../types/BroadcastCampaignType";
import GridDummy from "../shared/Placeholder/GridDummy";
import SandboxTableBodyContent from "../SandboxTableBodyContent";
import { isFreePlan } from "../../types/PlanSelectionType";
import { BroadcastTableBody } from "./BroadcastTableBody";
import { BroadcastTableHeader } from "./BroadcastTableHeader";
import { useTranslation } from "react-i18next";
import { ChannelConfiguredType } from "../Chat/Messenger/types";
import { equals, pick, update } from "ramda";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";

export default BroadcastTableList;

function BroadcastTableList(props: {
  selectCampaignId: string[];
  updateSelectCampaignId: Function;
  activePage: number;
  loading: boolean;
  batchPending: boolean;
  limit: number;
  deleteConfirmationRequested: boolean;
  requestDeleteConfirmation: (show: boolean) => void;
  companyChannels: ChannelConfiguredType<any>[];
}) {
  const {
    updateSelectCampaignId,
    loading,
    batchPending,
    selectCampaignId,
    companyChannels,
  } = props;

  const { broadcastCampaign, selectedTimeZone, currentPlan } = useAppSelector(
    pick(["broadcastCampaign", "selectedTimeZone", "currentPlan"]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const [selectAllCheckbox, setSelectAllCheckbox] = useState(false);
  const { t } = useTranslation();

  const selectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (broadcastCampaign) {
      if (broadcastCampaign.length === selectCampaignId.length) {
        setSelectAllCheckbox(false);
        updateSelectCampaignId([]);
      } else {
        setSelectAllCheckbox(true);
        updateSelectCampaignId(
          broadcastCampaign.map((campaign) => campaign.id)
        );
      }
    }
  };

  const handleCellSelected = (e: React.MouseEvent, id: string) => {
    if (catchLinkClicked(e)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const foundIndex = selectCampaignId.indexOf(id);
    if (foundIndex === -1) {
      updateSelectCampaignId([...selectCampaignId, id]);
      if (
        broadcastCampaign &&
        selectCampaignId.length + 1 === broadcastCampaign.length
      ) {
        setSelectAllCheckbox(true);
      }
    } else {
      let campaignSpliced = [...selectCampaignId];
      campaignSpliced.splice(foundIndex, 1);
      updateSelectCampaignId(campaignSpliced);
      setSelectAllCheckbox(false);
    }
  };

  function updateCampaign(campaign: BroadcastCampaignType) {
    if (!broadcastCampaign) {
      return;
    }
    const updateIndex =
      broadcastCampaign?.findIndex((c) => c.id === campaign.id) ?? -1;
    if (updateIndex > -1) {
      loginDispatch({
        type: "UPDATE_BROADCAST",
        broadcastCampaign: update(updateIndex, campaign, broadcastCampaign),
      });
    }
  }

  const hasResults = Boolean(broadcastCampaign && broadcastCampaign.length > 0);

  const showFields: (keyof BroadcastCampaignType)[] = [
    "id",
    "status",
    "name",
    "sent",
    "delivered",
    "read",
    "reply",
    "channelsWithIds",
    "createdBy",
    "lastUpdated",
    "startDate",
  ];
  return (
    <Table sortable basic={"very"}>
      {loading ? (
        <GridDummy
          loading={props.loading}
          columnsNumber={showFields.length}
          hasCheckbox
          rowSteps={props.limit}
          renderHeader={() => (
            <BroadcastTableHeader
              selectAll={selectAll}
              hasResults={hasResults}
              selectAllCheckbox={selectAllCheckbox}
              showFields={showFields}
            />
          )}
        />
      ) : (
        <>
          <BroadcastTableHeader
            selectAll={selectAll}
            hasResults={hasResults}
            selectAllCheckbox={selectAllCheckbox}
            showFields={showFields}
          />
          {isFreePlan(currentPlan) ? (
            <SandboxTableBodyContent
              header={t("broadcast.grid.sandbox.header")}
              content={t("broadcast.grid.sandbox.content")}
            />
          ) : (
            <BroadcastTableBody
              selectedTimeZone={selectedTimeZone}
              selectedBroadcast={selectCampaignId}
              showFields={showFields}
              broadcastCampaigns={broadcastCampaign}
              hasResults={hasResults}
              handleCellSelected={handleCellSelected}
              loading={loading}
              batchPending={batchPending}
              companyChannels={companyChannels}
              deleteConfirmationRequested={props.deleteConfirmationRequested}
              requestDeleteConfirmation={props.requestDeleteConfirmation}
              updateCampaign={updateCampaign}
            />
          )}
        </>
      )}
    </Table>
  );
}
