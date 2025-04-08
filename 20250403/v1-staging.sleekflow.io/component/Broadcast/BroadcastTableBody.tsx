import React, { useRef, useState } from "react";
import BroadcastCampaignType, {
  BroadcastCampaignResponseType,
} from "../../types/BroadcastCampaignType";
import { ChannelConfiguredType } from "../Chat/Messenger/types";
import { getWithExceptions, postWithExceptions } from "../../api/apiRequest";
import {
  GET_EXPORT_BROADCAST_BACKGROUND,
  POST_DUPLICATE_BROADCAST,
  POST_PAUSE_BROADCAST,
  POST_RESUME_BROADCAST,
} from "../../api/apiPath";
import { Table } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { denormalizeBroadcastResponse } from "./denormalizeBroadcastResponse";
import { useTranslation } from "react-i18next";
import EmptyContent from "../EmptyContent";
import useRouteConfig from "../../config/useRouteConfig";
import { GridSelection } from "../shared/grid/GridSelection";
import {
  DeleteConfirmationAwareType,
  ShowsDeleteConfirmationType,
} from "../shared/grid/GridHeader";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { BroadcastTableRow } from "./BroadcastTableRow";
import { useSignalRGroup } from "../SignalR/useSignalRGroup";
import { TaskResponseType } from "../Header/ProgressBar/types/TaskType";

export function BroadcastTableBody(
  props: {
    selectedTimeZone: number;
    selectedBroadcast: string[];
    showFields: string[];
    broadcastCampaigns: BroadcastCampaignType[] | undefined;
    hasResults: boolean;
    loading: boolean;
    handleCellSelected(e: React.MouseEvent, id: string): any;
    batchPending: boolean;
    companyChannels: ChannelConfiguredType<any>[];
    updateCampaign: (campaign: BroadcastCampaignType) => void;
  } & DeleteConfirmationAwareType &
    ShowsDeleteConfirmationType
) {
  const {
    batchPending,
    broadcastCampaigns,
    companyChannels,
    handleCellSelected,
    hasResults,
    selectedBroadcast,
    selectedTimeZone,
    showFields,
    deleteConfirmationRequested,
    updateCampaign,
  } = props;
  const [duplicateItemPending, setDuplicateItemPending] =
    useState<BroadcastCampaignType | null>(null);
  const loginDispatch = useAppDispatch();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const taskId = useRef();
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);

  const submitExportCsv = async (broadcastId: string, title: string) => {
    try {
      setLoadingCsv(true);
      const result = await getWithExceptions(
        GET_EXPORT_BROADCAST_BACKGROUND.replace(
          "{broadcastTemplateId}",
          broadcastId
        ),
        { param: {} }
      );
      if (result) {
        taskId.current = result.id;
      }
    } catch (e) {
      console.error("submitExportCsv", e);
    } finally {
      setLoadingCsv(false);
    }
  };

  async function handleDuplicateCampaign(campaign: BroadcastCampaignType) {
    setDuplicateItemPending(campaign);
    try {
      const newBroadcast: BroadcastCampaignResponseType =
        await postWithExceptions(
          POST_DUPLICATE_BROADCAST.replace("{broadcastId}", campaign.id),
          { param: {} }
        );

      loginDispatch({
        type: "BROADCAST_DUPLICATED",
        from: campaign,
        to: denormalizeBroadcastResponse(newBroadcast, companyChannels),
      });
    } catch (e) {
      console.error("handleDuplicateCampaign", e, { campaign });
    } finally {
      setDuplicateItemPending(null);
    }
  }

  async function handleTogglePause(id: string, on: boolean) {
    const campaignToUpdate = broadcastCampaigns?.find((c) => c.id === id);
    if (!campaignToUpdate) {
      return;
    }
    updateCampaign({ ...campaignToUpdate, isBroadcastOn: on });
    let result: BroadcastCampaignResponseType;
    try {
      if (on) {
        result = await postWithExceptions(
          POST_RESUME_BROADCAST.replace("{broadcastId}", id),
          { param: {} }
        );
        flash(t("flash.broadcast.resume.success"));
      } else {
        result = await postWithExceptions(
          POST_PAUSE_BROADCAST.replace("{broadcastId}", id),
          { param: {} }
        );
        flash(t("flash.broadcast.pause.success"));
      }
      if (result) {
        const updatedCampaign = denormalizeBroadcastResponse(
          result,
          companyChannels
        );
        updateCampaign(updatedCampaign);
      }
    } catch (e) {
      console.error(e);
      updateCampaign({ ...campaignToUpdate, isBroadcastOn: !on });
    }
  }

  const [loadingCsv, setLoadingCsv] = useState(false);

  function handleLoadCsv() {
    return loadingCsv
      ? undefined
      : (broadcast: BroadcastCampaignType, title: string) => {
          submitExportCsv(broadcast.id, title);
        };
  }

  useSignalRGroup(
    signalRGroupName,
    {
      OnBackgroundTaskStatusChange: [
        (state, task: TaskResponseType) => {
          if (
            task.isCompleted &&
            task.id === taskId.current &&
            task.result?.url
          ) {
            window.open(task.result?.url);
          }
        },
      ],
    },
    "BroadcastTableBody"
  );

  return (
    <>
      <GridSelection
        selectedItemsCount={selectedBroadcast.length}
        itemsSingular={t("broadcast.grid.header.singular")}
        itemsPlural={t("broadcast.grid.header.plural")}
        deleteConfirmationRequested={deleteConfirmationRequested}
      />
      <Table.Body>
        {hasResults &&
          broadcastCampaigns &&
          broadcastCampaigns.map((broadcast) => (
            <BroadcastTableRow
              key={`broadcast_${broadcast.id}`}
              onLoadCsv={handleLoadCsv()}
              broadcast={broadcast}
              selectedTimeZone={selectedTimeZone}
              showFields={showFields}
              batchPending={batchPending}
              handleCellSelected={handleCellSelected}
              handleDuplicateCampaign={handleDuplicateCampaign}
              handleTogglePause={handleTogglePause}
              selectedBroadcast={selectedBroadcast}
              duplicateItemPending={duplicateItemPending}
              loadingCsv={loadingCsv}
              companyChannels={companyChannels}
            />
          ))}

        {!hasResults && (
          <tr>
            <EmptyContent
              header={t("broadcast.empty.header")}
              subHeader={t("broadcast.empty.subHeader")}
              content={
                <ul>
                  <li>{t("broadcast.empty.item1")}</li>
                  <li>{t("broadcast.empty.item2")}</li>
                  <li>{t("broadcast.empty.item3")}</li>
                  <li>{t("broadcast.empty.item4")}</li>
                  <li>{t("broadcast.empty.item5")}</li>
                </ul>
              }
              actionContent={
                <Link
                  className="ui button primary"
                  to={routeTo("/campaigns/create")}
                >
                  {t("broadcast.grid.button.create")}
                </Link>
              }
            />
          </tr>
        )}
      </Table.Body>
    </>
  );
}
