import React from "react";
import { NavLink } from "react-router-dom";
import { DELETE_BROADCASTS } from "../../api/apiPath";
import { deleteMethod } from "../../api/apiRequest";
import GridHeader, {
  DeleteConfirmationAwareType,
  ShowsDeleteConfirmationType,
} from "../shared/grid/GridHeader";
import { isFreePlan } from "../../types/PlanSelectionType";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";

export default BroadcastHeader;

function BroadcastHeader(
  props: {
    updateSelectCampaignId: Function;
    selectedCampaignIds: string[];
    batchPending: boolean;
    setBatchPending: (val: boolean) => any;
  } & DeleteConfirmationAwareType &
    ShowsDeleteConfirmationType
) {
  const [broadcastCampaign, currentPlan] = useAppSelector((s) => [
    s.broadcastCampaign,
    s.currentPlan,
  ]);
  const loginDispatch = useAppDispatch();
  const {
    updateSelectCampaignId,
    selectedCampaignIds,
    batchPending,
    setBatchPending,
    deleteConfirmationRequested,
    requestDeleteConfirmation,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const deleteCampaign = async () => {
    setBatchPending(true);
    try {
      await deleteMethod(DELETE_BROADCASTS, {
        param: {
          campaignIds: selectedCampaignIds,
        },
      });
      updateSelectCampaignId([]);
      if (broadcastCampaign) {
        loginDispatch({
          type: "UPDATE_BROADCAST",
          broadcastCampaign: broadcastCampaign.filter(
            (broadcast) => !selectedCampaignIds.includes(broadcast.id)
          ),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBatchPending(false);
    }
  };

  return (
    <GridHeader
      deleteLoading={batchPending}
      onDeleteClick={deleteCampaign}
      selectedItemsCount={selectedCampaignIds.length}
      title={t("broadcast.grid.header.defaultText")}
      onPlayClick={() => loginDispatch({ type: "SHOW_CAMPAIGN_GUIDE" })}
      requestDeleteConfirmation={requestDeleteConfirmation}
      deleteConfirmationRequested={deleteConfirmationRequested}
    >
      <InfoTooltip
        placement={"bottom"}
        children={t("broadcast.tooltip.action.create")}
        trigger={
          <NavLink
            to={routeTo("/campaigns/create")}
            className={`ui button primary ${
              isFreePlan(currentPlan) ? "disabled" : ""
            }`}
          >
            {t("broadcast.grid.button.create")}
          </NavLink>
        }
      />
    </GridHeader>
  );
}
