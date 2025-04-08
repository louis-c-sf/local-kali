import React, { useEffect, useReducer, useState } from "react";
import { Dimmer, Pagination, Table } from "semantic-ui-react";
import "../../../style/css/broadcast-content.css";
import { useTranslation } from "react-i18next";
import GridDummy from "../../shared/Placeholder/GridDummy";
import {
  AllCheckableAction,
  AllCheckableState,
  createCheckAllReducer,
} from "../../../lib/reducers/checkAllReducer";
import { GridSelection } from "../../shared/grid/GridSelection";
import { BlastCampaignType } from "../../../api/Broadcast/Blast/BlastCampaignType";
import useRouteConfig from "../../../config/useRouteConfig";
import { Button } from "../../shared/Button/Button";
import { downloadBlastCampaignResults } from "../../../api/Broadcast/Blast/downloadBlastCampaignResults";
import Helmet from "react-helmet";
import GridHeader from "../../shared/grid/GridHeader";
import { fetchBlastCampaignList } from "../../../api/Broadcast/Blast/fetchBlastCampaignList";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { useHistory } from "react-router";
import EmptyContent from "../../EmptyContent";
import styles from "./BlastCampaignList.module.css";

const PAGE_SIZE = 30;

export function BlastCampaignList(props: {}) {
  const [loading, setLoading] = useState(false);
  const [exportLoadingId, setExportLoadingId] = useState<string | null>(null);
  const [results, setResults] = useState<BlastCampaignType[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);

  const checkAllReducer = createCheckAllReducer();
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const [checkState, checkDispatch] = useReducer<
    React.Reducer<AllCheckableState<string>, AllCheckableAction<string>>
  >(checkAllReducer, {
    checkableItems: {
      allChecked: false,
      allIds: [],
      checkedIds: [],
    },
  });
  const checkableItems = checkState.checkableItems;
  const selectAllCheckbox = checkableItems.allChecked;
  const hasResults = results.length > 0;

  const selectAll = () => {
    checkDispatch(
      selectAllCheckbox ? { type: "UNCHECKED_ALL" } : { type: "CHECKED_ALL" }
    );
  };

  function isChecked(id: string) {
    return checkableItems.checkedIds.includes(id);
  }

  function toggleItem(id: string) {
    if (isChecked(id)) {
      checkDispatch({ type: "UNCHECKED_ITEM", id });
    } else {
      checkDispatch({ type: "CHECKED_ITEM", id });
    }
  }

  function downloadCampaignRecipients(id: string) {
    return async () => {
      setExportLoadingId(id);
      await downloadBlastCampaignResults(id);
      setExportLoadingId(null);
    };
  }

  async function loadPage(page: number) {
    setPage(page);
    setLoading(true);
    try {
      const results = await fetchBlastCampaignList(
        PAGE_SIZE,
        (page - 1) * PAGE_SIZE
      );
      setResults([...results.blastMessageTemplates]);
      setTotalResults(results.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1);
  }, []);

  const pageTitle = t("nav.menu.campaigns");
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  function TODO() {
    //waits for deleting API
    return;
  }

  return (
    <div className="main">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <Dimmer.Dimmable
        dimmed
        className={"main-primary-column broadcast-content blast-campaigns"}
      >
        <GridHeader
          deleteLoading={false}
          onDeleteClick={TODO}
          selectedItemsCount={checkableItems.checkedIds.length}
          title={t("broadcast.blast.grid.header")}
          requestDeleteConfirmation={TODO}
          deleteConfirmationRequested={!TODO}
        >
          <Button
            primary
            content={t("broadcast.blast.actions.create")}
            onClick={() => {
              history.push(routeTo("/campaigns/blast/create"));
            }}
          />
        </GridHeader>
        <div className="hide-scrollable-table">
          <div className="stick-wrap">
            <Table sortable basic={"very"} className={styles.table}>
              {loading ? (
                <GridDummy
                  loading={loading}
                  columnsNumber={9}
                  hasCheckbox={false}
                  rowSteps={10}
                  renderHeader={() => (
                    <TableHeader
                      selectAll={selectAll}
                      hasResults={hasResults}
                      selectAllCheckbox={selectAllCheckbox}
                    />
                  )}
                />
              ) : (
                <>
                  <TableHeader
                    selectAll={selectAll}
                    hasResults={hasResults}
                    selectAllCheckbox={selectAllCheckbox}
                  />
                  <GridSelection
                    selectedItemsCount={checkableItems.checkedIds.length}
                    itemsSingular={t("broadcast.grid.header.singular")}
                    itemsPlural={t("broadcast.grid.header.plural")}
                    deleteConfirmationRequested={!TODO}
                  />
                  {!hasResults ? (
                    <Table.Body>
                      <tr>
                        <EmptyContent
                          header={t("broadcast.blast.empty.header")}
                          subHeader={t("broadcast.blast.empty.subHeader")}
                        />
                      </tr>
                    </Table.Body>
                  ) : (
                    <TableBody
                      results={results}
                      isChecked={isChecked}
                      toggleItem={toggleItem}
                      batchLoading={!TODO}
                      downloadRecipients={downloadCampaignRecipients}
                      loading={loading}
                      exportLoadingId={exportLoadingId}
                    />
                  )}
                </>
              )}
            </Table>
          </div>
        </div>
        {!loading && totalPages > 1 && (
          <footer className="footer">
            <Pagination
              activePage={page}
              onPageChange={(event, data) =>
                loadPage(Number(data.activePage ?? 1))
              }
              totalPages={totalPages}
              siblingRange={5}
            />
          </footer>
        )}
      </Dimmer.Dimmable>
    </div>
  );
}
