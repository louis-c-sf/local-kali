import React, { Reducer, useCallback, useEffect, useReducer } from "react";
import styles from "./CampaignDetails.module.css";
import "../../../style/css/broadcast-content.css";
import { PostLogin } from "../../Header";
import { useHistory, useLocation } from "react-router-dom";
import { useParams } from "react-router";
import { BriefData } from "./BriefData";
import {
  CampaignDetailsActionType,
  campaignDetailsDefaultState,
  campaignDetailsReducer,
  CampaignDetailsStateType,
} from "./campaignDetailsReducer";
import { CampaignDetailsContext } from "./CampaignDetailsContext";
import { fetchBroadcastCampaign } from "../../../api/Broadcast/fetchBroadcastCampaign";
import {
  BroadcastStatusAliasType,
  BroadcastStatusMap,
  FIELD_TYPE_CAMPAIGN,
} from "../../../types/BroadcastCampaignType";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { StatusTabs } from "./StatusTabs";
import { ContactsGrid } from "./ContactsGrid";
import { Pagination, Table } from "semantic-ui-react";
import GridDummy from "../../shared/Placeholder/GridDummy";
import { AddToListPopupGridAction } from "../../Contact/Lists/AddToListPopupGridAction";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { useSelectAllBehavior } from "../../../xstate/hooks/useSelectAllBehavior";
import { useFetchContactsPage } from "../../../api/Contacts/useFetchContactsPage";
import {
  getPageSize,
  isPageSelected,
  UpdatePageEvent,
} from "../../../xstate/selectAllIItemsMachine";
import { useContactsSearchFilter } from "../../../api/Contacts/useContactsSearchFilter";
import { TabMenu } from "../../shared/nav/TabMenu";
import { fetchBroadcastUsersStatus } from "../../../api/Broadcast/fetchBroadcastUsersStatus";
import { BackNavLink } from "../../shared/nav/BackNavLink";
import { fetchBroadcastStatisticsRealtime } from "api/Broadcast/fetchBroadcastStatisticsRealtime";

const PAGE_SIZE = 20;

function CampaignDetails() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const { listAdded, lists } = useImportedLists();

  const { state: locationState = { pageNumber: 1 } } = useLocation<{
    pageNumber?: number;
  }>();

  const { state: selectAllState, send: selectAllSend } = useSelectAllBehavior({
    selectAllCallback: async (context) => {
      const { totalResult, userProfileIds } = await selectAll();
      return {
        total: totalResult,
        targetIds: userProfileIds,
      };
    },
  });

  const [state, dispatch] = useReducer<
    Reducer<CampaignDetailsStateType, CampaignDetailsActionType>
  >(campaignDetailsReducer, campaignDetailsDefaultState());

  const { buildFilters } = useContactsSearchFilter(
    [],
    [],
    "",
    [],
    [],
    [
      {
        fieldType: FIELD_TYPE_CAMPAIGN,
        filterValue: [
          `${campaignId}`,
          `${BroadcastStatusMap[state.statusSelected]}`,
        ],
        filterCondition: "_",
        nextOperator: "And",
        fieldName: "_",
      },
    ]
  );

  const { fetchContactsPage, selectAll } = useFetchContactsPage(buildFilters);

  useEffect(() => {
    Promise.all([
      fetchBroadcastCampaign(campaignId),
      fetchBroadcastStatisticsRealtime(campaignId),
    ])
      .then(([campaignResponse, totalResponse]) => {
        dispatch({
          type: "BOOTED",
          campaign: campaignResponse,
          totals: totalResponse,
        });
      })
      .catch((e) => console.error(e));
  }, [campaignId]);

  useEffect(() => {
    loadPage(state.page, state.statusSelected);
  }, [state.statusSelected, state.page]);

  const loadPage = useCallback(
    async (page: number, status: BroadcastStatusAliasType) => {
      dispatch({ type: "PAGE_LOAD_START", status });
      try {
        const response = await fetchContactsPage(
          page,
          [],
          PAGE_SIZE,
          {},
          selectAllState.context.hasSelectedAll
        );

        const statusResponse = await fetchBroadcastUsersStatus(
          campaignId,
          BroadcastStatusMap[status],
          response.items.map((i) => i.id)
        );

        dispatch({
          type: "PAGE_LOADED",
          contacts: response.items,
          total: response.totalFiltered,
          status,
          contactStatusDetails: statusResponse,
        });

        let event: UpdatePageEvent = {
          type: "UPDATE_SELECTION",
          pageIds: response.items.map((i) => i.id),
          total: response.totalFiltered,
          totalUnfiltered: response.totalFiltered,
          targetIds: response.selectedIds ?? selectAllState.context.targetIds,
          pageSize: PAGE_SIZE,
          pageNumber: page,
          pagesCount: Math.ceil(response.totalFiltered / PAGE_SIZE),
        };
        // update state machine on external conditions changed
        selectAllSend(event);
      } catch (e) {
        console.error(e);
      } finally {
        dispatch({ type: "PAGE_LOAD_CANCEL" });
      }
    },
    [
      campaignId,
      fetchContactsPage,
      selectAllSend,
      selectAllState.context.hasSelectedAll,
    ]
  );

  const selectStatus = async (status: BroadcastStatusAliasType) => {
    dispatch({ type: "STATUS_SELECTED", status });
    selectAllSend({ type: "DESELECT_ALL" });
  };

  const totalPages = Math.ceil(
    (state.statusCount[state.statusSelected] ?? 0) / PAGE_SIZE
  );

  const hasMoreToSelect =
    isPageSelected(selectAllState) &&
    selectAllState.context.total > getPageSize(selectAllState);

  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Campaigns"} />
      <CampaignDetailsContext.Provider value={state}>
        <div className="main">
          <div className={styles.container}>
            <div className={styles.nav}>
              <div className={styles.back}>
                <BackNavLink
                  to={{
                    pathname: routeTo(`/campaigns`),
                    state: { pageNumber: locationState.pageNumber },
                  }}
                >
                  {t("nav.backShort")}
                </BackNavLink>
              </div>
              <div className={styles.navTabs}>
                <TabMenu
                  underscore={"thin"}
                  size={"large"}
                  items={[
                    {
                      content: t("broadcast.details.grid.header.recipient"),
                      active: true,
                      key: "recipients",
                    },
                    {
                      content: t("broadcast.details.grid.header.setting"),
                      key: "settings",
                      onClick: () =>
                        history.push(routeTo(`/campaigns/${campaignId}`)),
                    },
                  ]}
                />
              </div>
            </div>
            <div className={styles.brief}>
              <div className={styles.briefData}>
                <BriefData />
              </div>
              <div className={styles.tabs}>
                <StatusTabs onChange={selectStatus} />
              </div>
              <div className={styles.actions}>
                <AddToListPopupGridAction
                  appendNewList={listAdded}
                  selectAllIds={async () => {
                    return selectAllState.context.targetIds;
                  }}
                  importedLists={lists.map((list) => ({
                    id: list.id,
                    listName: list.importName,
                  }))}
                  selectedContactsCount={selectAllState.context.targetIdsCount}
                />
              </div>
            </div>
            <div className={styles.grid}>
              <div className={styles.gridContents}>
                {state.booted && !state.contactsPending && (
                  <ContactsGrid
                    deselectItem={(id) =>
                      selectAllSend({ type: "DESELECT", id: id })
                    }
                    togglePage={() => selectAllSend({ type: "TOGGLE_PAGE" })}
                    selectItem={(id) =>
                      selectAllSend({ type: "SELECT", id: id })
                    }
                    hasMoreToSelect={hasMoreToSelect}
                    onDeselectAll={() =>
                      selectAllSend({ type: "DESELECT_ALL" })
                    }
                    onSelectAll={() => selectAllSend({ type: "SELECT_ALL" })}
                    selectAllState={selectAllState}
                  />
                )}
                {state.contactsPending && (
                  <Table basic={"very"} className={"campaign-contacts-grid"}>
                    <GridDummy loading columnsNumber={6} hasCheckbox />
                  </Table>
                )}
              </div>
              <div className={styles.footer}>
                {state.booted && totalPages > 1 && (
                  <Pagination
                    totalPages={totalPages}
                    activePage={state.page}
                    disabled={state.contactsPending}
                    onPageChange={(event, data) => {
                      if (typeof data.activePage === "number") {
                        dispatch({
                          type: "PAGE_CHANGED",
                          number: data.activePage,
                        });
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CampaignDetailsContext.Provider>
    </div>
  );
}

export default CampaignDetails;
