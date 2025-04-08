import React, { useEffect, useState } from "react";
import BroadcastHeader from "../component/Broadcast/BroadcastHeader";
import BroadcastTableList from "../component/Broadcast/BroadcastTableList";
import { Dimmer, Pagination, PaginationProps } from "semantic-ui-react";
import {
  GET_BROADCAST,
  GET_BROADCAST_STATISTICS_WITH_TEMPLATE_ID,
  GET_BROADCAST_TOTAL,
} from "../api/apiPath";
import { get } from "../api/apiRequest";
import BroadcastCampaignType from "../types/BroadcastCampaignType";
import "../style/css/broadcast-content.css";
import Helmet from "react-helmet";
import { isFreePlan } from "../types/PlanSelectionType";
import { denormalizeBroadcastResponse } from "../component/Broadcast/denormalizeBroadcastResponse";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../AppRootContext";
import useCompanyChannels, {
  iconFactory,
} from "../component/Chat/hooks/useCompanyChannels";
import { ChannelConfiguredType } from "../component/Chat/Messenger/types";
import { BroadcastResponseType } from "../api/Broadcast/fetchBroadcastCampaign";

export default BroadcastContent;

function BroadcastContent() {
  const LIMIT = 10;

  const currentPlan = useAppSelector((s) => s.currentPlan);
  const loginDispatch = useAppDispatch();
  const [loading, isLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [selectedCampaignIds, setSelectedCampaignId] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [isBatchPending, setIsBatchPending] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const { t } = useTranslation();
  const companyChannels = [
    ...useCompanyChannels(),
    {
      type: "note",
      image: iconFactory("note"),
      name: t("broadcast.edit.field.channels.note"),
    } as ChannelConfiguredType<never>,
  ];
  const handlingPageChange = (e: React.MouseEvent, data: PaginationProps) => {
    setActivePage(Number(data.activePage) || activePage);
  };

  const getBroadcasts = async (page: number) => {
    isLoading(true);

    const params = {
      limit: LIMIT,
      offset: (page - 1) * LIMIT,
    };

    try {
      const result: BroadcastResponseType[] = await get(GET_BROADCAST, {
        param: params,
      });
      let broadcastCampaigns: BroadcastCampaignType[] = [];
      for (const response of result) {
        const statisticsData = await get(
          GET_BROADCAST_STATISTICS_WITH_TEMPLATE_ID.replace(
            "{id}",
            response.id
          ),
          { param: {} }
        );
        broadcastCampaigns = [
          ...broadcastCampaigns,
          denormalizeBroadcastResponse(
            response,
            companyChannels,
            statisticsData
          ),
        ];
      }

      loginDispatch({
        type: "UPDATE_BROADCAST",
        broadcastCampaign: broadcastCampaigns,
      });
    } catch (e) {
      console.error(e);
    } finally {
      isLoading(false);
    }
  };

  useEffect(() => {
    const getTotalBroadcast = async () => {
      try {
        const result = await get(GET_BROADCAST_TOTAL, { param: {} });
        const total = result.count / LIMIT;
        const numberOfPages =
          Math.round(total) + (total > Math.round(total) ? 1 : 0);
        if (
          total === 0 &&
          Cookies.get("isDisplayedCampaignGuide") === undefined
        ) {
          loginDispatch({
            type: "SHOW_CAMPAIGN_GUIDE",
          });
        }
        setTotalPages(numberOfPages === 0 ? activePage : numberOfPages);
        getBroadcasts(activePage);
      } catch (e) {
        setTotalPages(0);
        getBroadcasts(0);
      }
    };
    if (isFreePlan(currentPlan)) {
      setTotalPages(0);
      isLoading(false);
    } else {
      getTotalBroadcast();
    }
  }, [activePage]);

  const pageTitle = t("nav.menu.campaigns");

  return (
    <div className="main">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <Dimmer.Dimmable
        dimmed
        className={"main-primary-column broadcast-content"}
      >
        <BroadcastHeader
          selectedCampaignIds={selectedCampaignIds}
          updateSelectCampaignId={setSelectedCampaignId}
          batchPending={isBatchPending}
          setBatchPending={setIsBatchPending}
          deleteConfirmationRequested={deleteRequested}
          requestDeleteConfirmation={setDeleteRequested}
        />
        <div className="hide-scrollable-table">
          <div className="stick-wrap">
            <BroadcastTableList
              activePage={activePage}
              selectCampaignId={selectedCampaignIds}
              updateSelectCampaignId={setSelectedCampaignId}
              loading={loading}
              limit={LIMIT}
              batchPending={isBatchPending}
              companyChannels={companyChannels}
              deleteConfirmationRequested={deleteRequested}
              requestDeleteConfirmation={setDeleteRequested}
            />
          </div>
        </div>
        {!loading && totalPages > 1 && (
          <footer className="footer">
            <Pagination
              activePage={activePage}
              onPageChange={handlingPageChange}
              totalPages={totalPages}
              siblingRange={5}
            />
          </footer>
        )}
      </Dimmer.Dimmable>
    </div>
  );
}
