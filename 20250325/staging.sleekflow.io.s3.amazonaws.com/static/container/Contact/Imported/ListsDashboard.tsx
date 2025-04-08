import React, { useEffect, useReducer, useState } from "react";
import { PostLogin } from "../../../component/Header";
import { Dimmer, Loader, Pagination, Table } from "semantic-ui-react";
import { NavLink, useHistory } from "react-router-dom";
import reducer, { defaultState } from "./reducer";
import { deleteMethod, postWithExceptions } from "../../../api/apiRequest";
import {
  DELETE_USER_PROFILE_GROUP,
  POST_BOOKMARK_USER_PROFILE_GROUP,
} from "../../../api/apiPath";
import "../../../style/css/import_contacts.css";
import Helmet from "react-helmet";
import GridHeader from "../../../component/shared/grid/GridHeader";
import { ContactsListsTable, TableHeader } from "./ContactListsTable";
import { CreateListPopup } from "../../../component/Contact/Lists/CreateListPopup";
import { UserProfileGroupType } from "./UserProfileGroupType";
import { useSignalRGroup } from "../../../component/SignalR/useSignalRGroup";
import GridDummy from "../../../component/shared/Placeholder/GridDummy";
import { Trans, useTranslation } from "react-i18next";
import EmptyContent from "../../../component/EmptyContent";
import { useLocation } from "react-router";
import useImportedLists from "./useImportedLists";
import useRouteConfig from "../../../config/useRouteConfig";
import { useAppSelector } from "../../../AppRootContext";
import { SearchForm } from "./ListsDashboard/SearchForm";
import { useFlashMessageChannel } from "../../../component/BannerMessage/flashBannerMessage";
import { useListsDashboardItemsProvider } from "container/Contact/Imported/ListsDashboard/useListsDashboardItemsProvider";

export const LIMIT = 20;

function ListsDashboard() {
  const user = useAppSelector((s) => s.user);
  const [state, dispatch] = useReducer(reducer, defaultState());
  const { loading, list, pagination } = state;
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmationRequested, setDeleteConfirmationRequested] =
    useState(false);
  const history = useHistory();
  const location = useLocation<{
    flashMessage: string;
  }>();
  const { refresh } = useImportedLists();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const items = useListsDashboardItemsProvider({
    dispatch,
  });

  useEffect(() => {
    if (location.state?.flashMessage) {
      flash(location.state.flashMessage);
    }
  }, []);

  useEffect(() => {
    items.fetch(1, "");
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("action") === "createList") {
      queryParams.delete("action");
      history.replace({
        pathname: location.pathname,
        search: String(queryParams),
      });
      setShowModal(true);
    }
  }, []);

  async function deleteBatch() {
    const deleteIds = state.checkedIds;

    try {
      return await deleteMethod(DELETE_USER_PROFILE_GROUP, {
        param: {
          ListIds: deleteIds,
        },
      });
    } catch (e) {
      dispatch({ type: "ERROR", error: e });
      console.error(e);
    }
  }

  useEffect(() => {
    if (!state.batchOperationInProgress) {
      return;
    }

    deleteBatch().then(() => {
      dispatch({ type: "BATCH_DELETE_END" });
      refresh();
      items.fetch(pagination.page, state.search.query);
    });
  }, [
    pagination.page,
    JSON.stringify(state.batchItems),
    state.batchOperationInProgress,
  ]);

  useSignalRGroup(
    user?.signalRGroupName,
    {
      OnImportCompleted: [
        (state, list: UserProfileGroupType) => {
          dispatch({ type: "LIST_STATUS_UPDATE", list });
        },
      ],
    },
    "ListsDashboard"
  );

  async function sendBookmark(list: UserProfileGroupType) {
    const payload = [{ listId: list.id, isbookmark: !list.isBookmarked }];
    dispatch({
      type: "BOOKMARK_STARTED",
      listId: list.id,
    });
    try {
      await postWithExceptions(POST_BOOKMARK_USER_PROFILE_GROUP, {
        param: payload,
      });
      dispatch({
        type: "BOOKMARK_COMPLETED",
      });
      await items.fetch(state.pagination.page, state.search.query);
    } catch (e) {
      console.error("#sendBookmark", e, list);
      dispatch({
        type: "BOOKMARK_RESET",
        listId: list.id,
      });
    }
  }

  const pageName = t("nav.menu.lists");
  const performSearch = (searchValue: string) => {
    items.fetch(1, searchValue);
  };

  const resetSearch = () => {
    dispatch({ type: "SEARCH_RESET" });
    items.fetch(1, "");
  };

  return (
    <div className="post-login">
      <Helmet title={t("nav.common.title", { page: pageName })} />
      <PostLogin selectedItem={"Contacts"}>
        <div className="main contact-lists">
          <Dimmer active={loading} inverted>
            <Loader active={true} />
          </Dimmer>
          <div className="contact-lists-imported main-primary-column">
            <GridHeader
              deleteConfirmationRequested={deleteConfirmationRequested}
              requestDeleteConfirmation={setDeleteConfirmationRequested}
              deleteLoading={state.batchOperationInProgress}
              onDeleteClick={() => dispatch({ type: "BATCH_DELETE_START" })}
              selectedItemsCount={state.checkedIds.length}
              title={
                <div className={"title-counted"}>
                  {t("profile.lists.grid.header.defaultText")}
                  {state.pagination.itemsCount > 0 && (
                    <div className="counter">{state.pagination.itemsCount}</div>
                  )}
                </div>
              }
              actionsPosition={"bottom"}
              afterMainRow={
                <SearchForm
                  placeholder={t(
                    "profile.lists.grid.header.search.placeholder"
                  )}
                  submittable={
                    loading ||
                    state.search.activeQuery === undefined ||
                    state.search.query !== state.search.activeQuery
                  }
                  loading={loading}
                  value={state.search.query}
                  onSearch={(value) => performSearch(value)}
                  onReset={resetSearch}
                  onChange={(text) => {
                    dispatch({ type: "SEARCH_TYPED", text });
                  }}
                />
              }
              batchButtons={
                <NavLink
                  className={"ui button"}
                  to={{
                    pathname: routeTo(`/campaigns/create`),
                    state: { matchedListIds: state.checkedIds },
                  }}
                >
                  {t("profile.lists.button.createCampaign")}
                </NavLink>
              }
            >
              <NavLink to={routeTo("/contacts/import")} className={"ui button"}>
                {t("profile.contacts.button.import")}
              </NavLink>
              <CreateListPopup
                onComplete={(listId) => {
                  history.push(routeTo(`/contacts/lists/${listId}`));
                }}
                showModal={showModal}
                setShowModal={setShowModal}
              />
            </GridHeader>

            <section className="hide-scrollable-table">
              <div className="stick-wrap">
                {state.mounting ? (
                  <Table
                    className={"imported-contacts-table dnd"}
                    basic={"very"}
                  >
                    <GridDummy
                      loading
                      hasCheckbox
                      columnsNumber={9}
                      rowSteps={5}
                      renderHeader={() => (
                        <TableHeader
                          checked={false}
                          hasResults={false}
                          dispatch={() => undefined}
                        />
                      )}
                    />
                  </Table>
                ) : (
                  <ContactsListsTable
                    list={list}
                    checkedIds={state.checkedIds}
                    batchItems={state.batchItems}
                    batchOperationToggleChecked={
                      state.batchOperationToggleChecked
                    }
                    dispatch={dispatch}
                    exportingId={state.exportId}
                    handleBookmark={sendBookmark}
                    emptyContent={
                      <EmptyContactListContent
                        openModal={() => setShowModal(true)}
                      />
                    }
                    deleteConfirmationRequested={deleteConfirmationRequested}
                  />
                )}
              </div>
            </section>
            {pagination.pagesCount > 1 && (
              <footer className="footer">
                <Pagination
                  activePage={pagination.page}
                  onPageChange={(_, data) => {
                    items.fetch(data.activePage as number, state.search.query);
                  }}
                  totalPages={pagination.pagesCount}
                  siblingRange={5}
                />
              </footer>
            )}
          </div>
        </div>
      </PostLogin>
    </div>
  );
}

function EmptyContactListContent(props: { openModal: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyContent
      header={t("profile.lists.empty.header")}
      subHeader={
        <Trans i18nKey={"profile.lists.empty.subHeader"}>
          Create a list of contacts based on column values, labels
          <br />
          and other characteristics. Some use cases include:
        </Trans>
      }
      content={
        <ul>
          <li>{t("profile.lists.empty.item1")}</li>
          <li>{t("profile.lists.empty.item2")}</li>
          <li>{t("profile.lists.empty.item3")}</li>
          <li>{t("profile.lists.empty.item4")}</li>
          <li>{t("profile.lists.empty.item5")}</li>
        </ul>
      }
      actionContent={
        <div onClick={props.openModal} className="ui button primary">
          {t("profile.lists.empty.button.createList")}
        </div>
      }
    />
  );
}

export default ListsDashboard;
